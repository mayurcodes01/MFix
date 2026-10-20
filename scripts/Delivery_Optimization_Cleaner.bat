@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Delivery Optimization Cleaner
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\delivery_optimization_cleaner.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Delivery Optimization Cleaner
echo   Guides the user to Windows cleanup options for the update delivery cache.
echo.


call :log "Started"
choice /c 12 /n /m "Press 1 for Delivery Optimization settings or 2 for Disk Cleanup: "
if errorlevel 2 goto dc
start "" ms-settings:delivery-optimization
goto done
:dc
start "" cleanmgr.exe
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

