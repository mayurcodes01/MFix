@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Hibernation Control
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\hibernation_control.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Hibernation Control
echo   Offers a choice to disable hibernation and reclaim space. This affects hibernation and may affect Fast Startup.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)

call :log "Started"
choice /c 123 /n /m "Press 1 to turn hibernation off, 2 to turn it on, 3 to cancel: "
set "PICK=%errorlevel%"
if "%PICK%"=="3" goto cancel
if "%PICK%"=="1" powercfg /hibernate off
if "%PICK%"=="2" powercfg /hibernate on
echo Done. Fast Startup may be affected.
goto done
:cancel
echo Cancelled. Nothing was changed.
set "RC=2"
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

