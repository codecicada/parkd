# tab-parking Specification

## Purpose
Lets a user park the open tabs of a window in a local list, closing them, and later restore or discard them from one list page.

## Requirements

### Requirement: Park a window from the toolbar
Clicking the toolbar icon SHALL save the window's parkable tabs as one new group, close those tabs, and show the list page in that window.

#### Scenario: Window with parkable tabs
- **GIVEN** a window with three parkable tabs
- **WHEN** the user clicks the toolbar icon
- **THEN** a new group holding those three tabs, in window order, is stored
- **AND** the three tabs are closed
- **AND** the window stays open, showing the list page

#### Scenario: Group records when it was saved
- **WHEN** a group is saved
- **THEN** it records the date and time of the save, and each tab's URL and title

### Requirement: Skip tabs that are not parkable
Pinned tabs and browser-internal pages SHALL NOT be parked; they stay open.

#### Scenario: Pinned tab
- **GIVEN** a window with one pinned tab and two other parkable tabs
- **WHEN** the user parks the window
- **THEN** the group holds the two other tabs
- **AND** the pinned tab stays open

#### Scenario: Internal pages
- **GIVEN** a window containing a `chrome://` page, an extension page, the list page and a blank new tab
- **WHEN** the user parks the window
- **THEN** none of these pages is stored or closed

#### Scenario: Nothing to park
- **GIVEN** a window with no parkable tab
- **WHEN** the user clicks the toolbar icon
- **THEN** no group is stored, no tab is closed, and the list page is shown

### Requirement: Never close a tab that was not saved
A tab SHALL be closed only after its group is stored.

#### Scenario: Storage write fails
- **GIVEN** saving the group to local storage fails
- **WHEN** the user parks the window
- **THEN** no tab is closed

### Requirement: Single list page
The list page SHALL be reused when it is already open, never duplicated.

#### Scenario: List already open in the window
- **GIVEN** the list page is open in the current window
- **WHEN** the user parks the window
- **THEN** that list page is focused and no second one is opened

### Requirement: Show parked groups
The list page SHALL show every group, newest first, each with its save date and time, its tab count, and each tab's title linked to its URL.

#### Scenario: Two groups
- **GIVEN** a group saved yesterday and a group saved today
- **WHEN** the list page is shown
- **THEN** today's group is listed above yesterday's

#### Scenario: Empty list
- **GIVEN** no parked tabs
- **WHEN** the list page is shown
- **THEN** it states that nothing is parked

#### Scenario: List stays current
- **GIVEN** the list page is open
- **WHEN** the user parks another window
- **THEN** the new group appears without reloading the page

### Requirement: Restore removes from the list
Restoring a tab, a group, or all groups SHALL open those tabs in the current window and remove them from the list.

#### Scenario: Restore one tab
- **WHEN** the user restores one parked tab
- **THEN** it opens in the current window
- **AND** it is removed from its group

#### Scenario: Restore a group
- **WHEN** the user restores a group
- **THEN** all its tabs open in the current window, in saved order
- **AND** the group is removed

#### Scenario: Restore all
- **WHEN** the user restores all groups
- **THEN** every parked tab opens in the current window
- **AND** the list is empty

### Requirement: Delete without restoring
The user SHALL be able to delete one tab or one group without opening it.

#### Scenario: Delete a tab
- **WHEN** the user deletes one parked tab
- **THEN** it is removed from its group and no tab opens

#### Scenario: Delete a group
- **WHEN** the user deletes a group
- **THEN** the group and all its tabs are removed and no tab opens

### Requirement: No empty groups
A group SHALL be removed when its last tab is restored or deleted.

#### Scenario: Last tab restored
- **GIVEN** a group with one tab
- **WHEN** the user restores that tab
- **THEN** the group is no longer listed

### Requirement: Local and persistent
Parked tabs SHALL be kept only in the browser's local extension storage, SHALL survive a browser restart, and SHALL NOT be sent over the network.

#### Scenario: Browser restart
- **GIVEN** parked groups exist
- **WHEN** the browser is restarted
- **THEN** the list page shows the same groups

#### Scenario: No network
- **WHEN** the user parks, restores or deletes tabs
- **THEN** the extension makes no network request
