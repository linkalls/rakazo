import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.resolve(import.meta.dirname, "../../../.github/workflows/release-android-apk.yml"),
  "utf8",
);
const easConfig = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../eas.json"), "utf8"),
) as {
  build: Record<
    string,
    { extends?: string; channel?: string; environment?: string; android?: { buildType?: string } }
  >;
};

describe("Android APK release workflow", () => {
  it("only runs on demand from main with release credentials", () => {
    expect(workflow).toMatch(/^on:\n {2}workflow_dispatch:\n\n/m);
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).not.toContain("cache: pnpm");
  });

  it("pins every third-party action to an immutable commit", () => {
    const actionReferences = [...workflow.matchAll(/uses:\s+([^\s#]+)/g)].map((match) => match[1]);
    expect(actionReferences.length).toBeGreaterThan(0);
    for (const reference of actionReferences) {
      expect(reference, reference).toMatch(/@[0-9a-f]{40}$/);
    }
  });

  it("builds signed APKs on the original or isolated fork channel without replacing the latest desktop release", () => {
    expect(easConfig.build["android-apk"]).toEqual({
      extends: "production",
      android: { buildType: "apk" },
      environment: "production",
    });
    // The original release keeps its production channel and the fork uses a distinct channel.
    expect(easConfig.build["fork-android-apk"]).toEqual({
      extends: "android-apk",
      channel: "fork",
    });
    expect(workflow).toContain("github.event.repository.fork");
    expect(workflow).toContain("'fork-android-apk' || 'android-apk'");
    expect(workflow).toContain('--profile "$EAS_BUILD_PROFILE"');
    expect(workflow).toContain("--latest=false");
    expect(workflow).not.toContain("gh release delete");
    const appConfig = readFileSync(path.resolve(import.meta.dirname, "../app.config.ts"), "utf8");
    // Every profile that publishes a signed APK must enforce the production HTTPS API URL.
    expect(appConfig).toContain('"android-apk"');
    expect(appConfig).toContain('"fork-android-apk"');
  });
});
