import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.resolve(import.meta.dirname, "../../../.github/workflows/release-android-apk.yml"),
  "utf8",
);

describe("independent Android fork APK workflow", () => {
  it("is a manual fork-only build with no EAS Cloud or upstream credentials", () => {
    expect(workflow).toMatch(/^on:\n {2}workflow_dispatch:\n\n/m);
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toContain("github.repository == 'linkalls/rakazo'");
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).not.toContain("eas build");
    expect(workflow).not.toContain("EXPO_TOKEN");
    expect(workflow).not.toContain("expo/expo-github-action");
  });

  it("pins third-party actions to immutable commits", () => {
    const refs = [...workflow.matchAll(/uses:\s+([^\s#]+)/g)].map((match) => match[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(ref).toMatch(/@[0-9a-f]{40}$/);
  });

  it("signs from fixed private fork secrets and publishes an independent APK", () => {
    expect(workflow).toContain("RAKAZO_FORK_APK");
    expect(workflow).toContain("prebuild --platform android");
    expect(workflow).toContain(":app:assembleRelease");
    expect(workflow).toContain("FORK_ANDROID_KEYSTORE_B64");
    expect(workflow).toContain("FORK_ANDROID_KEYSTORE_PASSWORD");
    expect(workflow).toContain("configure-fork-android-signing.mjs");
    expect(workflow).toContain("fork-android");
    expect(workflow).toContain("rakazo-fork.apk");
    expect(workflow).toContain("--latest=false");
  });
});
