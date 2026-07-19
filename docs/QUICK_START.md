# 🚀 QUICK START — GestiObra en 15 minutos

Guía ultra-rápida para tener GestiObra funcionando.

---

## ✅ Paso 1: Setup Local (5 min)

```bash
# Abrir PowerShell en la carpeta gestiobra
cd "c:\Users\Cristóbal Soto\Desktop\gestiobra"

# Instalar dependencias (ya hecho, pero para verificar)
npm install

# Crear archivo .env si no existe
# Copiar y pegar esto (reemplazar XXX con tus datos de Supabase):
# VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Iniciar servidor de desarrollo
npm run dev

# Abre en navegador: http://localhost:5173
```

---

## ✅ Paso 2: Crear Proyecto Supabase (5 min)

1. Ve a https://supabase.com
2. Sign Up / Log In
3. Click "New Project"
   - Nombre: `gestiobra`
   - Region: `eu-central-1` (Europa)
4. Espera 2-3 minutos a que se cree
5. Cuando esté listo:
   - Settings (engranaje abajo izq) → API
   - Copiar `Project URL` → VITE_SUPABASE_URL
   - Copiar `anon public` key → VITE_SUPABASE_ANON_KEY
6. Pega en tu archivo `.env` local

---

## ✅ Paso 3: Ejecutar Schema DB (3 min)

1. En Supabase Dashboard → SQL Editor (sidebar izq)
2. Click "+ New Query"
3. Abre archivo `SCHEMA_DB.sql` de la carpeta `gestiobra`
4. Copia TODO el contenido
5. Pega en el editor de SQL de Supabase
6. Click "Run" o Ctrl+Enter
7. Verifica: Debe decir "0 errors" al final
8. En "Database" → "Tables" deberías ver todas las tablas creadas

---

## ✅ Paso 4: Habilitar Email Auth (1 min)

1. En Supabase → Authentication → Providers
2. Busca "Email"
3. Haz click para expandir
4. Pon el toggle en ON (azul)
5. Click "Save"

---

## ✅ Paso 5: Crear Usuario de Prueba (2 min)

1. En Supabase → Authentication → Users
2. Click "Add user" (arriba a la derecha)
3. Email: `admin@test.com`
4. Password: `TestPassword123!`
5. Click "Create user"

**Luego** en SQL Editor → New Query, ejecuta:

```sql
INSERT INTO usuarios (auth_id, empresa_id, nombre, email, rol_id)
SELECT 
  id,
  '00000000-0000-0000-0000-000000000001',  -- Empresa ID (crear una primero o usar existente)
  'Admin Test',
  'admin@test.com',
  (SELECT id FROM roles WHERE nombre = 'Admin')
FROM auth.users 
WHERE email = 'admin@test.com'
ON CONFLICT DO NOTHING;
```

**Si te da error de empresa_id**: Primero ejecuta:

```sql
INSERT INTO empresas (nombre, cif, email) 
VALUES ('Empresa Test', '12345678A', 'empresa@test.com')
RETURNING id;
```

Copia el ID devuelto y úsalo en la query anterior.

---

## ✅ Paso 6: Loguear en la App (1 min)

1. Verifica que `npm run dev` está corriendo (http://localhost:5173)
2. Deberías ver pantalla de login
3. Email: `admin@test.com`
4. Password: `TestPassword123!`
5. Click "Entrar"
6. ¡LISTO! Estás dentro del Dashboard 🎉

---

## 📊 Qué Hacer Ahora

1. **Dashboard**: Explora el panel principal
2. **Crear Obra**: 
   - Click "🏗️ Obras"
   - Click "+ Nueva Obra"
   - Rellena formulario (Expediente, Nombre, Dirección, etc.)
   - Click "Crear Obra"
3. **Crear Material**:
   - Click "🧱 Materiales"
   - Click "+ Nuevo Material"
   - Ej: Código `TUB-001`, Nombre `Tubería PVC`, Precio coste `5€`, Precio venta `8€`
4. **Crear Personal**:
   - Click "👥 Personal"
   - Crear perfil: "Oficial Fontanería" con coste horario €25/h
   - Crear operario: "Juan García", DNI "12345678A", asignar perfil
5. **Imputar Horas**:
   - Click "⏱️ Horas"
   - Selecciona obra
   - Click "+ Registrar Horas"
   - Operario: Juan García
   - Horas: 8
   - Descripción: "Instalación tuberías"
   - Click "Guardar"

**¡Verás que el Dashboard se actualiza automáticamente con el gasto!**

---

## 🆘 Si Algo Falla

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "VITE_SUPABASE_URL is not defined"
- Verifica que `.env` existe en la raíz
- Verifica que contiene `VITE_SUPABASE_URL=...`
- Reinicia `npm run dev`

### Error: "Tabla no existe"
- Vuelve a ejecutar SCHEMA_DB.sql en Supabase SQL Editor
- Verifica que no hay errores

### Error: "401 Unauthorized"
- Verifica que Email Auth está activado en Supabase
- Verifica credenciales en `.env`
- Prueba logout y login de nuevo

---

## 📁 Archivos Importantes

```
gestiobra/
├── .env                          ← Tu configuración (NO commitear)
├── SCHEMA_DB.sql                 ← SQL para crear la BD
├── ARQUITECTURA_COMPLETA.md      ← Documentación técnica
├── SUPABASE_SETUP_CHECKLIST.md  ← Guía detallada de setup
├── ESTADO_IMPLEMENTACION.md      ← Qué está hecho
├── README_COMPLETO.md            ← README integral
└── src/
    ├── App.jsx                   ← App principal
    ├── components/
    │   ├── LoginPage.jsx
    │   ├── GestorObras.jsx
    │   ├── GestorMateriales.jsx
    │   ├── GestorPersonal.jsx
    │   └── ImputacionHoras.jsx
    └── hooks/
        └── useAuth.js
```

---

## 🎯 Comandos Frecuentes

```bash
# Dev
npm run dev

# Build
npm run build

# Preview de build
npm run preview

# Linter
npm run lint
```

---

## 💡 Tips

- **Mobile**: Usa DevTools (F12) → Toggle device toolbar para ver en móvil
- **Dark Mode**: Tailwind soporta dark mode, edita `tailwind.config.js`
- **Más usuarios**: En Supabase → Users → Add user (igual que Step 5)
- **Más empresas**: SQL: `INSERT INTO empresas ...`
- **Backups**: Supabase hace backups automáticos

---

## ✨ Felicidades

¡Ya tienes **GestiObra funcionando completamente!** 

Ahora:
- 📚 Lee ARQUITECTURA_COMPLETA.md para entender el sistema
- 🔧 Personaliza según tus necesidades
- 🚀 Prepara para desplegar en Vercel o tu servidor

---

**Última actualización**: Enero 2025  
**Versión**: 1.0  
**Status**: ✅ Listo para usar
