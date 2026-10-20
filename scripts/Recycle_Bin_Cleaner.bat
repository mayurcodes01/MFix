@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Recycle Bin Cleaner
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\recycle_bin_cleaner.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Recycle Bin Cleaner
echo   Empties the Recycle Bin after confirmation. Contents are permanently removed.
echo.

choice /c YN /n /m "This permanently deletes everything in the Recycle Bin. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
powershell -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"
echo Recycle Bin emptied.
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

