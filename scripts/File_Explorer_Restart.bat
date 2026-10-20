@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix File Explorer Restart
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\file_explorer_restart.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  File Explorer Restart
echo   Restarts Windows Explorer if the taskbar or desktop becomes unresponsive.
echo.

choice /c YN /n /m "Open File Explorer windows will close. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
taskkill /f /im explorer.exe >nul 2>&1
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

