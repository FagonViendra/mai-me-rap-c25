@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 goto run_py
where python >nul 2>nul
if not errorlevel 1 goto run_python
echo Khong tim thay Python 3. Co the mo MAI_ME_RAP.html truc tiep de xem game.
echo De choi va luu o dia chi on dinh, can Python 3 va chay lai tep nay.
if not "%~1"=="--no-open" pause
exit /b 1
:run_py
py -3 "%~dp0open_or_serve.py" %*
set "MAIMERAP_EXIT=%ERRORLEVEL%"
goto finish
:run_python
python "%~dp0open_or_serve.py" %*
set "MAIMERAP_EXIT=%ERRORLEVEL%"
:finish
if not "%MAIMERAP_EXIT%"=="0" if not "%~1"=="--no-open" pause
exit /b %MAIMERAP_EXIT%
