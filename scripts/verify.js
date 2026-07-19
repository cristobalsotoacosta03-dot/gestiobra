#!/usr/bin/env node

/**
 * Script de verificación pre-deploy para GestiObra
 * Verifica: variables de entorno, conexión Supabase, rutas críticas, build assets
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('🔍 Verificando entorno de GestiObra...\n')

let errors = 0
let warnings = 0

// 1. Verificar variables de entorno
console.log('📋 Variables de entorno:')
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_URL',
  'VITE_APP_NAME',
  'VITE_STRIPE_PUBLISHABLE_KEY'
]

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_POSTHOG_KEY',
  'VITE_SENTRY_DSN'
]

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: ${process.env[varName].substring(0, 30)}...`)
  } else {
    console.log(`  ❌ ${varName}: FALTANTE (obligatoria)`)
    errors++
  }
})

optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: ${process.env[varName].substring(0, 30)}...`)
  } else {
    console.log(`  ⚠️  ${varName}: FALTANTE (opcional)`)
    warnings++
  }
})

// 2. Verificar archivos de configuración
console.log('\n📁 Archivos de configuración:')
const configFiles = [
  '.env',
  '.env.example',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'package.json'
]

configFiles.forEach(file => {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file}: NO ENCONTRADO`)
    errors++
  }
})

// 3. Verificar estructura de directorios
console.log('\n📂 Estructura de directorios:')
const requiredDirs = [
  'src',
  'src/components',
  'src/pages',
  'src/hooks',
  'src/lib',
  'src/data',
  'public',
  'docs'
]

requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir)
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`  ✅ ${dir}/`)
  } else {
    console.log(`  ❌ ${dir}/: NO ENCONTRADO`)
    errors++
  }
})

// 4. Verificar archivos críticos de código
console.log('\n🔧 Archivos de código críticos:')
const criticalFiles = [
  'src/lib/supabase.js',
  'src/hooks/useAuth.js',
  'src/hooks/useObras.js',
  'src/hooks/usePresupuestos.js',
  'src/App.jsx',
  'src/pages/Dashboard.jsx'
]

criticalFiles.forEach(file => {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file}: NO ENCONTRADO`)
    errors++
  }
})

// 5. Verificar package.json scripts
console.log('\n📦 Scripts npm:')
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
const requiredScripts = ['dev', 'build', 'preview', 'dev:lan', 'verify']

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ npm run ${script}`)
  } else {
    console.log(`  ❌ npm run ${script}: FALTANTE`)
    errors++
  }
})

// 6. Verificar archivos de Stripe
console.log('\n💳 Sistema de pagos Stripe:')
const stripeFiles = [
  'src/lib/stripe.js',
  'src/hooks/useSubscription.js',
  'src/components/SubscriptionGate.jsx',
  'src/pages/Pricing.jsx',
  'src/pages/Billing.jsx',
  'api/stripe/checkout.js',
  'api/stripe/webhook.js',
  'api/stripe/portal.js',
  'docs/STRIPE_TABLES.sql'
]

stripeFiles.forEach(file => {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file}: NO ENCONTRADO`)
    errors++
  }
})

// 7. Verificar node_modules
console.log('\n📚 Dependencias:')
const nodeModulesPath = path.join(rootDir, 'node_modules')
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✅ node_modules/ existe')
  
  // Verificar dependencias críticas
  const criticalDeps = ['react', 'react-dom', 'vite', '@supabase/supabase-js', '@tailwindcss/postcss']
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep)
    if (fs.existsSync(depPath)) {
      console.log(`  ✅ ${dep}`)
    } else {
      console.log(`  ❌ ${dep}: NO INSTALADO`)
      errors++
    }
  })
} else {
  console.log('  ❌ node_modules/ NO EXISTE - Ejecuta: npm install')
  errors++
}

// 8. Resumen
console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN DE VERIFICACIÓN')
console.log('='.repeat(60))

if (errors === 0 && warnings === 0) {
  console.log('✅ Todo está listo para deploy!')
  process.exit(0)
} else {
  console.log(`❌ Errores: ${errors}`)
  console.log(`⚠️  Advertencias: ${warnings}`)
  
  if (errors > 0) {
    console.log('\n🔧 Acciones requeridas:')
    console.log('  1. Completa las variables de entorno faltantes en .env')
    console.log('  2. Ejecuta: npm install')
    console.log('  3. Corrige los errores listados arriba')
    process.exit(1)
  } else {
    console.log('\n⚠️  Advertencias (opcionales pero recomendadas):')
    console.log('  - Configura Stripe para pagos')
    console.log('  - Configura PostHog para analítica')
    console.log('  - Configura Sentry para monitoreo de errores')
    process.exit(0)
  }
}