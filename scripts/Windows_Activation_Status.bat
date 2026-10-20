@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Windows Activation Status
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\windows_activation_status.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Windows Activation Status
echo   Displays Windows activation and licensing status.
echo.


call :log "Started"
cscript //nologo "%SystemRoot%\System32\slmgr.vbs" /dli
cscript //nologo "%SystemRoot%\System32\slmgr.vbs" /xpr
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

