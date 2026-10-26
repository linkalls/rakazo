import { afterEach, describe, expect, it } from "vitest";
import appConfig from "../app.config";
import appJson from "../app.json";

const originalForkFlag = process.env.RAKAZO_FORK_APK;
const originalVersionCode = process.env.RAKAZO_FORK_VERSION_CODE;

afterEach(() => {
  if (originalForkFlag === undefined) delete process.env.RAKAZO_FORK_APK;
  else process.env.RAKAZO_FORK_APK = originalForkFlag;
  if (originalVersionCode === undefined) delete process.env.RAKAZO_FORK_VERSION_CODE;
  else process.env.RAKAZO_FORK_VERSION_CODE = originalVersionCode;
});

describe("independent fork Android APK config", () => {
  it("uses a different package and signing identity without inheriting original OTA updates", () => {
    process.env.RAKAZO_FORK_APK = "1";
    process.env.RAKAZO_FORK_VERSION_CODE = "1009";
    const config = appConfig({
      config: appJson.expo as never,
      projectRoot: ".",
      staticConfigPath: "app.json",
      packageJsonPath: "package.json",
    });
    expect(config.name).toBe("Rakazo Fork");
    expect(config.slug).toBe("rakazo-fork");
    expect(config.scheme).toBe("rakazofork");
    expect(config.icon).toBe("./assets/fork-icon.png");
    expect(config.android?.adaptiveIcon?.foregroundImage).toBe("./assets/fork-adaptive-icon.png");
    expect(config.android?.adaptiveIcon?.monochromeImage).toBe("./assets/fork-monochrome-icon.png");
    expect(config.android?.package).toBe("com.linkalls.rakazo.fork");
    expect(config.android?.versionCode).toBe(1009);
    expect(config.updates?.enabled).toBe(false);
    expect(config.updates?.url).toBeUndefined();
    expect(config.extra?.eas).toBeUndefined();
    expect(config.owner).toBeUndefined();
  });

  it("preserves the original Android application settings by default", () => {
    delete process.env.RAKAZO_FORK_APK;
    const config = appConfig({
      config: appJson.expo as never,
      projectRoot: ".",
      staticConfigPath: "app.json",
      packageJsonPath: "package.json",
    });
    expect(config.android?.package).toBe("com.rakazo.app");
    expect(config.updates?.url).toContain("u.expo.dev");
  });
});
