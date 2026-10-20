@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix WiFi Report
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\wifi_report.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  WiFi Report
echo   Shows wireless interface status and saved Wi Fi profile names without exposing passwords.
echo.


call :log "Started"
netsh wlan show interfaces
netsh wlan show profiles
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

