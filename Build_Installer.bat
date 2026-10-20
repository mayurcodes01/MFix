@echo off
setlocal
cd /d "%~dp0"
title MFix installer builder
echo Building the MFix installer. This takes a few minutes the first time.
where node >nul 2>nul || (echo Node.js 20 or newer is required. Get it from https://nodejs.org & pause & exit /b 1)
where python >nul 2>nul || (echo Python 3.10 or newer is required. Get it from https://python.org & pause & exit /b 1)
python -m pip install --quiet --disable-pip-version-check pillow pyinstaller || goto fail
call npm install || goto fail
call npm run installer || goto fail
echo.
echo Done. Your installer is in the release folder: MFix-Setup-1.0.0.exe
explorer release
pause
exit /b 0
:fail
echo.
echo The build failed. Read the messages above.
pause
exit /b 1
