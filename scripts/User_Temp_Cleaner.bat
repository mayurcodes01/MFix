@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix User Temp Cleaner
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\user_temp_cleaner.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  User Temp Cleaner
echo   Cleans eligible temporary files for the current user.
echo.

choice /c YN /n /m "This deletes eligible files in your user temp folder. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
call :clean "%TEMP%"
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
