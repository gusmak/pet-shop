@echo off
setlocal
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TS=%%i"
set "FILE=backup_%TS%.dump"
docker exec petshop-db pg_dump -U petshop -d petshop -Fc > "%FILE%"
if errorlevel 1 (
  echo [FAILED] Could not backup database.
  exit /b 1
)
echo [OK] Backup saved: %FILE%
endlocal