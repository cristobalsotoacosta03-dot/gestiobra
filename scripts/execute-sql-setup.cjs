#!/usr/bin/env node

/**
 * Script para ejecutar automáticamente los SQL de setup en Supabase
 * Requiere: SUPABASE_SERVICE_ROLE_KEY en .env
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const os = require('os')

const rootDir = path.resolve(__dirname, '..')

// Cargar variables de entorno
const envPath = path.join(rootDir, '.env')
const envVars = {}

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        envVars[match[1].trim()] = match[2].trim()
      }
    }
  })
}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || 'https://szfikjyaktdpsimpqgxl.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no encontrada en .env')
  console.log()
  console.log('Por favor, agrega esta variable a tu archivo .env:')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJ...')
  console.log()
  console.log('Puedes obtenerla desde:')
  console.log('Supabase Dashboard → Settings → API → service_role key')
  process.exit(1)
}

console.log('🗄️  GestiObra - Setup de Base de Datos')
console.log('='.repeat(60))
console.log(`Supabase URL: ${SUPABASE_URL}`)
console.log(`Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`)
console.log()

// Abrir SQL Editor de Supabase
const sqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_URL.split('//')[1].split('.')[0]}/editor`
console.log('🌐 Abriendo SQL Editor de Supabase...')
console.log(`   URL: ${sqlEditorUrl}`)

// Abrir navegador
const platform = os.platform()
let command

if (platform === 'win32') {
  command = `start ${sqlEditorUrl}`
} else if (platform === 'darwin') {
  command = `open ${sqlEditorUrl}`
} else {
  command = `xdg-open ${sqlEditorUrl}`
}

exec(command, (error) => {
  if (error) {
    console.log('⚠️  No se pudo abrir el navegador automáticamente')
    console.log(`   Por favor, abre manualmente: ${sqlEditorUrl}`)
  } else {
    console.log('✅ Navegador abierto')
  }

  console.log()
  console.log('='.repeat(60))
  console.log('📋 INSTRUCCIONES:')
  console.log('='.repeat(60))
  console.log()
  console.log('1. En el SQL Editor que se abrió:')
  console.log('   - Click en "New query" o el botón "+"')
  console.log()
  console.log('2. Abre el archivo: docs/SCHEMA_DB.sql')
  console.log('   - Copia TODO el contenido')
  console.log('   - Pégalo en el SQL Editor')
  console.log('   - Click en "Run" (botón verde)')
  console.log()
  console.log('3. Espera a que termine (verás "Success")')
  console.log()
  console.log('4. Ahora abre: docs/STRIPE_TABLES.sql')
  console.log('   - Copia TODO el contenido')
  console.log('   - Pégalo en el SQL Editor')
  console.log('   - Click en "Run"')
  console.log()
  console.log('5. Verifica que todo se ejecutó correctamente:')
  console.log('   SELECT tablename FROM pg_tables')
  console.log('   WHERE schemaname = \'public\';')
  console.log()
  console.log('✅ Deberías ver 17 tablas (14 core + 3 Stripe)')
  console.log()
  console.log('='.repeat(60))
  console.log('📋 Próximo paso: Crear usuario admin')
  console.log('   Sigue las instrucciones en docs/CHECKLIST_DESPLIEGUE_FINAL.md')
  console.log('='.repeat(60))
  console.log()
})