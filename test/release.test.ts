import { describe, expect, it } from "vitest";
import changelog from "../CHANGELOG.md?raw";
import packageJson from "../package.json?raw";
import manifest from "../public/manifest.json?raw";
import { newestChangelogVersion, versionMismatch } from "./release";

const versionOf = (json: string) => (JSON.parse(json) as { version: string }).version;

describe("release versions", () => {
  it("agree across package.json, the manifest and the changelog", () => {
    expect(
      versionMismatch({
        packageJson: versionOf(packageJson),
        manifest: versionOf(manifest),
        changelog: newestChangelogVersion(changelog),
      }),
    ).toBeUndefined();
  });
});

describe("versionMismatch", () => {
  it("accepts one version everywhere", () => {
    expect(versionMismatch({ packageJson: "0.1.0", manifest: "0.1.0", changelog: "0.1.0" })).toBeUndefined();
  });

  it("names both versions when the manifest is bumped alone", () => {
    const message = versionMismatch({ packageJson: "0.1.0", manifest: "0.2.0", changelog: "0.1.0" });
    expect(message).toContain("0.1.0");
    expect(message).toContain("0.2.0");
  });

  it("names the changelog when it lags", () => {
    const message = versionMismatch({ packageJson: "0.2.0", manifest: "0.2.0", changelog: "0.1.0" });
    expect(message).toContain("CHANGELOG.md");
    expect(message).toContain("0.1.0");
  });

  it("names the changelog when it has no entry", () => {
    expect(versionMismatch({ packageJson: "0.1.0", manifest: "0.1.0", changelog: undefined })).toContain(
      "CHANGELOG.md",
    );
  });
});

describe("newestChangelogVersion", () => {
  it("reads the first entry heading", () => {
    expect(newestChangelogVersion("# Changelog\n\n## [0.2.0] - 2026-11-01\n\n## [0.1.0] - 2026-10-28\n")).toBe(
      "0.2.0",
    );
  });

  it("returns undefined without an entry", () => {
    expect(newestChangelogVersion("# Changelog\n")).toBeUndefined();
  });
});
