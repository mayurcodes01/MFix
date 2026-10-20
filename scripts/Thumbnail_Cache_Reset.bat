@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Thumbnail Cache Reset
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\thumbnail_cache_reset.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Thumbnail Cache Reset
echo   Rebuilds thumbnail caches when File Explorer previews are missing or incorrect.
echo.

choice /c YN /n /m "File Explorer will restart and thumbnails will rebuild. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
taskkill /f /im explorer.exe >nul 2>&1
del /f /q "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
start "" explorer.exe
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

