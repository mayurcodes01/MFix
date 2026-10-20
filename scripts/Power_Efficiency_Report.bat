@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Power Efficiency Report
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\power_efficiency_report.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Power Efficiency Report
echo   Generates a power efficiency report where supported.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)

call :log "Started"
if not exist "%REPORTS%" mkdir "%REPORTS%"
echo Keep the PC idle for about one minute while the trace runs.
powercfg /energy /output "%REPORTS%\MFix_Energy_Report.html"
if errorlevel 1 goto bad
start "" "%REPORTS%\MFix_Energy_Report.html"
goto done
:bad
set "RC=1"
echo The energy report could not be created.
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

