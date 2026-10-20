@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix DNS And Network Fix
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\dns_and_network_fix.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  DNS And Network Fix
echo   Combines DNS flushing with selected network diagnostics.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)

call :log "Started"
ipconfig /flushdns
if errorlevel 1 set "RC=1"
ping -n 3 1.1.1.1
if errorlevel 1 set "RC=1"
nslookup example.com
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

