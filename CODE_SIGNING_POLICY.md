# Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by
[SignPath Foundation](https://signpath.org).

This policy covers the WikiSubmission desktop app: the offline version of the
wikisubmission.org Quran reader for Windows, built from this repository
(`apps/desktop`) and [ws-backend](https://github.com/WikiSubmission/ws-backend).

## What is signed

Only binaries built from the source in these two public repositories, by the
[Desktop release workflow](.github/workflows/desktop-release.yml) on GitHub
Actions:

- the Windows installer (`WikiSubmission-Setup-<version>-x64.exe`) and its
  uninstaller
- `WikiSubmission.exe`, the app
- `ws-backend-desktop.exe`, the app's bundled local server

Third-party components shipped inside the app, such as Electron and the
PostgreSQL binaries, keep their upstream signatures (or none) and are never
signed with this certificate.

## Team roles

- Committers and reviewers: [hichem](https://github.com/toumi-hichem)
- Approvers: [hichem](https://github.com/toumi-hichem)

Changes from anyone else are reviewed by a committer before they are merged.
Every signing request is approved by hand by an approver. All team members use
multi-factor authentication on GitHub and SignPath.

## Status

Signing through SignPath Foundation is being set up. Until it is in place,
Windows releases are published unsigned, and this page will say when signed
releases begin.

## Privacy

This program will not transfer any information to other networked systems
unless specifically requested by the user or the person installing or
operating it.

Everything the app needs ships with it and runs on your computer: the Quran
text, search, the index and your bookmarks and notes. It only goes online when
you ask it to:

- playing a verse recitation streams it from `cdn.wikisubmission.org`
- playing word-by-word audio streams it from `audio.qurancdn.com`
  ([Quran.com](https://quran.com))
- playing an appendix video loads it from YouTube, subject to
  [Google's privacy policy](https://policies.google.com/privacy)

The app has no accounts, analytics or crash reporting.

## Contact

contact@wikisubmission.org
