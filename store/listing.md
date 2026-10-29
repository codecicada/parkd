# Chrome Web Store listing

Text for each field of the store dashboard. Keep it in step with the README and
`public/manifest.json`; change it here first, then paste.

## Store listing tab

**Name**

parkd

**Short description** (from `manifest.json`, at most 132 characters)

Park your tabs. Come back later.

**Detailed description**

```text
parkd saves every tab of a window to a list, closes them, and gives them back when you need them.

Click the parkd button: the tabs of the current window are parked as one dated group, and the window is free again.

From the list you can:
• Restore one tab, one group, or everything.
• Drag a tab to a new place or into another group, or move it with Alt+Up / Alt+Down.
• Remove a tab or a group you no longer need.

Import / export turns your list into plain text, one "URL | title" per line, with a blank line between groups. Copy it out to keep a backup or move to another browser; paste the same text back in to import it. Lists in that common format from other tab savers import too.

parkd stays small on purpose:
• No account, no sync, no analytics, no ads.
• No network requests. Your list lives in your browser's local storage.
• Two permissions only: tabs and storage.

parkd is open source under the MIT license: https://github.com/codecicada/parkd
```

**Category**

Productivity → Workflow & Planning

**Language**

English

**Graphics**

- Store icon: `public/icons/128.png`
- Screenshots (1280×800): `store/screenshots/list.png`, `store/screenshots/transfer.png`
- Small promo tile (440×280): `store/promo-small.png`

**Homepage URL**

https://github.com/codecicada/parkd

**Support URL**

https://github.com/codecicada/parkd/issues

## Privacy practices tab

**Single purpose**

parkd saves the open tabs of a window to a local list and restores them later.

**Permission justification**

| Permission | Justification |
|---|---|
| `tabs` | Reads the URL and title of each tab in the window the user parks, closes those tabs, and opens them again when the user restores them. |
| `storage` | Keeps the list of parked tabs in `chrome.storage.local` on the user's device so it survives a browser restart. |

**Remote code**

No, I am not using remote code. All JavaScript ships in the package.

**Data usage**

parkd handles the URL and title of the tabs a user parks. They stay in local extension
storage and are never sent off the device. The form asks which data types are
collected; declaring **Web history** is the cautious answer, since parkd keeps a list of
visited addresses, even though nothing leaves the browser. Leave every other type
unchecked.

Certify all three statements:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL**

https://github.com/codecicada/parkd/blob/main/PRIVACY.md
