# MFix

**A one-click Windows maintenance toolkit with a glass-style desktop interface.**

MFix wraps 40 readable batch scripts in a modern Electron app. Pick a tool, press **Run**, and MFix launches the script, records the run, and can snapshot your PC before and after so you can see what changed.

| | |
|---|---|
| **Version** | 1.0.0 |
| **Author** | Mayur Dhole ([@mayurcodes01](https://github.com/mayurcodes01)) |
| **Platform** | Windows 10 / 11 (x64) |
| **App ID** | `com.mayur.mfix` |
| **Installer** | `MFix-Setup-1.0.0.exe` (one-click NSIS) |

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Requirements](#requirements)
4. [Quick start](#quick-start)
5. [Building the installer](#building-the-installer)
6. [Project structure](#project-structure)
7. [How it works](#how-it-works)
8. [The 40 tools](#the-40-tools)
9. [Snapshots](#snapshots)
10. [Settings](#settings)
11. [Data and log locations](#data-and-log-locations)
12. [Adding or editing a tool](#adding-or-editing-a-tool)
13. [Security model](#security-model)
14. [Troubleshooting](#troubleshooting)
15. [Author](#author)

---

## Features

- **40 maintenance tools** in four categories: storage and performance, error fixing, diagnostics, and advanced cleanup.
- **Plain batch scripts.** Every tool is a `.bat` file you can open and read. Nothing is hidden inside the app.
- **Safe by design.** Scripts that delete data ask for confirmation first. Admin rights are requested only for scripts that need them.
- **Run history.** Every run is stored in a local SQLite database with its duration and exit code.
- **Snapshots.** Capture free disk space, free memory, temp-folder size, process count and startup entries, then compare any two snapshots.
- **Auto snapshots.** Optionally take a snapshot automatically before and after every tool run.
- **Glass interface.** Animated three.js background, acrylic transparent window on Windows 11, 8 colour themes, adjustable blur, optional film grain and liquid refraction.
- **Welcome screen.** A full-screen animated splash (rings, orbiting dots, particle network) shows for 3 seconds on launch.
- **No runtime needed on the target PC.** The installed app bundles its Python backend as a single exe, so users do not need Python or Node.

---

## Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 32 |
| Interface | React 18, Vite 5, Tailwind CSS 3, shadcn-style components (Radix UI, class-variance-authority) |
| Animation / graphics | Framer Motion, anime.js 3.2.2, three.js (WebGL shader background) |
| Icons and fonts | lucide-react, Manrope and Sora variable fonts |
| Backend | Python 3.10+ (standard library only) with SQLite |
| Tools | Windows batch scripts, PowerShell one-liners, built-in Windows utilities (SFC, DISM, netsh, powercfg, chkdsk and others) |
| Packaging | PyInstaller (backend exe) and electron-builder (NSIS installer) |

---

## Requirements

To **run or build** from source:

- Windows 10 or 11
- Node.js 20 or newer
- Python 3.10 or newer, available on `PATH`
- For the installer build: `pip install pillow pyinstaller` (the build script does this for you)

To **use the installed app**: Windows 10 or 11 only. No Python or Node required.

> The batch scripts only run on Windows. On other systems the backend returns "Scripts can only run on Windows."

---

## Quick start

```bat
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Development mode with hot reload (Vite on port 5173, then Electron) |
| `npm start` | Build the interface and run the desktop app |
| `npm run build` | Build the interface only (`dist/`) |
| `npm run gen` | Regenerate `scripts/*.bat` and `backend/tools.json` from `tools/gen_scripts.py` |
| `npm run icon` | Draw the app icon (`build/icon.png` and `build/icon.ico`) |
| `npm run backend:exe` | Bundle the Python backend into `build/backend/mfix_backend.exe` |
| `npm run installer` | Full installer build (icon, backend exe, interface, NSIS installer) |
| `npm run dist` | Alias for `npm run installer` |

In development the app calls `python backend/mfix_backend.py`. You can point it at a specific interpreter with the `MFIX_PYTHON` environment variable.

---

## Building the installer

**Easy way:** double-click `Build_Installer.bat` on a Windows PC that has Node.js and Python installed. It will:

1. Check that `node` and `python` are available.
2. Install `pillow` and `pyinstaller`.
3. Run `npm install`.
4. Run `npm run installer`.
5. Open the `release` folder containing `MFix-Setup-1.0.0.exe`.

**Command line:** `npm run installer`

The installer is one-click, per-user, creates Desktop and Start Menu shortcuts, launches MFix when it finishes, and keeps user data on uninstall (`deleteAppDataOnUninstall: false`).

Build output folders (`build/backend`, `build/pyi`, `dist`, `release`) are generated and should not be committed to git.

---

## Project structure

```
MFix/
├── Build_Installer.bat        One-click installer build
├── package.json               Scripts, dependencies, electron-builder config
├── vite.config.js             Vite + React + Tailwind config
├── tailwind.config.js         Tailwind theme (Sora / Manrope fonts)
├── components.json            shadcn component config
├── index.html                 Vite entry
├── backend/
│   ├── mfix_backend.py        Script runner, SQLite storage, snapshots
│   └── tools.json             Tool metadata (generated)
├── electron/
│   ├── main.cjs               Main process: windows, IPC, backend calls
│   └── preload.cjs            Safe bridge exposed as window.mfix
├── scripts/                   The 40 batch files
├── src/
│   ├── main.jsx               React entry
│   ├── App.jsx                All views: Home, Tools, Snapshots, Settings, About
│   ├── Splash.jsx             Animated welcome screen
│   ├── Background.jsx         three.js shader background
│   ├── styles.css             Glass styling and theme variables
│   ├── components/ui/         button, card, switch
│   └── lib/utils.js           cn() class helper
├── tools/
│   ├── gen_scripts.py         Generates scripts and tools.json
│   ├── build_backend.py       PyInstaller bundling
│   └── make_icon.py           Draws the app icon with Pillow
└── build/                     icon.png, icon.ico (plus generated backend output)
```

---

## How it works

```
React interface ──window.mfix.call()──▶ preload.cjs ──IPC "mfix"──▶ main.cjs
                                                                      │
                          execFile: mfix_backend.exe (installed)  or  │
                                    python mfix_backend.py (dev)  ◀───┘
                                                  │
                                    prints one JSON object
                                                  │
                         SQLite (%LOCALAPPDATA%\MFix\mfix.db) + scripts\*.bat
```

1. The interface calls `window.mfix.call(name, ...args)`.
2. `main.cjs` maps `name` to a fixed backend command and runs the backend with `execFile`.
3. The backend does the work and prints a single JSON object to stdout.
4. `main.cjs` parses it and returns it to the interface.

### Backend commands

| Call from UI | Backend command | Purpose |
|---|---|---|
| `boot` | `boot` | Load tools, categories, settings, stats, last 8 runs and last 40 snapshots |
| `run(id)` | `run <id>` | Run a tool by id and record the result |
| `snapCreate(label)` | `snap_create <label>` | Take a snapshot (label limited to 60 characters) |
| `snapDiff(a, b)` | `snap_diff <a> <b>` | Compare two snapshots |
| `snapDelete(id)` | `snap_delete <id>` | Delete a snapshot |
| `set(key, value)` | `set <key> <value>` | Save a setting (only known keys, value limited to 40 characters) |

### Running a tool

- If a tool needs admin rights and MFix is not elevated, the backend relaunches the script through PowerShell with `Start-Process -Verb RunAs` and waits for it. Declining the prompt returns exit code 9.
- Otherwise the script runs in `cmd.exe /c` in a new console window.
- The run (tool id, start time, seconds, exit code) is saved to the `runs` table.
- With **Auto snapshot** on, a "Before ..." and "After ..." snapshot are taken around the run.

### Windows 11 acrylic window

The main window uses `backgroundMaterial: 'acrylic'` on Windows 11 build 22621 (22H2) or newer. Older systems keep the in-app gradient background. It can be switched off in **Settings → Transparent window**.

### Splash screen

On launch `main.cjs` opens a borderless full-screen splash window and the main window hidden behind it. After 3 seconds (waiting up to 8 seconds for the main window to finish loading) the main window is shown and the splash closes.

---

## The 40 tools

Legend: **Admin** means the script requests administrator rights. **Asks** means it asks for confirmation before doing anything destructive.

### 1. Storage and performance

| Tool | What it does | Admin | Asks |
|---|---|:-:|:-:|
| Temp Cleaner | Deletes eligible temporary files from Windows and user temp folders | | Yes |
| Disk Space Check | Shows used and free space on all drives | | |
| Update Cache Cleaner | Clears the Windows Update download cache | Yes | Yes |
| DNS Flush | Clears cached DNS lookups | Yes | |
| Recycle Bin Cleaner | Empties the Recycle Bin permanently | | Yes |
| Windows Component Cleanup | DISM cleanup of superseded components | Yes | Yes |

### 2. Error fixing

| Tool | What it does | Admin | Asks |
|---|---|:-:|:-:|
| System File Repair | Runs `sfc /scannow` | Yes | |
| DISM Image Repair | `DISM /RestoreHealth` | Yes | |
| Disk Error Check | `chkdsk /scan` on the system drive | Yes | |
| Network Reset | Resets Winsock and the IP stack | Yes | Yes |
| IP Refresh | Releases and renews the IP address | Yes | Yes |
| Winsock Repair | Resets the Winsock catalog | Yes | Yes |
| Windows Update Troubleshooter | Opens Windows troubleshooters or Update settings | | |
| Audio Service Restart | Restarts the Windows audio services | Yes | |
| Print Spooler Fix | Restarts the spooler and clears pending jobs | Yes | Yes |
| Thumbnail Cache Reset | Rebuilds thumbnail caches (restarts Explorer) | | Yes |
| Icon Cache Reset | Rebuilds the icon cache (restarts Explorer) | | Yes |
| File Explorer Restart | Restarts `explorer.exe` | | Yes |
| DNS And Network Fix | Flushes DNS and runs `ping` / `nslookup` checks | Yes | |
| Windows Activation Status | Shows activation and licence status via `slmgr` | | |

### 3. Diagnostics

| Tool | What it does | Admin | Asks |
|---|---|:-:|:-:|
| Startup Apps Report | Lists startup commands and Run registry keys | | |
| Running Processes | Lists processes with `tasklist` | | |
| Battery Report | Saves a battery health report (laptops) | | |
| WiFi Report | Shows wireless status and saved profile names, never passwords | | |
| System Information | Runs `systeminfo` | | |
| Driver Information | Exports installed drivers to CSV | | |
| Large Files Search | Finds files above a chosen size for manual review, never deletes | | |
| Memory Diagnostic | Offers to launch Windows Memory Diagnostic | Yes | Yes |
| Power Efficiency Report | `powercfg /energy` report | Yes | |
| Event Log Viewer | Opens Event Viewer | | |

### 4. Advanced cleanup

| Tool | What it does | Admin | Asks |
|---|---|:-:|:-:|
| Windows Temp Cleaner | Cleans the Windows temp folder | Yes | Yes |
| User Temp Cleaner | Cleans the current user's temp folder | | Yes |
| Delivery Optimization Cleaner | Opens Delivery Optimization settings or Disk Cleanup | | |
| Component Store Analysis | `DISM /AnalyzeComponentStore` | Yes | |
| Storage Sense Settings | Opens Storage Sense settings | | |
| Hibernation Control | Turns hibernation on or off (may affect Fast Startup) | Yes | |
| Optimize Drive | Opens the drive optimization tool | | |
| Clipboard Reset | Clears the clipboard | | Yes |
| System Restore Settings | Opens System Protection settings | | |
| Maintenance Menu | Text menu to launch 9 common tools | | |

### Script conventions

Every generated script:

- Starts with `@echo off`, enables delayed expansion, and sets a window title.
- Writes a log to `%LOCALAPPDATA%\MFix\logs\<tool>.log` with start and finish entries and the exit code.
- Checks for admin rights with `net session` and re-launches itself elevated when needed (exit code 3 for the un-elevated instance).
- Shows a confirmation prompt before destructive actions and exits with code 2 if you cancel.
- Saves reports (battery, drivers, energy) to `Documents\MFix Reports`.
- Pauses at the end so you can read the output.

---

## Snapshots

A snapshot records:

- Total and free space for each drive
- Operating system name
- Total and free physical memory
- Number of running processes
- Size of your `%TEMP%` folder (counting stops after 60,000 files)
- Startup entries

**Compare** two snapshots to get a plain-language list, for example:

```
Free space on C: up 3.2 GB
Temp files: down 840 MB
Free memory: up 512 MB
Processes: down 4
Startup entries added: none
Startup entries removed: SomeApp
```

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `theme` | `aurora` | One of aurora, ember, orchid, tide, mint, graphite, sunrise, midnight |
| `blur` | `22` | Glass blur in pixels (slider range 8 to 44) |
| `refraction` | `0` | Liquid refraction effect behind glass |
| `motion` | `normal` | `off`, `calm`, `normal` or `lively` animation speed |
| `grain` | `0` | Fine film-grain texture over the window |
| `background` | `1` | Animated three.js gradient background |
| `auto_snapshot` | `0` | Snapshot before and after every tool run |
| `glass_window` | `1` | Transparent acrylic window (Windows 11 22H2 or newer) |

---

## Data and log locations

| What | Where |
|---|---|
| Database (runs, snapshots, settings) | `%LOCALAPPDATA%\MFix\mfix.db` |
| Script logs | `%LOCALAPPDATA%\MFix\logs\` |
| Reports (battery, drivers, energy) | `Documents\MFix Reports\` |

SQLite tables: `runs(id, tool, started, seconds, code)`, `snaps(id, label, created, data)` and `settings(k, v)`.

---

## Adding or editing a tool

1. Open `tools/gen_scripts.py`.
2. Add or change an entry using `A(file, category, description, body, admin=..., ask=...)`:
   - `file`: script name without `.bat`
   - `category`: 1 to 4
   - `body`: the batch commands. A leading `!` marks a command whose failure sets the exit code to 1.
   - `admin=1` to require elevation
   - `ask='...'` to show a confirmation prompt
3. Run `npm run gen`. This rewrites `scripts/*.bat` and `backend/tools.json`.
4. Restart the app. The tool appears automatically, and the icon is chosen from keywords in the tool id.

The generator asserts that exactly 40 tools are defined. Update the `assert len(T) == 40` line when you change the count.

---

## Security model

- `contextIsolation` is on and `nodeIntegration` is off.
- The interface can call only six fixed backend commands. It can run tools **by id only**, never arbitrary paths or commands. Unknown ids return "Unknown tool."
- Settings keys are checked against a fixed list and values are length-limited.
- `window.mfix.open()` opens only `https://github.com/...` and `https://www.linkedin.com/...` links.
- Scripts delete only within clearly named locations (temp folders, update cache, caches) and ask before doing so.
- The WiFi report lists profile names only and never shows saved passwords.
- All data stays on the device. MFix makes no network requests of its own.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Python was not found" in dev mode | Install Python 3.10+, tick "Add to PATH", or set `MFIX_PYTHON` to the full path of `python.exe` |
| "Open MFix from the desktop app" | You opened the Vite page in a browser. Use `npm run dev` or `npm start` so Electron loads it |
| "Scripts can only run on Windows" | The tool runner needs Windows |
| Admin prompt declined (exit code 9) | Run the tool again and accept the UAC prompt |
| Transparent window not showing | Needs Windows 11 22H2 or newer. Check **Settings → Transparent window** |
| Installer build fails | Check Node and Python are on `PATH`, then read the messages in the `Build_Installer.bat` window |
| A script reports exit code 1 | A command inside it failed. Check `%LOCALAPPDATA%\MFix\logs\` for the tool's log |

---

## Author

**Mayur Dhole** builds practical tools that pair solid engineering with design that feels good to use.

- GitHub: https://github.com/mayurcodes01
- LinkedIn: https://www.linkedin.com/in/mayur-dhole-bb60893a5

## Disclaimer

MFix runs standard Windows maintenance commands. Some tools delete temporary files or reset system components. Read the description of each tool, and consider creating a restore point or a snapshot first. Use at your own risk.
