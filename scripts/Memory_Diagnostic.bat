@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Memory Diagnostic
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\memory_diagnostic.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Memory Diagnostic
echo   Offers to launch Windows Memory Diagnostic. A restart may be required.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)
choice /c YN /n /m "Windows Memory Diagnostic will open and can restart your PC to run a test. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
start "" mdsched.exe
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

