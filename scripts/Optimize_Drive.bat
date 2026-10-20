@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Optimize Drive
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\optimize_drive.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Optimize Drive
echo   Opens the Windows drive optimization tool.
echo.


call :log "Started"
start "" dfrgui.exe
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

