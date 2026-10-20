# MFix

Windows maintenance toolkit. Stack: BAT scripts, Python with SQLite backend, Electron with Node.js, React, three.js, anime.js, Framer Motion, shadcn style components, liquid glass styling.

Requirements: Node.js 20 or newer, Python 3.10 or newer on PATH, Windows 10 or 11.

    npm install
    npm run dev       run in development with hot reload
    npm start         build the interface and run the desktop app
    npm run gen       regenerate scripts and backend/tools.json from tools/gen_scripts.py
    npm run dist      build the Windows installer (see below)

How it fits together
- scripts/ holds the 40 batch files. Each one asks before deleting, logs to %LOCALAPPDATA%\MFix\logs, and requests admin rights only when needed.
- backend/mfix_backend.py launches a script, records the run in SQLite (%LOCALAPPDATA%\MFix\mfix.db), stores settings and takes snapshots.
- electron/main.cjs exposes a small fixed set of calls to the interface. The interface can only run tools by id, never arbitrary paths.
- Add or edit a tool by changing the table in tools/gen_scripts.py, then run npm run gen.

Building the installer (easy way)
Double click Build_Installer.bat on a Windows PC with Node.js and Python installed. It installs the build tools, draws the app icon, bundles the Python backend into a single exe with PyInstaller and produces release\MFix-Setup-1.0.0.exe.
The installer is one click, adds Desktop and Start Menu shortcuts, launches MFix when finished, and the installed app needs no Python or Node on the target PC. Run it from the command line with npm run installer.

Interface
- On launch a full screen welcome window covers the display for 3 seconds (animated rings, orbiting dots, particle network), then the app opens.
- Home dashboard, Tools, Snapshots, Settings and About, with a glass card for every function and a status bar.
- Transparent window: on Windows 11 (22H2 or newer) the window uses acrylic so the desktop shows through. Turn it off in Settings, Transparent window. Older Windows keeps the in-app gradient background.
