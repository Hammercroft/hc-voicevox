# hc-voicevox / Hammercroft's English VOICEVOX

Also check out the [original repo](https://github.com/VOICEVOX/voicevox). Its README is a reccomended read.

## What is this?

*This is a personal fork of VOICEVOX that implements an English-localized interface.*

The original VOICEVOX frontend was not developed with internationalization in mind. To make this localization work, display strings on the original code are replaced with function calls that point to a string via a localization key. Other text (especially ones that are fetched from a remote server) are instead translated via a brute-force find-and-replace routine. There are also some small CSS modifications in place to fit the new text.

Sadly, this fork doesn't use any standard internationalization / localization libraries (like Vue-i18n). Still, this project should still be able to provide strings that may be reused into i18n-based forks, if not the development of localization support in the main VOICEVOX app itself.

Feel free to use this work. Contributions are also welcome :)

## Build / Test Prep (for Debian Linux)

- Get a release of the [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine/releases) for your specific platform.
- Ensure that the `git`, `curl`, and `build-essential` Debian packages are installed.
- Use version `24.11.1` of Node.js (use of `nvm` is recommended).
- Install the `pnpm` npm package:
  ```bash
  npm i -g pnpm
  ```
- Clone this repo and install its dependencies:
  ```bash
  cd voicevox
  pnpm i
  ```
- Ensure that a proper, configured `.env` exists (see the section below for more info). This also involves setting up the VOICEVOX Engine, a separate component not included in this repo.

## Setting up `.env`

To get started on a quick configuration, make a copy of `.env.example` named `.env`.

Edit the `.env` file with a text editor and set `executionFilePath` to point to the `run` / `run.exe` executable file in your copy of the VOICEVOX Engine release.

YOU MAY NEED TO SET EXECUTION PERMISSION FOR THE `run` BINARY WHEN USING LINUX.

## Running / Building

**Run**: `pnpm run electron:serve`

**Build**: `pnpm run electron:build`

*(Note, further configuration may be necessary to yield a build that bundles the VOICEVOX Engine. For builds that lack the VOICEVOX Engine, you may instead launch the VOICEVOX Engine executable separately from the VOICEVOX app.)*

**Stuff to deal with before committing / opening a Pull Request**: 
```log
pnpm run fmt         # auto-format
pnpm run lint        # static analysis
pnpm run typecheck   # TS type check
```

## Other things of note

- Expect the version `0.25.2-hcmod-dev` when building from this (main) branch. 

</br></br></br>

# Dev notes
## List of added src | public files
- `src/hc-strings.ts` core utility
- `public/hc-locale/en.yaml` locale file with strings
- `src/backend/electron/renderer/hc-mutation-observer.js` DOM mutation observer for find-and-replace routine

## List of src files with non-string replacement modification
- `src/main.ts` modified to load locale at early runtime
- `src/backend/electron/renderer/preload.ts` imports hc-mutation-observer to trigger side effects
- `src/vite.config.ts` modified to include a plugin that allows the locale to be reloaded when modified during test runtime
- `src/components/Dialog/UpdateNotificationDialog/Presentation.vue` modified to include a reminder

</br>

# Localization Guide

*For the ones who wants to try their hand in replacing hardcoded strings.*

## Setup

Add this import to any TypeScript file or Vue `<script setup>` that needs localization:

```ts
import { t } from '@/hc-strings'; // hc-voicevox string localization
```

## Usage

Replace hardcoded strings with `t('your.locale.key')`. The function returns the string value for the current locale, or falls back to the key itself if no match is found.

In script/expression context:
```ts
t('your.locale.key') 
```

In HTML template body (interpolation):
```html
<p>{{ t('your.locale.key') }}</p>
```

In Vue template attributes, prefix with `:` to treat the value as a JS expression:
```html
<QInput :label="t('singing_interface.tempo_label')" />
```
(without `:`, the raw string `"t('...')"` is passed literally)

You may preserve the original hardcoded string as a comment for reference.

## Key Naming Conventions

Use the following prefixes as a guide. When no precedent exists, use your best judgment — just keep the namespacing sensible.

| Prefix | Scope |
|---|---|
| `action.` | Strings that appear in both the menu bar **and** elsewhere (e.g. context menus) |
| `menu_bar.` | Strings that appear **only** in the menu bar |
| `context.` | Strings that appear **only** in right-click / context menus |
| `window_title.` | Window titles |
| `dialog.` | Prompt and dialog body text |
| `logging.` | Strings used only for logging (not shown in UI) |
| `singing_interface.` | Strings for the SING interface |
| `talking_interface.` | Strings for the TALK interface |
| `general.` | Strings for both the UI and the non-UI side |

The source file name, location, or scope/closure can also serve as a useful prefix hint.

> **Warning: do not localize `name` keys in objects.**
> Many of VOICEVOX's `name` keys double as enums — certain parts of the codebase expect them to hold specific literal values. Replacing them will break things.