# Security policy

## Supported versions

Only the latest version published on the Chrome Web Store gets fixes.

## Reporting a vulnerability

Please report privately, not in a public issue:

1. Go to <https://github.com/codecicada/parkd/security/advisories/new>.
2. Describe the problem, the steps to reproduce it, and what an attacker could do.

The maintainer aims to answer within a week. Once a fix ships, the advisory is published and
credits you unless you ask otherwise.

## Scope

parkd stores tab URLs and titles in `chrome.storage.local` and makes no network request.
Reports that matter most: a way for a web page or another extension to read or change
parkd's list, script injection through an imported or parked title, or any request
parkd sends off the device.
