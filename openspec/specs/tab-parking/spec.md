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

### Requirement: Move a tab by dragging
The user SHALL be able to drag a parked tab to another place in its group or into another group. The new order SHALL be stored, and restoring and exporting SHALL follow it. Groups SHALL keep their newest-first order and their save dates.

#### Scenario: Within a group
- **GIVEN** a group holding A, B and C
- **WHEN** the user drags C above A
- **THEN** the group holds C, A and B
- **AND** restoring the group opens C, A and B in that order

#### Scenario: Into another group
- **GIVEN** a group holding A and B, and another group holding C
- **WHEN** the user drags B below C
- **THEN** the first group holds A and the other group holds C and B
- **AND** both groups keep their save dates and their place in the list

#### Scenario: Last tab of a group
- **GIVEN** a group holding only A, and another group holding B
- **WHEN** the user drags A into the other group
- **THEN** the group that held A is no longer listed

#### Scenario: Dropped where it was
- **WHEN** the user drops a tab at its own place
- **THEN** nothing is stored

#### Scenario: Click still restores
- **WHEN** the user clicks a tab's title without dragging it
- **THEN** the tab is restored, as before

#### Scenario: Drop from outside the list
- **WHEN** the user drops a link, text or a browser tab onto the list
- **THEN** nothing is stored and no tab is restored

### Requirement: Move a tab from the keyboard
With a tab's title focused, Alt+Up and Alt+Down SHALL move that tab one place up or down. At the top or bottom of its group the tab SHALL move to the end of the group above or the start of the group below. The moved tab SHALL keep focus.

#### Scenario: One place up
- **GIVEN** a group holding A, B and C, with B focused
- **WHEN** the user presses Alt+Up
- **THEN** the group holds B, A and C
- **AND** B is still focused

#### Scenario: Across a group edge
- **GIVEN** a group holding A and B listed above a group holding C and D, with C focused
- **WHEN** the user presses Alt+Up
- **THEN** the upper group holds A, B and C, and the lower group holds D

#### Scenario: Top of the list
- **GIVEN** the first tab of the first group is focused
- **WHEN** the user presses Alt+Up
- **THEN** nothing changes
