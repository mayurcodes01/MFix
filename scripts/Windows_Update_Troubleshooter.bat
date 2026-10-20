@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Windows Update Troubleshooter
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\windows_update_troubleshooter.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Windows Update Troubleshooter
echo   Opens built in Windows troubleshooting or update settings.
echo.


call :log "Started"
choice /c 12 /n /m "Press 1 for Troubleshooters or 2 for Windows Update settings: "
if errorlevel 2 goto wu
start "" ms-settings:troubleshoot
goto done
:wu
start "" ms-settings:windowsupdate
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

