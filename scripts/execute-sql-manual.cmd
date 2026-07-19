@echo off
chcp 65001 >nul
cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   EJECUTAR SQL EN SUPABASE - PASO A PASO
echo ════════════════════════════════════════════════════════════════
echo.
echo Este script te guiará para ejecutar los SQL manualmente.
echo.
pause
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 1: Abrir SQL Editor
echo ════════════════════════════════════════════════════════════════
echo.
echo Abriendo Supabase SQL Editor...
echo.
start https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/editor
timeout /t 3 >nul
echo.
echo ✅ Navegador abierto
echo.
echo Si no se abrió automáticamente, ve a:
echo https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/editor
echo.
pause
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 2: Ejecutar SCHEMA_DB.sql
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. En el SQL Editor, click en "New query" o el botón "+"
echo.
echo 2. Abre el archivo: docs\SCHEMA_DB.sql
echo    (En VS Code, click derecho ^> "Reveal in File Explorer")
echo.
echo 3. Abre el archivo con el Bloc de notas o tu editor
echo.
echo 4. Selecciona TODO el contenido (Ctrl+A)
echo 5. Cópialo (Ctrl+C)
echo.
echo 6. Pégalo en el SQL Editor de Supabase (Ctrl+V)
echo.
echo 7. Click en el botón "Run" (verde) o presiona Ctrl+Enter
echo.
echo 8. Espera 10-20 segundos hasta que aparezca "Success"
echo.
echo ⚠️  IMPORTANTE: No cierres el navegador aún
echo.
pause
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 3: Ejecutar STRIPE_TABLES.sql
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. En el SQL Editor, click en "New query" nuevamente
echo.
echo 2. Abre el archivo: docs\STRIPE_TABLES.sql
echo.
echo 3. Selecciona TODO el contenido (Ctrl+A)
echo 4. Cópialo (Ctrl+C)
echo.
echo 5. Pégalo en el SQL Editor (Ctrl+V)
echo.
echo 6. Click en "Run" (verde)
echo.
echo 7. Espera 5-10 segundos
echo.
pause
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 4: Verificar que todo se ejecutó correctamente
echo ════════════════════════════════════════════════════════════════
echo.
echo En el SQL Editor, ejecuta esta consulta:
echo.
echo   SELECT tablename FROM pg_tables
echo   WHERE schemaname = 'public';
echo.
echo Presiona Enter cuando hayas ejecutado la consulta...
echo.
pause
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo   ✅ VERIFICACIÓN
echo ════════════════════════════════════════════════════════════════
echo.
echo ¿Cuántas tablas viste en el resultado?
echo.
echo Deberías ver 17 tablas:
echo   - empresas
echo   - roles
echo   - usuarios
echo   - obras
echo   - materiales
echo   - perfiles_profesionales
echo   - personal
echo   - partidas_presupuesto
echo   - partida_materiales
echo   - imputacion_horas
echo   - documentacion
echo   - auditoria
echo   - customers (Stripe)
echo   - subscriptions (Stripe)
echo   - plans (Stripe)
echo.
echo Si viste menos de 17 tablas, algo salió mal.
echo Si viste 17 tablas, ¡perfecto! 🎉
echo.
pause
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo   🎉 PASO 1 COMPLETADO
echo ════════════════════════════════════════════════════════════════
echo.
echo La base de datos está configurada correctamente.
echo.
echo 📋 Próximo paso: Crear usuario admin
echo.
echo Sigue las instrucciones en:
echo docs\CHECKLIST_DESPLIEGUE_FINAL.md
echo.
echo O ejecuta el script de Stripe:
echo scripts\setup-stripe-complete.cmd
echo.
pause