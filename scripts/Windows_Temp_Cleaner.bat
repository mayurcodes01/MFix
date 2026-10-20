@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Windows Temp Cleaner
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\windows_temp_cleaner.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Windows Temp Cleaner
echo   Cleans eligible files in Windows temporary directories.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)
choice /c YN /n /m "This deletes eligible files in the Windows temp folder. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
call :clean "%SystemRoot%\Temp"
echo Cleanup finished.
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b
:clean
if not exist "%~1" exit /b
for /d %%D in ("%~1\*") do rd /s /q "%%~D" 2>nul
del /f /q "%~1\*" 2>nul
exit /b
