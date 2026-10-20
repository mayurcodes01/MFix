@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Startup Apps Report
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\startup_apps_report.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Startup Apps Report
echo   Lists common startup locations and entries for review.
echo.


call :log "Started"
powershell -NoProfile -Command "Get-CimInstance Win32_StartupCommand | Select-Object Name,Location,Command | Format-List"
reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run
dir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

