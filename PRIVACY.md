# Privacy policy

Effective 28 October 2026. Applies to the parkd Chrome extension.

## In short

parkd keeps your parked tabs in your own browser. It sends nothing anywhere, and nobody,
including the developer, can see what you park.

## What parkd stores

When you park a window, parkd saves, for each tab:

- its address (URL),
- its title,
- the date and time you parked it.

These are kept in Chrome's local extension storage (`chrome.storage.local`) on your
device. parkd does not read the content of any page.

## What parkd does not do

- It makes no network request. There is no server.
- It has no account, no sync, no analytics, no crash reporting and no ads.
- It does not sell, share or transfer your data, and does not use it for anything other
  than showing and restoring your parked tabs.

Chrome's own sync does not carry parkd's list: local extension storage stays on the
device where it was written.

## Export and clipboard

Export shows your list as text on a parkd page. Only when you press **Copy** does parkd
put that text on your clipboard. Where you paste it is up to you.

## Permissions

- `tabs`: read the URL and title of the tabs you park, close them, and reopen them.
- `storage`: keep your parked tabs in local extension storage.

## Deleting your data

Restoring a tab or a group removes it from the list, and so does deleting it from the list
page. Removing the extension makes Chrome delete everything parkd stored.

## Changes

A change to this policy is made in this file, in the public repository, and its history
is kept by git.

## Questions

Open an issue at <https://github.com/codecicada/parkd/issues>.
