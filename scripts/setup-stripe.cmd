@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════════════════════════════
echo   GestiObra - Configuracion de Stripe
echo ════════════════════════════════════════════════════════════════
echo.
echo Abriendo Stripe Dashboard...
echo.
start https://dashboard.stripe.com/register
timeout /t 3 >nul
echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 1: Crear cuenta en Stripe
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Crea una cuenta en modo TEST
echo 2. Ve a: Developers ^> API keys
echo 3. Copia tus claves:
echo    - Publishable key (pk_test_...)
echo    - Secret key (sk_test_...)
echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 2: Crear Productos y Precios
echo ════════════════════════════════════════════════════════════════
echo.
echo Ve a: Products ^> Add product
echo.
echo Producto 1 - Basic:
echo   Name: GestiObra Basic
echo   Price: 49.00 EUR / month
echo   Copia el Price ID (price_1...)
echo.
echo Producto 2 - Pro:
echo   Name: GestiObra Pro  
echo   Price: 99.00 EUR / month
echo   Copia el Price ID (price_1...)
echo.
echo Producto 3 - Enterprise:
echo   Name: GestiObra Enterprise
echo   Price: 249.00 EUR / month
echo   Copia el Price ID (price_1...)
echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 3: Configurar Webhook
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
echo 2. Ejecuta: stripe login
echo 3. Ejecuta: stripe listen --forward-to localhost:5175/api/stripe/webhook
echo 4. Copia el Webhook secret (whsec_...)
echo.
echo ════════════════════════════════════════════════════════════════
echo   PASO 4: Actualizar Codigo
echo ════════════════════════════════════════════════════════════════
echo.
echo Actualiza los Price IDs en:
echo   - src/pages/Pricing.jsx
echo   - src/components/SubscriptionGate.jsx
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause