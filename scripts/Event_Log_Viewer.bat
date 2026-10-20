@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Event Log Viewer
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\event_log_viewer.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Event Log Viewer
echo   Opens Event Viewer to investigate system errors and warnings.
echo.


call :log "Started"
start "" eventvwr.msc
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

