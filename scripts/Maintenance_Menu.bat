@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix Maintenance Menu
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\maintenance_menu.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  Maintenance Menu
echo   Provides a menu to launch selected maintenance scripts.
echo.


call :log "Started"
echo Pick a tool to run.
:menu
cls
echo   MFix Maintenance Menu
echo.
echo   1  Temp Cleaner
echo   2  Disk Space Check
echo   3  DNS Flush
echo   4  System File Repair
echo   5  DISM Image Repair
echo   6  Network Reset
echo   7  File Explorer Restart
echo   8  Print Spooler Fix
echo   9  Battery Report
echo   0  Exit
echo.
set "PICK="
set /p "PICK=Enter a number: "
if "%PICK%"=="0" goto done
if "%PICK%"=="1" call "%~dp0Temp_Cleaner.bat"
if "%PICK%"=="2" call "%~dp0Disk_Space_Check.bat"
if "%PICK%"=="3" call "%~dp0DNS_Flush.bat"
if "%PICK%"=="4" call "%~dp0System_File_Repair.bat"
if "%PICK%"=="5" call "%~dp0DISM_Image_Repair.bat"
if "%PICK%"=="6" call "%~dp0Network_Reset.bat"
if "%PICK%"=="7" call "%~dp0File_Explorer_Restart.bat"
if "%PICK%"=="8" call "%~dp0Print_Spooler_Fix.bat"
if "%PICK%"=="9" call "%~dp0Battery_Report.bat"
goto menu
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b

