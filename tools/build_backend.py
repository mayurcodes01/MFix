"""Bundles backend/mfix_backend.py into build/backend/mfix_backend.exe so installed copies need no Python. Needs: pip install pyinstaller"""
import os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'build', 'backend')
WORK = os.path.join(ROOT, 'build', 'pyi')
shutil.rmtree(OUT, ignore_errors=True)
subprocess.check_call([sys.executable, '-m', 'PyInstaller', '--onefile', '--noconsole', '--name', 'mfix_backend',
                       '--distpath', OUT, '--workpath', WORK, '--specpath', WORK, os.path.join(ROOT, 'backend', 'mfix_backend.py')])
shutil.copy(os.path.join(ROOT, 'backend', 'tools.json'), OUT)
print('backend bundled in', OUT)
