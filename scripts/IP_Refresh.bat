@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix IP Refresh
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\ip_refresh.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  IP Refresh
echo   Releases and renews an IP address where supported by the network configuration.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)
choice /c YN /n /m "Your network connection will drop briefly. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
ipconfig /release
ipconfig /renew
if errorlevel 1 set "RC=1"
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

