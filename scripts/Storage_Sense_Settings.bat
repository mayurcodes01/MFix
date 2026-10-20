@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Storage Sense Settings
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\storage_sense_settings.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Storage Sense Settings
echo   Opens Storage Sense settings for automatic cleanup.
echo.


call :log "Started"
start "" ms-settings:storagesense
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

