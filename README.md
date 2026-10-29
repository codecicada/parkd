# parkd

Park your tabs. Come back later.

parkd is a Chrome extension that saves every open tab in a window to a list, closes them,
and lets you restore them when you need them again. Nothing more.

## What it does

- **Save** — one click parks all tabs of the current window as a dated group.
- **Restore** — reopen one tab, one group, or everything.
- **Reorder** — drag a tab to a new place or another group, or press Alt+Up / Alt+Down.
- **Import / export** — plain text in a simple form, so your list is never locked in.

## Import and export

Open **Import / export** from the list page. Export shows every parked tab as text you can
copy; Import takes the same text back. One tab per line, a blank line between groups:

```text
https://example.com/ | Example
https://example.org/docs | Docs

https://example.net/
```

A line without ` | title` uses the URL as its title. Only `http`, `https`, `file` and `ftp`
links are imported; other lines are skipped and counted. Imported groups are dated at the
time of import.

## What it does not do

No account, no cloud sync, no analytics, no ads. Your tabs stay in your browser.

## Permissions

| Permission | Why |
|---|---|
| `tabs` | Read the URL and title of the tabs you park, and close and reopen them. |
| `storage` | Keep your parked tabs in the browser's local extension storage. |

No host permissions. parkd never reads page content and never makes a network request.
See the [privacy policy](PRIVACY.md).

## Build and load locally

Needs Node 24 (see `.nvmrc`).

```sh
npm ci
npm run build
```

Then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and
pick the `dist/` folder. After a rebuild, click the reload icon on the parkd card.

`npm test` runs the unit tests, `npm run typecheck` the type checks.
`npm run package` builds and writes `parkd-<version>.zip`, the file the Chrome Web Store takes.

## License

[MIT](LICENSE)
