@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Audio Service Restart
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\audio_service_restart.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Audio Service Restart
echo   Restarts relevant Windows audio services when possible.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)

call :log "Started"
net stop audiosrv /y
net stop AudioEndpointBuilder /y
net start AudioEndpointBuilder
if errorlevel 1 set "RC=1"
net start audiosrv
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

