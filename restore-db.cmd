@echo off
setlocal
set "FILE=%~1"
if "%FILE%"=="" set "FILE=backup.dump"
if not exist "%FILE%" (
  echo [FAILED] File not found: %FILE%
  echo Usage: restore-db.cmd [file.dump]
  exit /b 1
)
docker exec -i petshop-db pg_restore -U petshop -d petshop --clean --if-exists < "%FILE%"
if errorlevel 1 (
  echo [FAILED] Restore failed.
  exit /b 1
)
echo [OK] Restored from %FILE%
endlocal