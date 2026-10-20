"""Generates the 40 MFix batch scripts and backend/tools.json. Edit the table, then run: python tools/gen_scripts.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATS = {1: 'Storage and performance', 2: 'Error fixing', 3: 'Diagnostics', 4: 'Advanced cleanup'}
CLEAN = r'''
:clean
if not exist "%~1" exit /b
for /d %%D in ("%~1\*") do rd /s /q "%%~D" 2>nul
del /f /q "%~1\*" 2>nul
exit /b
'''
KILLX = 'taskkill /f /im explorer.exe >nul 2>&1'
T = []
def A(f, c, d, body='', admin=0, ask=None, subs=''):
    T.append(dict(f=f, c=c, d=d, body=body.strip('\n'), admin=bool(admin), ask=ask, subs=subs))

A('Temp_Cleaner', 1, 'Deletes eligible temporary files from Windows and user temp folders. Some files may be in use.',
  'call :clean "%TEMP%"\ncall :clean "%SystemRoot%\\Temp"\necho Cleanup finished. Files in use were skipped.',
  ask='This deletes temporary files from your user temp folder and the Windows temp folder.', subs=CLEAN)
A('Disk_Space_Check', 1, 'Displays used and free space on available drives.',
  '''powershell -NoProfile -Command "Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | Select-Object Name,@{n='UsedGB';e={[math]::Round($_.Used/1GB,1)}},@{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}} | Format-Table -AutoSize"''')
A('Update_Cache_Cleaner', 1, 'Clears selected Windows Update download cache files. Windows may need to download updates again.',
  r'''net stop wuauserv
net stop bits
for /d %%D in ("%SystemRoot%\SoftwareDistribution\Download\*") do rd /s /q "%%~D"
del /f /q "%SystemRoot%\SoftwareDistribution\Download\*" 2>nul
!net start bits
!net start wuauserv
echo Update cache cleared.''', admin=1, ask='This clears the Windows Update download cache. Windows may need to download updates again.')
A('DNS_Flush', 1, 'Clears cached DNS lookups to troubleshoot certain website connection problems.', '!ipconfig /flushdns', admin=1)
A('Recycle_Bin_Cleaner', 1, 'Empties the Recycle Bin after confirmation. Contents are permanently removed.',
  'powershell -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"\necho Recycle Bin emptied.', ask='This permanently deletes everything in the Recycle Bin.')
A('Windows_Component_Cleanup', 1, 'Uses DISM to clean up superseded Windows components where supported.',
  '!dism /online /Cleanup-Image /StartComponentCleanup', admin=1, ask='This removes superseded Windows components and can take several minutes.')
A('System_File_Repair', 2, 'Runs SFC to scan and repair protected Windows system files.', '!sfc /scannow', admin=1)
A('DISM_Image_Repair', 2, 'Uses DISM to repair the Windows component image.', '!dism /online /Cleanup-Image /RestoreHealth', admin=1)
A('Disk_Error_Check', 2, 'Runs an online file system scan to check for disk errors.', '!chkdsk %SystemDrive% /scan', admin=1)
A('Network_Reset', 2, 'Resets selected networking components to troubleshoot connection problems.',
  '!netsh winsock reset\n!netsh int ip reset\necho Restart your PC to finish the reset.', admin=1, ask='This resets Winsock and the IP stack. A restart is recommended afterwards.')
A('IP_Refresh', 2, 'Releases and renews an IP address where supported by the network configuration.',
  'ipconfig /release\n!ipconfig /renew', admin=1, ask='Your network connection will drop briefly.')
A('Winsock_Repair', 2, 'Resets the Winsock catalog to help resolve some network errors.', '!netsh winsock reset', admin=1,
  ask='This resets the Winsock catalog. A restart is recommended afterwards.')
A('Windows_Update_Troubleshooter', 2, 'Opens built in Windows troubleshooting or update settings.',
  '''choice /c 12 /n /m "Press 1 for Troubleshooters or 2 for Windows Update settings: "
if errorlevel 2 goto wu
start "" ms-settings:troubleshoot
goto done
:wu
start "" ms-settings:windowsupdate''')
A('Audio_Service_Restart', 2, 'Restarts relevant Windows audio services when possible.',
  'net stop audiosrv /y\nnet stop AudioEndpointBuilder /y\n!net start AudioEndpointBuilder\n!net start audiosrv', admin=1)
A('Print_Spooler_Fix', 2, 'Restarts the print spooler to resolve certain stuck print jobs.',
  'net stop spooler\ndel /f /q "%SystemRoot%\\System32\\spool\\PRINTERS\\*" 2>nul\n!net start spooler', admin=1, ask='Pending print jobs will be cleared.')
A('Thumbnail_Cache_Reset', 2, 'Rebuilds thumbnail caches when File Explorer previews are missing or incorrect.',
  KILLX + '\ndel /f /q "%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer\\thumbcache_*.db" 2>nul\nstart "" explorer.exe', ask='File Explorer will restart and thumbnails will rebuild.')
A('Icon_Cache_Reset', 2, 'Rebuilds the icon cache when desktop or File Explorer icons appear incorrect.',
  KILLX + '\ndel /a /f /q "%LOCALAPPDATA%\\IconCache.db" 2>nul\ndel /a /f /q "%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer\\iconcache_*.db" 2>nul\nstart "" explorer.exe', ask='File Explorer will restart and icons will rebuild.')
A('File_Explorer_Restart', 2, 'Restarts Windows Explorer if the taskbar or desktop becomes unresponsive.',
  KILLX + '\nstart "" explorer.exe', ask='Open File Explorer windows will close.')
A('DNS_And_Network_Fix', 2, 'Combines DNS flushing with selected network diagnostics.',
  '!ipconfig /flushdns\n!ping -n 3 1.1.1.1\nnslookup example.com', admin=1)
A('Windows_Activation_Status', 2, 'Displays Windows activation and licensing status.',
  'cscript //nologo "%SystemRoot%\\System32\\slmgr.vbs" /dli\ncscript //nologo "%SystemRoot%\\System32\\slmgr.vbs" /xpr')
A('Startup_Apps_Report', 3, 'Lists common startup locations and entries for review.',
  r'''powershell -NoProfile -Command "Get-CimInstance Win32_StartupCommand | Select-Object Name,Location,Command | Format-List"
reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run
dir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"''')
A('Running_Processes', 3, 'Displays running processes and available process information.', 'tasklist')
A('Battery_Report', 3, 'Generates a battery health and usage report on supported laptops.',
  '''if not exist "%REPORTS%" mkdir "%REPORTS%"
powercfg /batteryreport /output "%REPORTS%\\MFix_Battery_Report.html"
if errorlevel 1 goto nobat
echo Report saved to the MFix Reports folder in Documents.
start "" "%REPORTS%\\MFix_Battery_Report.html"
goto done
:nobat
set "RC=1"
echo No battery report could be created on this device.''')
A('WiFi_Report', 3, 'Shows wireless interface status and saved Wi Fi profile names without exposing passwords.',
  'netsh wlan show interfaces\nnetsh wlan show profiles')
A('System_Information', 3, 'Displays Windows version, hardware and system information.', 'systeminfo')
A('Driver_Information', 3, 'Generates a report of installed drivers.',
  'if not exist "%REPORTS%" mkdir "%REPORTS%"\ndriverquery /v /fo csv > "%REPORTS%\\MFix_Drivers.csv"\necho Driver report saved to the MFix Reports folder in Documents.')
A('Large_Files_Search', 3, 'Helps locate large files for manual review instead of deleting them automatically.',
  '''set "ROOTDIR=%USERPROFILE%"
set "MINMB=500"
set /p "ROOTDIR=Folder to search, press Enter for your user folder: "
set /p "MINMB=Minimum size in MB, press Enter for 500: "
echo %MINMB%| findstr /r "^[0-9][0-9]*$" >nul || set "MINMB=500"
powershell -NoProfile -Command "Get-ChildItem -LiteralPath $env:ROOTDIR -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt ([int64]$env:MINMB * 1MB) } | Sort-Object Length -Descending | Select-Object -First 30 @{n='SizeMB';e={[math]::Round($_.Length/1MB)}},FullName | Format-Table -AutoSize -Wrap"''')
A('Memory_Diagnostic', 3, 'Offers to launch Windows Memory Diagnostic. A restart may be required.', 'start "" mdsched.exe', admin=1,
  ask='Windows Memory Diagnostic will open and can restart your PC to run a test.')
A('Power_Efficiency_Report', 3, 'Generates a power efficiency report where supported.',
  '''if not exist "%REPORTS%" mkdir "%REPORTS%"
echo Keep the PC idle for about one minute while the trace runs.
powercfg /energy /output "%REPORTS%\\MFix_Energy_Report.html"
if errorlevel 1 goto bad
start "" "%REPORTS%\\MFix_Energy_Report.html"
goto done
:bad
set "RC=1"
echo The energy report could not be created.''', admin=1)
A('Event_Log_Viewer', 3, 'Opens Event Viewer to investigate system errors and warnings.', 'start "" eventvwr.msc')
A('Windows_Temp_Cleaner', 4, 'Cleans eligible files in Windows temporary directories.', 'call :clean "%SystemRoot%\\Temp"\necho Cleanup finished.',
  admin=1, ask='This deletes eligible files in the Windows temp folder.', subs=CLEAN)
A('User_Temp_Cleaner', 4, 'Cleans eligible temporary files for the current user.', 'call :clean "%TEMP%"\necho Cleanup finished.',
  ask='This deletes eligible files in your user temp folder.', subs=CLEAN)
A('Delivery_Optimization_Cleaner', 4, 'Guides the user to Windows cleanup options for the update delivery cache.',
  '''choice /c 12 /n /m "Press 1 for Delivery Optimization settings or 2 for Disk Cleanup: "
if errorlevel 2 goto dc
start "" ms-settings:delivery-optimization
goto done
:dc
start "" cleanmgr.exe''')
A('Component_Store_Analysis', 4, 'Reports Windows component store cleanup information using DISM.', '!dism /online /Cleanup-Image /AnalyzeComponentStore', admin=1)
A('Storage_Sense_Settings', 4, 'Opens Storage Sense settings for automatic cleanup.', 'start "" ms-settings:storagesense')
A('Hibernation_Control', 4, 'Offers a choice to disable hibernation and reclaim space. This affects hibernation and may affect Fast Startup.',
  '''choice /c 123 /n /m "Press 1 to turn hibernation off, 2 to turn it on, 3 to cancel: "
set "PICK=%errorlevel%"
if "%PICK%"=="3" goto cancel
if "%PICK%"=="1" powercfg /hibernate off
if "%PICK%"=="2" powercfg /hibernate on
echo Done. Fast Startup may be affected.
goto done
:cancel
echo Cancelled. Nothing was changed.
set "RC=2"''', admin=1)
A('Optimize_Drive', 4, 'Opens the Windows drive optimization tool.', 'start "" dfrgui.exe')
A('Clipboard_Reset', 4, 'Clears clipboard contents after confirmation.', 'echo off| clip\necho Clipboard cleared.', ask='Your clipboard contents will be cleared.')
A('System_Restore_Settings', 4, 'Opens System Protection settings to review restore points.', 'start "" SystemPropertiesProtection.exe')
STARTER = ['Temp_Cleaner', 'Disk_Space_Check', 'DNS_Flush', 'System_File_Repair', 'DISM_Image_Repair', 'Network_Reset', 'File_Explorer_Restart', 'Print_Spooler_Fix', 'Battery_Report']
menu = ['cls', 'echo   MFix Maintenance Menu', 'echo.'] + [f'echo   {i}  {n.replace("_", " ")}' for i, n in enumerate(STARTER, 1)] + ['echo   0  Exit', 'echo.',
        'set "PICK="', 'set /p "PICK=Enter a number: "', 'if "%PICK%"=="0" goto done'] + [f'if "%PICK%"=="{i}" call "%~dp0{n}.bat"' for i, n in enumerate(STARTER, 1)] + ['goto menu']
menu_body = '\n'.join(['echo Pick a tool to run.', ':menu'] + menu)
A('Maintenance_Menu', 4, 'Provides a menu to launch selected maintenance scripts.', menu_body)
assert len(T) == 40

TEMPLATE = r'''@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MFix @@TITLE@@
set "RC=0"
set "LOGDIR=%LOCALAPPDATA%\MFix\logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOG=%LOGDIR%\@@ID@@.log"
set "REPORTS=%USERPROFILE%\Documents\MFix Reports"
echo.
echo   MFix  @@TITLE@@
echo   @@DESC@@
echo.
@@ADMIN@@
@@ASK@@
call :log "Started"
@@BODY@@
:done
call :log "Finished with code %RC%"
echo.
echo Finished. Press any key to close.
pause >nul
exit /b %RC%

:log
>>"%LOG%" echo [%date% %time%] %~1
exit /b
@@SUBS@@
'''
ADMIN = '''net session >nul 2>&1
if errorlevel 1 (
  echo Administrator rights are needed. Requesting them now.
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 3
)'''
ASK = '''choice /c YN /n /m "@@Q@@ Press Y to continue or N to cancel: "
if errorlevel 2 (
  echo Cancelled. Nothing was changed.
  call :log "Cancelled by user"
  exit /b 2
)'''
BAD = set('%!^&|<>"')
def expand(body):
    out = []
    for l in body.splitlines():
        out += [l[1:], 'if errorlevel 1 set "RC=1"'] if l.startswith('!') else [l]
    return '\n'.join(out)

os.makedirs(os.path.join(ROOT, 'scripts'), exist_ok=True)
meta = []
for t in T:
    title = t['f'].replace('_', ' ')
    for s in (t['d'], t['ask'] or ''):
        assert not (set(s) & BAD), (t['f'], s)
    txt = (TEMPLATE.replace('@@TITLE@@', title).replace('@@ID@@', t['f'].lower()).replace('@@DESC@@', t['d'])
           .replace('@@ADMIN@@', ADMIN if t['admin'] else '').replace('@@ASK@@', ASK.replace('@@Q@@', t['ask']) if t['ask'] else '')
           .replace('@@BODY@@', expand(t['body'])).replace('@@SUBS@@', t['subs'].strip('\n')))
    txt.encode('ascii')
    with open(os.path.join(ROOT, 'scripts', t['f'] + '.bat'), 'w', newline='\r\n') as fh:
        fh.write(txt)
    meta.append(dict(id=t['f'].lower(), file=t['f'] + '.bat', cat=t['c'], title=title, desc=t['d'], admin=t['admin'], ask=bool(t['ask'])))
with open(os.path.join(ROOT, 'backend', 'tools.json'), 'w', encoding='utf-8') as fh:
    json.dump(dict(cats=CATS, tools=meta), fh, indent=1)
print('generated', len(meta), 'scripts')
