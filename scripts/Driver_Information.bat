@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Driver Information
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\driver_information.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Driver Information
echo   Generates a report of installed drivers.
echo.


call :log "Started"
if not exist "%REPORTS%" mkdir "%REPORTS%"
driverquery /v /fo csv > "%REPORTS%\MFix_Drivers.csv"
echo Driver report saved to the MFix Reports folder in Documents.
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

