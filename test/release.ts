/** The version of the newest `## [x.y.z]` entry in a Keep a Changelog file. */
export function newestChangelogVersion(changelog: string): string | undefined {
  return /^## \[([^\]]+)\]/m.exec(changelog)?.[1];
}

/**
 * Why a release's versions disagree, or `undefined` when package, manifest and
 * changelog all name the same one.
 */
export function versionMismatch(versions: {
  packageJson: string;
  manifest: string;
  changelog: string | undefined;
}): string | undefined {
  const { packageJson, manifest, changelog } = versions;
  if (packageJson !== manifest) {
    return `package.json says ${packageJson} but public/manifest.json says ${manifest}`;
  }
  if (changelog !== packageJson) {
    return `CHANGELOG.md's newest entry is ${changelog ?? "missing"} but the release is ${packageJson}`;
  }
  return undefined;
}
