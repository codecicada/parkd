# Store material

Everything the Chrome Web Store dashboard asks for that does not ship in the extension.
None of these files go into the zip.

| File | Used for |
|---|---|
| [listing.md](listing.md) | Text for every field of the Store listing and Privacy practices tabs |
| [screenshots/list.png](screenshots/list.png) | Screenshot 1, 1280×800: the list page |
| [screenshots/transfer.png](screenshots/transfer.png) | Screenshot 2, 1280×800: the import / export page |
| [promo-small.svg](promo-small.svg) | Source of the small promo tile |
| [promo-small.png](promo-small.png) | Small promo tile, 440×280 |

The store icon is [public/icons/128.png](../public/icons/128.png): 96×96 artwork with
16px of transparent padding, as the store asks. The privacy policy is
[PRIVACY.md](../PRIVACY.md).

## How the images were made

**Screenshots.** Built with `npm run package`, unzipped, and loaded as an unpacked
extension in headless Chromium at a 1280×800 viewport, light color scheme, device scale 1.
The list was filled with sample tabs on `example.com`, `example.org` and `example.net`
written straight into `chrome.storage.local`, so no real browsing data appears. Retake
them when a page changes visibly, with sample data only.

**Promo tile.** Drawn as SVG from the icon's shapes and colors, then rendered:

```sh
magick -background none store/promo-small.svg -flatten -strip PNG24:store/promo-small.png
```

**Icon padding.** The 128px icon was trimmed, scaled to 96×96 and centered on a
transparent 128×128 canvas:

```sh
magick icon.png -trim +repage -filter Lanczos -resize 96x96 -background none \
  -gravity center -extent 128x128 -strip PNG32:public/icons/128.png
```

## Uploading a release

1. Check that `package.json`, `public/manifest.json` and `CHANGELOG.md` name the new
   version (`npm test` fails otherwise).
2. Run `npm run package` and upload `parkd-<version>.zip` in the dashboard.
3. Paste any text from `listing.md` that changed, and replace changed images.
4. Submit for review.
