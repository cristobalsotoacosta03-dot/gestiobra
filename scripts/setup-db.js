#!/usr/bin/env node

/**
 * Script de ayuda para configurar la base de datos
 * Muestra las instrucciones para ejecutar los SQL en Supabase
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('🗄️  GestiObra - Configuración de Base de Datos')
console.log('='.repeat(60))
console.log()

// Leer archivos SQL
const schemaDbPath = path.join(rootDir, 'docs/SCHEMA_DB.sql')
const stripeTablesPath = path.join(rootDir, 'docs/STRIPE_TABLES.sql')

console.log('📋 PASO 1: Ejecutar Schema Core')
console.log('-'.repeat(60))
console.log('1. Abre Supabase Dashboard:')
console.log('   https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/editor')
console.log()
console.log('2. Ve a "SQL Editor"')
console.log()
console.log('3. Copia y pega el contenido de: docs/SCHEMA_DB.sql')
console.log()
console.log('4. Click en "Run"')
console.log()
console.log('5. Verifica que se crearon 14 tablas ejecutando:')
console.log('   SELECT tablename FROM pg_tables WHERE schemaname = \'public\' AND tablename NOT LIKE \'pg_%\';')
console.log()

// Verificar que el archivo existe
if (fs.existsSync(schemaDbPath)) {
  const content = fs.readFileSync(schemaDbPath, 'utf-8')
  const lineCount = content.split('\n').length
  console.log(`✅ docs/SCHEMA_DB.sql encontrado (${lineCount} líneas)`)
} else {
  console.log('❌ docs/SCHEMA_DB.sql NO ENCONTRADO')
  process.exit(1)
}

console.log()
console.log('📋 PASO 2: Ejecutar Schema Stripe')
console.log('-'.repeat(60))
console.log('1. En el mismo SQL Editor')
console.log()
console.log('2. Copia y pega el contenido de: docs/STRIPE_TABLES.sql')
console.log()
console.log('3. Click en "Run"')
console.log()
console.log('4. Verifica que se crearon las tablas:')
console.log('   SELECT tablename FROM pg_tables WHERE schemaname = \'public\' AND tablename IN (\'customers\', \'subscriptions\', \'plans\');')
console.log()
console.log('5. Verifica que se insertaron los planes:')
console.log('   SELECT * FROM plans;')
console.log('   (Debería mostrar: basic €49, pro €99, enterprise €249)')
console.log()

if (fs.existsSync(stripeTablesPath)) {
  const content = fs.readFileSync(stripeTablesPath, 'utf-8')
  const lineCount = content.split('\n').length
  console.log(`✅ docs/STRIPE_TABLES.sql encontrado (${lineCount} líneas)`)
} else {
  console.log('❌ docs/STRIPE_TABLES.sql NO ENCONTRADO')
  process.exit(1)
}

console.log()
console.log('📋 PASO 3: Crear Usuario Admin')
console.log('-'.repeat(60))
console.log('1. Ve a Authentication → Users')
console.log('2. Crea un usuario:')
console.log('   Email: admin@gestiobra.com')
console.log('   Password: [tu contraseña segura]')
console.log()
console.log('3. En SQL Editor, ejecuta:')
console.log()
console.log('   -- Crear empresa')
console.log('   INSERT INTO empresas (nombre, cif, email, activo)')
console.log('   VALUES (\'GestiObra Demo\', \'B12345678\', \'admin@gestiobra.com\', true)')
console.log('   RETURNING id;')
console.log()
console.log('   -- Crear rol admin')
console.log('   INSERT INTO roles (nombre, descripcion, permisos)')
console.log('   VALUES (\'admin\', \'Administrador del sistema\', \'{"all": true}\')')
console.log('   RETURNING id;')
console.log()
console.log('   -- Vincular usuario (reemplaza los UUIDs)')
console.log('   INSERT INTO usuarios (auth_id, empresa_id, rol_id, nombre, email, activo)')
console.log('   VALUES (\'UUID_DEL_USUARIO\', \'UUID_DE_EMPRESA\', \'UUID_DE_ROL\', \'Admin GestiObra\', \'admin@gestiobra.com\', true);')
console.log()

console.log('='.repeat(60))
console.log('✅ Instrucciones generadas')
console.log('='.repeat(60))
console.log()
console.log('Después de ejecutar los SQL, continúa con el PASO 2: Configurar Stripe')
console.log()

// Verificar que los archivos existen
const allFilesExist = fs.existsSync(schemaDbPath) && fs.existsSync(stripeTablesPath)
process.exit(allFilesExist ? 0 : 1)