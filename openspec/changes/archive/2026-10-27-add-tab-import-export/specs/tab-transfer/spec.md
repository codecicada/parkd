# Spec Delta

## Purpose

Lets a user move parked tabs in and out of parkd as plain text, one `URL | title` per line, so a list can be backed up, moved, or brought over from another tab saver.

## ADDED Requirements

### Requirement: Import and export page
An import/export page SHALL be reachable from a link in the list page header.

#### Scenario: Open from the list
- **GIVEN** the list page is open
- **WHEN** the user follows the "Import / export" link
- **THEN** the import/export page is shown

### Requirement: Text format
Each tab SHALL be one line, `URL | title`. A blank line SHALL separate groups.

#### Scenario: Two groups
- **GIVEN** the text `https://a.test/ | A`, `https://b.test/ | B`, a blank line, `https://c.test/ | C`
- **WHEN** it is imported
- **THEN** two groups are stored: one with A and B, one with C

### Requirement: Export all parked tabs
The page SHALL show every parked tab in the text format, groups newest first and tabs in saved order, and SHALL offer to copy that text.

#### Scenario: Export
- **GIVEN** a group saved yesterday with tab A and a group saved today with tabs B and C
- **WHEN** the import/export page is opened
- **THEN** the export text is `B` and `C` lines, a blank line, then the `A` line

#### Scenario: Title with a line break
- **GIVEN** a parked tab whose title contains a line break
- **WHEN** it is exported
- **THEN** the line break becomes a space and the tab stays on one line

#### Scenario: Copy
- **WHEN** the user clicks Copy
- **THEN** the export text is on the clipboard

#### Scenario: Nothing parked
- **GIVEN** no parked tabs
- **WHEN** the page is opened
- **THEN** the export text is empty and the page says nothing is parked

### Requirement: Import adds new groups
Importing SHALL add each block of lines as a new group, dated at import, and SHALL leave existing groups unchanged.

#### Scenario: Import next to existing groups
- **GIVEN** one parked group
- **WHEN** the user imports text with two blocks
- **THEN** three groups are parked, and the two imported ones appear in the list in the text's order

#### Scenario: Duplicates are kept
- **GIVEN** `https://a.test/` is already parked
- **WHEN** text containing `https://a.test/` is imported
- **THEN** it is parked a second time

### Requirement: Lenient line parsing
Import SHALL split each line on its first ` | `, trim whitespace, accept `\n` and `\r\n` endings, and use the URL as title when none is given.

#### Scenario: URL without title
- **WHEN** the line `https://a.test/` is imported
- **THEN** a tab with URL and title `https://a.test/` is stored

#### Scenario: Title containing the separator
- **WHEN** the line `https://a.test/ | A | B` is imported
- **THEN** the title is `A | B`

#### Scenario: Several blank lines
- **WHEN** two blocks separated by three blank lines are imported
- **THEN** two groups are stored and no empty group

### Requirement: Only safe URLs import
Only lines whose URL uses `http`, `https`, `file` or `ftp` SHALL import. Other lines SHALL be skipped, without stopping the import.

#### Scenario: Mixed lines
- **WHEN** text with `https://a.test/`, `javascript:alert(1)`, `chrome://settings/`, `not a url` and `ftp://b.test/` is imported
- **THEN** the a and b tabs are stored and three lines are skipped

#### Scenario: A block with no valid line
- **WHEN** a block contains only skipped lines
- **THEN** no group is stored for it

### Requirement: Import report
After an import the page SHALL state how many tabs and groups were imported and how many lines were skipped.

#### Scenario: Report
- **WHEN** an import stores 2 tabs in 1 group and skips 3 lines
- **THEN** the page says 2 tabs in 1 group were imported and 3 lines were skipped

#### Scenario: Nothing valid
- **WHEN** the imported text has no valid line
- **THEN** nothing is stored and the page says nothing was imported

### Requirement: Local only
Import and export SHALL NOT need a new browser permission and SHALL NOT make a network request.

#### Scenario: Import and export offline
- **WHEN** the user imports or exports
- **THEN** no network request is made and the extension requests only `tabs` and `storage`
