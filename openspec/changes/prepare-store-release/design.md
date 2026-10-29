# Design

Motivation: see proposal.md. Behavior: see specs/release-packaging/spec.md. Each decision below is a short ADR.

## 1. Zip written by a Node script, no new dependency

**Context.** The store takes a zip with `manifest.json` at its root. Node 24 ships `zlib.deflateRawSync` and `zlib.crc32`, and runs `.ts` files directly. The `zip` CLI is on Linux runners but not on every contributor's machine.

**Decision.** `scripts/package.ts` reads `dist/` recursively, sorts the paths, refuses `.map` files and dotfiles, and writes `parkd-<version>.zip` (version from `package.json`) with a fixed 1980-01-01 timestamp on every entry. `npm run package` is `npm run build && node scripts/package.ts`. `tsconfig.node.json` includes `scripts`. CI runs `npm run package` in place of `npm run build`.

**Consequences.** Same commit, same bytes. No dependency to audit. CI proves the package step works on every pull request. `*.zip` is already in `.gitignore`.

**Alternatives.** `zip -r` in an npm script: platform-dependent, and it stamps file times, so zips differ. An npm zip library: a dependency for 60 lines of code.

## 2. Versions checked by a test, not generated

**Context.** The version lives in `package.json` and `public/manifest.json`, and from now on in `CHANGELOG.md`.

**Decision.** `test/release.test.ts` reads all three and fails, naming each value, when they differ. The newest changelog entry is the first `## [x.y.z]` heading.

**Consequences.** A release bump edits three files, and CI refuses one that misses any. The build stays a plain copy of `public/`.

**Alternatives.** A Vite plugin that writes the version into the manifest: one source of truth, but `public/manifest.json` would no longer be the manifest Chrome loads, and the changelog would still need a check.

## 3. Store material in `store/`, privacy policy at the root

**Context.** The dashboard asks for a description, a single-purpose statement, one reason per permission, data-use answers, a privacy policy URL, 1280×800 screenshots and a 440×280 promo tile. None of it ships in the zip.

**Decision.** `store/listing.md` holds every text field, worded for parkd and checked against the README. `store/screenshots/` holds two 1280×800 PNGs of the list page and the import/export page, filled with `example.com`-style sample tabs. `store/promo-small.png` is the icon and the name on a plain background. `store/README.md` says how each image was made. `PRIVACY.md` sits at the root so its GitHub URL is short and stable.

**Consequences.** The listing is reviewed in pull requests like code. Images show no real browsing data.

**Alternatives.** Keep the listing only in the dashboard: no history, no review, easy to drift from the README.

## 4. Images made locally with tools already present

**Context.** The 128px icon artwork fills its canvas; store guidance asks for 96×96 artwork with 16px transparent padding. ImageMagick and Chrome are on the maintainer's machine; no image tool is in `package.json`.

**Decision.** Re-render `public/icons/128.png` with ImageMagick: scale the current artwork to 96×96 and center it on a transparent 128×128 canvas. 16px and 48px icons stay as they are. Screenshots come from the built extension in headless Chrome, captured once. The promo tile is drawn as an SVG in `store/` and rendered with ImageMagick.

**Consequences.** No new dependency. Images are committed outputs; regenerating them is a documented manual step, not a build step.

**Alternatives.** A Playwright script in the repo: reproducible, but a large dev dependency for images that change rarely.

## 5. Contributor files point at GitHub, not at an email

**Context.** A Code of Conduct, security policy and privacy policy each need a contact. The maintainer chose not to publish an email.

**Decision.** `SECURITY.md` and the conduct contact use GitHub private vulnerability reporting; privacy questions go to GitHub issues. `CODE_OF_CONDUCT.md` adopts the Contributor Covenant 2.1 with its attribution. `CONTRIBUTING.md` describes the spec-first flow from `AGENTS.md` and the simplicity rule. Issue templates cover bugs and feature ideas; the feature template asks how the idea serves the core loop. The PR template asks for the OpenSpec change name, tests run, and any permission added. `.github/dependabot.yml` checks npm and GitHub Actions weekly. `CHANGELOG.md` follows Keep a Changelog with one `0.1.0` entry.

**Consequences.** Private reporting must be switched on in the repository settings before the links work; that is a follow-up, outside this change.

**Alternatives.** An email contact: rejected by the maintainer.
