# GestiObra — Setup Rápido Supabase

Guía paso a paso para configurar Supabase y conectar con GestiObra

## ✅ Checklist de Configuración Supabase

### 1️⃣ Crear Proyecto Supabase

- [ ] Ir a https://supabase.com
- [ ] Sign Up / Log In
- [ ] Click "New Project"
- [ ] Nombre: `gestiobra`
- [ ] Region: Europa (ej: `eu-central-1`)
- [ ] Database Password: Guardar en lugar seguro
- [ ] Click "Create new project" (esperar 2-3 minutos)

### 2️⃣ Obtener Credenciales

- [ ] En Supabase Dashboard, ir a "Project Settings" (engranaje abajo izq)
- [ ] Tab "API"
- [ ] Copiar:
  - `Project URL` → `VITE_SUPABASE_URL`
  - `anon public` key → `VITE_SUPABASE_ANON_KEY`
- [ ] Pegar en archivo `.env` local

### 3️⃣ Ejecutar Schema de Base de Datos

- [ ] En Supabase, ir a "SQL Editor" (en sidebar izquierdo)
- [ ] Click "+ New Query"
- [ ] Copiar TODO el contenido de `SCHEMA_DB.sql` del proyecto
- [ ] Pegar en el editor de SQL
- [ ] Click "Run" (Ctrl+Enter)
- [ ] Verificar: "0 errors" al final
- [ ] Ir a "Database" → "Tables" y verificar que existen todas las tablas

### 4️⃣ Habilitar Authentication

- [ ] En Supabase, ir a "Authentication" (en sidebar)
- [ ] Click "Providers" (en la left bar dentro de Auth)
- [ ] Buscar "Email"
- [ ] Click el botón de Email para expandir
- [ ] Toggle a ON (activo)
- [ ] Configurar opciones (puedes dejar defaults)
- [ ] Click "Save"

### 5️⃣ Habilitar Row Level Security (RLS)

- [ ] En Supabase, ir a "Database" → "Tables"
- [ ] Para cada tabla, seleccionar y:
  - [ ] empresas → RLS ON
  - [ ] usuarios → RLS ON
  - [ ] obras → RLS ON
  - [ ] materiales → RLS ON
  - [ ] personal → RLS ON
  - [ ] perfiles_profesionales → RLS ON
  - [ ] partidas_presupuesto → RLS ON
  - [ ] imputacion_horas → RLS ON
  - [ ] documentacion → RLS ON

**Nota**: Las políticas de RLS ya se crearon con SCHEMA_DB.sql, así que no necesitas hacer nada más aquí. Esta verificación es solo para confirmar.

### 6️⃣ Crear Bucket de Storage (para documentos)

- [ ] En Supabase, ir a "Storage" (en sidebar)
- [ ] Click "Create new bucket"
- [ ] Nombre: `documentos`
- [ ] Public (marcar checkbox) — NO
- [ ] Click "Create bucket"
- [ ] En el bucket `documentos`:
  - [ ] Click "Policies" (arriba)
  - [ ] Click "+ New policy"
  - [ ] Template: "For public access"
  - [ ] Click "Review"
  - [ ] Click "Save" (esto permite que usuarios descarguen si tienen acceso)

### 7️⃣ Configurar Variables de Entorno Local

En la carpeta raíz del proyecto, editar `.env`:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Nunca commitear este archivo a Git. Está en `.gitignore`.

### 8️⃣ Crear Datos Iniciales (Roles)

Los roles ya se crean automáticamente con SCHEMA_DB.sql, pero puedes verificar:

En Supabase → SQL Editor → New Query:

```sql
SELECT * FROM roles;
```

Deberías ver:
- Admin
- Jefe de Obra
- Operario

Si no aparecen, ejecutar:

```sql
INSERT INTO roles (nombre, descripcion, permisos) VALUES
  ('Admin', 'Administrador del sistema', '["*"]'),
  ('Jefe de Obra', 'Jefe de obra con acceso a presupuestos y personal', '["presupuestos:read", "presupuestos:write", "materiales:read", "personal:manage", "horas:read", "documentacion:manage", "planos:read"]'),
  ('Operario', 'Operario de obra con acceso limitado a móvil', '["horas:write", "planos:read", "tareas:read"]');
```

### 9️⃣ Crear Empresa de Prueba

En Supabase → SQL Editor → New Query:

