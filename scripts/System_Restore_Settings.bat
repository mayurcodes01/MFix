@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix System Restore Settings
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\system_restore_settings.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  System Restore Settings
echo   Opens System Protection settings to review restore points.
echo.


call :log "Started"
start "" SystemPropertiesProtection.exe
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

