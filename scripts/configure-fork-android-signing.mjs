/** Configure the Expo-generated Android project for independent fork signing. */
import { readFileSync, writeFileSync } from "node:fs";

const buildFile = process.argv[2];
if (!buildFile) throw new Error("Expected path to Android app/build.gradle");
let gradle = readFileSync(buildFile, "utf8");
const releaseSigning = /(release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;
if (!releaseSigning.test(gradle)) {
  throw new Error("Expected debug-signed release buildType in Expo's Gradle template.");
}
const entry = "signingConfigs {";
if (gradle.split(entry).length !== 2) {
  throw new Error("Expected one Android signingConfigs block.");
}
const forkConfig = `signingConfigs {
        forkRelease {
            storeFile file('fork-release.p12')
            storeType 'PKCS12'
            storePassword System.getenv('RAKAZO_FORK_KEYSTORE_PASSWORD')
            keyAlias 'rakazofork'
            keyPassword System.getenv('RAKAZO_FORK_KEYSTORE_PASSWORD')
        }`;
gradle = gradle.replace(entry, forkConfig);
gradle = gradle.replace(releaseSigning, "$1signingConfig signingConfigs.forkRelease");
writeFileSync(buildFile, gradle);
