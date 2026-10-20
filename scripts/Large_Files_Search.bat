@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Large Files Search
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\large_files_search.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Large Files Search
echo   Helps locate large files for manual review instead of deleting them automatically.
echo.


call :log "Started"
set "ROOTDIR=%USERPROFILE%"
set "MINMB=500"
set /p "ROOTDIR=Folder to search, press Enter for your user folder: "
set /p "MINMB=Minimum size in MB, press Enter for 500: "
echo %MINMB%| findstr /r "^[0-9][0-9]*$" >nul || set "MINMB=500"
powershell -NoProfile -Command "Get-ChildItem -LiteralPath $env:ROOTDIR -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt ([int64]$env:MINMB * 1MB) } | Sort-Object Length -Descending | Select-Object -First 30 @{n='SizeMB';e={[math]::Round($_.Length/1MB)}},FullName | Format-Table -AutoSize -Wrap"
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

