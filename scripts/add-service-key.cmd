@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════════════════════════════
echo   Agregar Service Role Key a .env
echo ════════════════════════════════════════════════════════════════
echo.
echo Abriendo página de Supabase para obtener la key...
echo.
start https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/settings/api
timeout /t 3 >nul
echo.
echo INSTRUCCIONES:
echo.
echo 1. En la página que se abrió, busca "API Keys"
echo 2. Busca "service_role key" (NO la "anon key")
echo 3. Click en "Reveal" para mostrar la clave
echo 4. Copia la clave completa (empieza con sb_secret_...)
echo.
set /p SERVICE_KEY="Pega aquí la service_role key: "
echo.
echo Agregando a .env...
echo.
echo SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%>> .env
echo.
echo ✅ Service Role Key agregada a .env
echo.
echo Ahora ejecuta: node scripts/execute-sql-setup.cjs
echo.
pause