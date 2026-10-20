@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Battery Report
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\battery_report.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Battery Report
echo   Generates a battery health and usage report on supported laptops.
echo.


call :log "Started"
if not exist "%REPORTS%" mkdir "%REPORTS%"
powercfg /batteryreport /output "%REPORTS%\MFix_Battery_Report.html"
if errorlevel 1 goto nobat
echo Report saved to the MFix Reports folder in Documents.
start "" "%REPORTS%\MFix_Battery_Report.html"
goto done
:nobat
set "RC=1"
echo No battery report could be created on this device.
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

