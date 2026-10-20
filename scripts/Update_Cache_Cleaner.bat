@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Update Cache Cleaner
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\update_cache_cleaner.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Update Cache Cleaner
echo   Clears selected Windows Update download cache files. Windows may need to download updates again.
echo.
net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)
choice /c YN /n /m "This clears the Windows Update download cache. Windows may need to download updates again. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
net stop wuauserv
net stop bits
for /d %%D in ("%SystemRoot%\SoftwareDistribution\Download\*") do rd /s /q "%%~D"
del /f /q "%SystemRoot%\SoftwareDistribution\Download\*" 2>nul
net start bits
if errorlevel 1 set "RC=1"
net start wuauserv
if errorlevel 1 set "RC=1"
echo Update cache cleared.
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

