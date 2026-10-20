@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Temp Cleaner
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\temp_cleaner.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Temp Cleaner
echo   Deletes eligible temporary files from Windows and user temp folders. Some files may be in use.
echo.

choice /c YN /n /m "This deletes temporary files from your user temp folder and the Windows temp folder. Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)
call :log "Started"
call :clean "%TEMP%"
call :clean "%SystemRoot%\Temp"
echo Cleanup finished. Files in use were skipped.
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
