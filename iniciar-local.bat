@echo off
setlocal
set "PROJECT_DIR=%~dp0"

if not exist "C:\xampp\php\php.exe" (
  echo No encuentro C:\xampp\php\php.exe. Verifica la ruta de XAMPP.
  pause
  exit /b 1
)

set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM_CMD%" (
  for /f "delims=" %%N in ('where.exe npm.cmd 2^>nul') do set "NPM_CMD=%%N"
)
if not exist "%NPM_CMD%" (
  echo No encuentro npm.cmd. Instala Node.js LTS y abre una consola nueva.
  pause
  exit /b 1
)

C:\xampp\mysql\bin\mysql.exe -h 127.0.0.1 -P 3306 -u root -e "SELECT 1 FROM pet_care.duenos LIMIT 1" >nul 2>nul
if errorlevel 1 (
  echo No puedo conectar con pet_care. Inicia MySQL desde el panel de XAMPP y revisa la contrasena de root.
  pause
  exit /b 1
)

start "VetMedellin API PHP" /D "%PROJECT_DIR%vetmedellin-backend" "C:\xampp\php\php.exe" -S 127.0.0.1:8000
start "VetMedellin Frontend Next.js" /D "%PROJECT_DIR%vet-medellin-frontend" cmd.exe /k ""%NPM_CMD%" run dev"
echo VetMedellin se esta iniciando. Abre la URL que muestre la ventana del frontend (normalmente http://127.0.0.1:3000).
endlocal
