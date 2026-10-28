# Proposal

- Drag a parked tab to a new place in its group, or into another group.
- Alt+Up / Alt+Down does the same from the keyboard.
- Restore and export follow the new order.

## Why

A group keeps its tabs in saved order. Users cannot arrange a long group before restoring or exporting it.

## What Changes

- Each tab row on the list page can be dragged; a drop line shows where it lands.
- Moving a group's last tab out removes the emptied group.
- Groups keep their newest-first order.

## Non-goals

- Reordering groups, or sorting tabs automatically.
- Dropping tabs or links from outside the list page.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `tab-parking`: adds moving a parked tab within or between groups.

## Impact

List page and one new background action. No new Chrome permission.