```sql
INSERT INTO empresas (nombre, cif, email, telefono, direccion, ciudad, cp, pais)
VALUES (
  'Empresa Test',
  '12345678A',
  'empresa@test.com',
  '600000000',
  'Calle Test 123',
  'Madrid',
  '28001',
  'España'
) RETURNING id;
```

Copiar el `id` devuelto, lo necesitarás para el siguiente paso.

### 🔟 Crear Usuario Admin de Prueba

**Via Supabase Dashboard:**

1. Ir a "Authentication" → "Users"
2. Click "Add user" (arriba a la derecha)
3. Email: `admin@test.com`
4. Password: `TestPassword123!`
5. Click "Send invite email" (opcional, puedes desmarcar)
6. Click "Create user"

Luego, en SQL Editor → New Query:

```sql
INSERT INTO usuarios (auth_id, empresa_id, nombre, email, rol_id)
SELECT 
  id,  -- auth_id (viene del usuario creado arriba)
  'EMPRESA_ID_AQUI',  -- Reemplazar con el ID de la empresa
  'Admin Test',
  'admin@test.com',
  (SELECT id FROM roles WHERE nombre = 'Admin')
FROM auth.users 
WHERE email = 'admin@test.com'
ON CONFLICT DO NOTHING;
```

### 1️⃣1️⃣ Verificar Conexión desde App

1. Ir a la carpeta del proyecto: `cd gestiobra`
2. Instalar dependencias: `npm install`
3. Iniciar servidor de desarrollo: `npm run dev`
4. Abrir navegador: http://localhost:5173
5. Ver pantalla de login
6. Intentar login con:
   - Email: `admin@test.com`
   - Password: `TestPassword123!`
7. Si entra al dashboard: ✅ **Todo funciona!**

## 🔧 Troubleshooting

### ❌ "Error: VITE_SUPABASE_URL is not defined"

**Solución**: Verificar que `.env` está en la raíz del proyecto y tiene las variables correctas

```bash
# En Windows (PowerShell)
cat .env

# En Mac/Linux
cat .env
```

### ❌ "Tabla no existe" o "RLS policy violation"

**Solución**: Verificar que SCHEMA_DB.sql se ejecutó correctamente

```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### ❌ "No puedo registrarme"

**Solución**: Verificar que Email auth está habilitado en Supabase → Authentication → Providers

### ❌ "403 Forbidden" en imputación de horas

**Solución**: Verificar que RLS está habilitado y el usuario pertenece a la empresa correcta

```sql
-- Verificar permisos del usuario
SELECT * FROM usuarios WHERE email = 'usuario@test.com';
```

## 📱 Primeros Pasos en la App

1. **Login**: Usa el usuario admin creado
2. **Dashboard**: Ve el resumen de obras (0 al principio)
3. **Crear obra**: En "Gestión de Obras" → "+ Nueva Obra"
4. **Crear materiales**: En "Catálogo" → "+ Nuevo Material"
5. **Crear personal**: En "Personal" → "+ Nuevo Operario"
6. **Imputar horas**: En "Horas" → "+ Registrar Horas"

## 🚀 Próximas Configuraciones

### Email Transaccional (Opcional pero recomendado)

Para que Supabase pueda enviar emails de confirmación:

1. En Supabase → Settings → Email
2. Configurar SMTP personalizado o usar SendGrid
3. (Por defecto, Supabase envía desde su servidor)

### Backups Automáticos

1. En Supabase → Settings → Backups
2. Elegir frecuencia (daily, weekly, monthly)
3. Activar

### Monitoring y Logs

1. En Supabase → Database → Logs
2. Ver queries en tiempo real
3. Identificar problemas de performance

## 📝 Notas Importantes

- **Seguridad**: NUNCA compartir `VITE_SUPABASE_ANON_KEY` público
- **RLS**: Las políticas de seguridad se aplican automáticamente
- **Backups**: Supabase realiza backups automáticos (plan gratuito = 7 días)
- **Rate Limits**: Plan gratuito tiene límites de 500 llamadas/segundo

## 📞 Soporte

- [Documentación Supabase](https://supabase.com/docs)
- [Status de Supabase](https://status.supabase.com)
- Email: support@supabase.io

---

**¿Completaste todo?** Ahora ejecuta `npm run dev` y comienza a usar GestiObra 🚀
