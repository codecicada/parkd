# Tasks

## 1. Package script (`scripts/package.ts`, `package.json`, CI)

- [ ] 1.1 Write `scripts/package.ts`: walk `dist/`, sort paths, fail on `.map` or dotfiles, write `parkd-<version>.zip` using `crc32` and `deflateRawSync` from `node:zlib` and a fixed 1980-01-01 timestamp. Add `"package": "npm run build && node scripts/package.ts"`; add `scripts` to `tsconfig.node.json`. Accept: `npm run package` writes `parkd-0.1.0.zip`; `unzip -l` shows `manifest.json`, `background.js`, `list.html`, `transfer.html` at the root and no `.map`; `npm run typecheck` passes.
- [ ] 1.2 Check determinism and git hygiene. Accept: two runs give the same `sha256sum`; `git status --porcelain` does not list the zip; `unzip -t` reports no errors.
- [ ] 1.3 Replace `npm run build` with `npm run package` in `.github/workflows/ci.yml`. Accept: the workflow file names `npm run package`; CI is green on the pull request.
- [ ] 1.4 Add a "Package for the store" line to the README build section. Accept: README shows `npm run package` and the zip name.

## 2. Version check (`test/release.test.ts`, `CHANGELOG.md`)

- [ ] 2.1 Write `CHANGELOG.md` in Keep a Changelog form with a `## [0.1.0]` entry listing save, restore, reorder, import/export. Accept: first `## [` heading is `0.1.0`.
- [ ] 2.2 Write `test/release.test.ts` reading `package.json`, `public/manifest.json` and the first changelog heading; split the comparison into a pure function and test it with matching and mismatched inputs. Accept: `npm test` passes; the mismatch tests assert the message names both versions, and names the changelog when it lags.

## 3. Store material (`PRIVACY.md`, `store/`, icon)

- [ ] 3.1 Write `PRIVACY.md`: what is stored (URL, title, park date of parked tabs) in `chrome.storage.local`, nothing sent anywhere, no analytics, how to delete (delete groups, or remove the extension), questions via GitHub issues. Accept: each claim matches `src/` (no `fetch`, storage only in `src/chrome/store.ts`) and the README permissions table.
- [ ] 3.2 Write `store/listing.md`: name, short and detailed description, category Productivity, single-purpose statement, one justification per permission (`tabs`, `storage`), data-use answers, privacy policy URL `https://github.com/codecicada/parkd/blob/main/PRIVACY.md`. Accept: short description ≤132 characters; permissions match `public/manifest.json`; no wording taken from another extension.
- [ ] 3.3 Re-render `public/icons/128.png` with ImageMagick: artwork at 96×96 centered on a transparent 128×128 canvas. Accept: `magick identify` reports 128×128; the 16px border is fully transparent; `npm run build` copies it.
- [ ] 3.4 Capture `store/screenshots/list.png` and `store/screenshots/transfer.png` at 1280×800 from the built extension in headless Chrome, seeded with sample `example.com`/`example.org` tabs. Accept: `magick identify` reports 1280×800 for both; no real URL appears.
- [ ] 3.5 Draw `store/promo-small.svg` (icon and name) and render `store/promo-small.png` at 440×280. Accept: `magick identify` reports 440×280.
- [ ] 3.6 Write `store/README.md`: what each file is for, how each image was made, how to upload. Link `PRIVACY.md` from the README. Accept: every file in `store/` is named in it; README links resolve.

## 4. Contributor files (root, `.github/`)

- [ ] 4.1 Write `CONTRIBUTING.md`: spec-first OpenSpec flow, simplicity and least-permission rules, local-only rule, `npm ci`/`npm test`/`npm run typecheck`/`npm run package`. Accept: every command runs as written.
- [ ] 4.2 Write `SECURITY.md` pointing to GitHub private vulnerability reporting, and `CODE_OF_CONDUCT.md` adopting Contributor Covenant 2.1 with attribution and the same contact. Accept: no email address in either file.
- [ ] 4.3 Add `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md` (asks how the idea serves save, restore or import/export) and `.github/pull_request_template.md` (OpenSpec change, tests run, permissions added). Accept: files have valid front matter (`name`, `about`).
- [ ] 4.4 Add `.github/dependabot.yml` for `npm` and `github-actions`, weekly. Accept: file has `version: 2` and one `updates` entry per ecosystem; Dependabot shows no config error on GitHub after merge.

## 5. Integration check

- [ ] 5.1 Load the unzipped `parkd-0.1.0.zip` in headless Chrome: park, restore, open import/export; confirm the 128px icon renders. Accept: all work; result noted in the PR.
- [ ] 5.2 Confirm `dist/manifest.json` lists only `tabs` and `storage`, and the community profile lists code of conduct, contributing, templates. Accept: `node -e` prints the two permissions; `gh api repos/codecicada/parkd/community/profile` shows the files after merge (noted, not blocking).

## Workflow follow-up

- Open the pull request, verify CI green against the head SHA, archive the change, verify the apply, merge only on explicit request.
- After merge, in GitHub settings: enable private vulnerability reporting, protect `main`, add topics. Tag `v0.1.0` and upload the zip to the store on the maintainer's call.
