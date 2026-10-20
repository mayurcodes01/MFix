@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Winsock Repair
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\winsock_repair.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Winsock Repair
echo   Resets the Winsock catalog to help resolve some network errors.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)
choice /c YN /n /m "This resets the Winsock catalog. A restart is recommended afterwards. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
netsh winsock reset
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

