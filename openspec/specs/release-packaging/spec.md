# release-packaging Specification

## Purpose
Turns the source tree into the zip the Chrome Web Store accepts, and keeps the version the store sees equal to the version the repository records.

## Requirements

### Requirement: Package the extension for the store
`npm run package` SHALL build the extension and write `parkd-<version>.zip`, with `manifest.json` at the archive root and only the build output inside.

#### Scenario: Fresh package
- **WHEN** a maintainer runs `npm run package` on a clean checkout at version 0.1.0
- **THEN** `parkd-0.1.0.zip` exists at the repository root
- **AND** its root holds `manifest.json`, `background.js`, `list.html` and `transfer.html`

#### Scenario: Only build output
- **WHEN** the zip is listed
- **THEN** every entry is a file from `dist/`
- **AND** no entry is a source map, a TypeScript file or a dotfile

#### Scenario: Same input, same zip
- **WHEN** `npm run package` runs twice on the same commit
- **THEN** both zips have the same bytes

#### Scenario: Zip stays out of git
- **WHEN** `git status` runs after packaging
- **THEN** the zip is not listed

### Requirement: One version across the release
The test suite SHALL fail unless `package.json`, `public/manifest.json` and the newest `CHANGELOG.md` entry name the same version.

#### Scenario: Versions match
- **WHEN** all three name 0.1.0
- **THEN** `npm test` passes

#### Scenario: Manifest bumped alone
- **WHEN** `public/manifest.json` says 0.2.0 and `package.json` says 0.1.0
- **THEN** `npm test` fails and names both versions

#### Scenario: Changelog not updated
- **WHEN** both files say 0.2.0 and the newest changelog entry is 0.1.0
- **THEN** `npm test` fails and names the changelog
