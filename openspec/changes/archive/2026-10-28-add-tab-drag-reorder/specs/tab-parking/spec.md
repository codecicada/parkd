# Spec Delta

## ADDED Requirements

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
