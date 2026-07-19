@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════════════════════════════
echo   GestiObra - Configuracion de Base de Datos
echo ════════════════════════════════════════════════════════════════
echo.
echo Abriendo Supabase SQL Editor...
echo.
start https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/editor
timeout /t 3 >nul
echo.
echo ════════════════════════════════════════════════════════════════
echo   INSTRUCCIONES:
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. En el SQL Editor que se abrio:
echo    - Click en "New query" o el boton "+"
echo.
echo 2. Abre el archivo: docs\SCHEMA_DB.sql
echo    - Copia TODO el contenido
echo    - Pegalo en el SQL Editor
echo    - Click en "Run" (boton verde)
echo.
echo 3. Espera a que termine (veras "Success")
echo.
echo 4. Ahora abre: docs\STRIPE_TABLES.sql
echo    - Copia TODO el contenido
echo    - Pegalo en el SQL Editor
echo    - Click en "Run"
echo.
echo 5. Verifica que todo se ejecuto correctamente:
echo    SELECT tablename FROM pg_tables
echo    WHERE schemaname = 'public';
echo.
echo ✅ Deberias ver 17 tablas (14 core + 3 Stripe)
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause