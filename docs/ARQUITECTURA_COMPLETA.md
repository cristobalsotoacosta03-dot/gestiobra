# GestiObra — Documentación de Arquitectura y Configuración

## 📋 Descripción del Proyecto

**GestiObra** es una plataforma de gestión integral para el control técnico, logístico y económico de instalaciones (Gas, Calefacción, PCI, Fontanería, Albañilería). Diseñada para ser utilizada en oficina técnica y en campo mediante dispositivos móviles.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: React 19 + Vite 8 + Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth (JWT)
- **Authorization**: Row Level Security (RLS) + Role-Based Access Control (RBAC)
- **Real-time**: Supabase Realtime subscriptions

### Estructura de Carpetas

```
gestiobra/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── LoginPage.jsx         # Autenticación
│   │   ├── GestorMateriales.jsx  # CRUD Catálogo
│   │   ├── GestorPersonal.jsx    # Personal + Perfiles
│   │   ├── GestorObras.jsx       # Gestión de proyectos
│   │   └── ImputacionHoras.jsx   # Registro de horas
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js            # Autenticación y sesión
│   │   ├── useCalculos.js
│   │   ├── useObras.js
│   │   ├── usePartidas.js
│   │   └── usePresupuestos.js
│   ├── pages/               # Páginas principales
│   │   ├── Dashboard.jsx
│   │   ├── DashboardAdvanced.jsx
│   │   ├── Obras.jsx
│   │   ├── Presupuestos.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Calculadoras.jsx
│   │   └── Materiales.jsx
│   ├── lib/                 # Utilidades
│   │   ├── supabase.js           # Cliente Supabase
│   │   └── constants.js
│   ├── data/                # Datos estáticos y mocks
│   │   ├── catalogo-tecnico.js
│   │   └── mocks.js
│   ├── App.jsx              # Componente raíz
│   ├── main.jsx             # Punto de entrada
│   ├── index.css            # Estilos globales
│   └── App.css
├── public/                  # Activos estáticos
├── .env                     # Variables de entorno (NO COMMITEAR)
├── .env.example             # Template .env
├── vite.config.js           # Configuración Vite
├── tailwind.config.js       # Configuración Tailwind
├── postcss.config.js        # Configuración PostCSS
├── eslint.config.js         # Linting
├── SCHEMA_DB.sql            # DDL de base de datos
├── SUPABASE_SETUP.sql       # SQL inicial (deprecated, usar SCHEMA_DB.sql)
├── package.json
├── vercel.json              # Config despliegue Vercel
└── README.md
```

## 🔐 Sistema de Autenticación y Autorización

### Flujo de Autenticación

1. **Registro/Login**: Usuario ingresa credenciales en `LoginPage.jsx`
2. **Validación Supabase Auth**: JWT generado por Supabase
3. **Creación de Usuario**: Registro en tabla `usuarios` vinculado a `auth.users`
4. **Asignación de Rol**: Se asigna rol (`Admin`, `Jefe de Obra`, `Operario`)
5. **RLS Automático**: Base de datos valida permisos por empresa

### Roles y Permisos

#### 🔴 Admin
- Acceso total a todas las funciones
- Gestión de empresas y usuarios
- Configuración del sistema

#### 🟠 Jefe de Obra
- Lectura/Escritura de presupuestos
- Gestión de materiales
- Gestión de personal
- Lectura de horas imputadas
- Gestión de documentación
- Lectura de planos

#### 🟡 Operario
- Imputación de horas (escritura)
- Lectura de catálogo
- Acceso a calculadoras
- Consulta de planos

### Hook useAuth.js

```javascript
const { 
  user,              // Usuario de auth.users
  usuario,           // Registro en tabla usuarios
  isAuthenticated,   // Boolean
  loading,           // Estado de carga inicial
  error,             // Error si existe
  signUp,            // Función registro
  signIn,            // Función login
  signOut,           // Función logout
  hasPermission      // Verificar permiso específico
} = useAuth()
```

## 📊 Modelo de Datos

### Tablas Principales

#### 1. **empresas**
```sql
- id (UUID PK)
- nombre (TEXT, UNIQUE)
- cif (TEXT, UNIQUE)
- email, telefono, direccion
- created_at, updated_at
```

#### 2. **usuarios**
```sql
- id (UUID PK)
- auth_id (UUID FK → auth.users)
- empresa_id (UUID FK)
- nombre, email, telefono
- rol_id (UUID FK → roles)
- activo (BOOLEAN)
```

#### 3. **roles**
```sql
- id (UUID PK)
- nombre (TEXT, UNIQUE)
- permisos (JSONB) - Array de permisos
Roles por defecto:
  - Admin: ["*"]
  - Jefe de Obra: ["presupuestos:*", "materiales:read", ...]
  - Operario: ["horas:write", "planos:read"]
```

#### 4. **materiales**
```sql
- id (UUID PK)
- empresa_id (UUID FK)
- codigo (TEXT) - Único por empresa
- nombre (TEXT)
- categoria (TEXT) - Gas/Calefacción/PCI/Fontanería/Albañilería
- unidad_medida (TEXT) - ud/ml/m/m2/m3/kg/l
- precio_coste (DECIMAL)
- precio_venta (DECIMAL)
- margen_comercial (DECIMAL) - Calculado
- referencia_cype (TEXT) - Para integración CYPE
- stock_actual (INTEGER)
```

#### 5. **perfiles_profesionales**
```sql
- id (UUID PK)
- empresa_id (UUID FK)
- nombre (TEXT) - Ej: "Oficial Fontanería"
- tipo_perfil (TEXT) - Oficial/Peón/Especialista/Encargado
- coste_horario_empresa (DECIMAL)
- coste_horario_social (DECIMAL)
```

#### 6. **personal**
```sql
- id (UUID PK)
- empresa_id (UUID FK)
- usuario_id (UUID FK) - Vinculo a usuario del sistema (opcional)
- nombre_completo (TEXT)
- dni (TEXT, UNIQUE por empresa)
- perfil_profesional_id (UUID FK)
- fecha_alta, fecha_baja (DATE)
- activo (BOOLEAN)
```

#### 7. **obras**
```sql
- id (UUID PK)
- empresa_id (UUID FK)
- numero_expediente (TEXT) - Único por empresa
- nombre (TEXT)
- tipo_obra (TEXT) - Red Gas/Caldera/PCI/Fontanería/Albañilería/Mixta
- direccion, ciudad, cp, provincia
- cliente_nombre, cliente_contacto, cliente_telefono
- jefe_obra_id (UUID FK → personal)
- fecha_inicio, fecha_prevista_fin, fecha_fin_real (DATE)
- presupuesto_total, gasto_actual (DECIMAL)
- estado (TEXT) - Planificación/En ejecución/Parada/Finalizada/Archivada
```

#### 8. **partidas_presupuesto**
```sql
- id (UUID PK)
- obra_id (UUID FK)
- numero_partida (TEXT) - Único por obra
- descripcion (TEXT)
- unidad_medida (TEXT)
- cantidad (DECIMAL)
- precio_unitario (DECIMAL)
- precio_total (DECIMAL) - GENERATED
- tipo_partida (TEXT) - Material/Mano de Obra/Subcontrata/Mixto
```

#### 9. **partida_materiales**
```sql
- id (UUID PK)
- partida_id (UUID FK → partidas_presupuesto)
- material_id (UUID FK → materiales)
- cantidad (DECIMAL)
- precio_unitario (DECIMAL)
- precio_total (DECIMAL) - GENERATED
```

#### 10. **imputacion_horas**
```sql
- id (UUID PK)
- obra_id (UUID FK)
- partida_id (UUID FK) - Opcional
- personal_id (UUID FK)
- fecha_imputacion (DATE)
- horas_trabajadas (DECIMAL)
- descripcion_tarea (TEXT)
- estado (TEXT) - Borrador/Registrada/Validada/Facturada
- coste_total (DECIMAL) - GENERATED
```

#### 11. **documentacion**
```sql
- id (UUID PK)
- obra_id (UUID FK)
- tipo_documento (TEXT) - Plano/Certificado/Boletín/Inspección/...
- nombre (TEXT)
- archivo_url (TEXT) - URL en Supabase Storage
- estado (TEXT) - Pendiente/En trámite/Obtenido/Rechazado/Archivado
- usuario_responsable_id (UUID FK)
- fecha_limite (DATE)
```

## 🔒 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas garantizan que:

1. Los usuarios solo ven datos de su empresa
2. Solo acceden a obras asignadas
3. Solo modifican registros con los permisos asignados

**Estructura de política típica**:
```sql
CREATE POLICY "table_read" ON table_name FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );
```

## 🚀 Instalación y Configuración

### 1. Clonar y preparar entorno

```bash
git clone <repo>
cd gestiobra
npm install
```

### 2. Crear proyecto Supabase

1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Copiar credenciales (Project URL y Anon Key)

### 3. Configurar .env

```bash
cp .env.example .env
```

Editar `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Ejecutar SQL de schema

1. En Supabase, ir a SQL Editor
2. Crear nueva query
3. Copiar y pegar contenido de `SCHEMA_DB.sql`
4. Ejecutar

### 5. Verificar en Dashboard

1. En Supabase → Authentication → Enable email auth
2. En Database → Cambiar editor a ON para RLS
3. En Storage → Crear bucket "documentos"

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

## 📱 Características por Rol

### 👤 Operario (Mobile-first)

**Vista optimizada para móvil con:**
- Botones grandes (≥48px)
- Alto contraste
- Formularios rápidos (≤3 campos)
- Validación en tiempo real

**Funciones:**
1. **Imputación de Horas** (`ImputacionHoras.jsx`)
   - Seleccionar obra
   - Elegir tarea
   - Registrar horas + descripción
   - Envío instantáneo

2. **Consulta Catálogo**
   - Búsqueda de materiales
   - Ficha técnica
   - Comparativa de precios

3. **Calculadoras**
   - Conversión de unidades
   - Cálculos técnicos

### 👷 Jefe de Obra

**Panel Desktop con:**
- Dashboard KPI en tiempo real
- Gráficos de desviación presupuestaria
- Tablas edibles

**Funciones:**
1. **Dashboard Avanzado** (`DashboardAdvanced.jsx`)
   - KPIs de obras activas
   - Resumen financiero
   - Últimas obras

2. **Gestión de Obras** (`GestorObras.jsx`)
   - CRUD completo
   - Filtrado por estado
   - Vista de detalles con financiero

3. **Catálogo de Materiales** (`GestorMateriales.jsx`)
   - ABM materiales
   - Categorización
   - Gestión de precios
   - Análisis de márgenes

4. **Personal** (`GestorPersonal.jsx`)
   - Perfiles profesionales
   - ABM operarios
   - Costes horarios

5. **Presupuestos**
   - Creación de partidas
   - Vinculación de materiales
   - Proyección de costes

6. **Imputación de Horas**
   - Validación de horas registradas
   - Reportes

### 🔐 Admin

- Gestión de empresas
- Gestión de usuarios y roles
- Configuración del sistema

## 🔄 Flujos de Trabajo

### Crear una Nueva Obra

```
1. Jefe de Obra → GestorObras → "+ Nueva Obra"
2. Rellena: Expediente, Nombre, Tipo, Dirección, Cliente, Presupuesto
3. Sistema crea registro en `obras`
4. Automáticamente vinculado a empresa_id del usuario
5. RLS protege el acceso
```

### Imputar Horas (Operario en Campo)

```
1. Operario → ImputacionHoras
2. Selecciona obra (obras en ejecución)
3. Elige personal (dropdown de operarios activos)
4. Ingresa: Fecha, Horas, Descripción de tarea
5. Sistema calcula coste_total automáticamente
6. Envía a `imputacion_horas`
7. Jefe de Obra ve actualizado gasto_actual de la obra
```

### Crear Presupuesto

```
1. Jefe de Obra → Presupuestos
2. Crea partida: Número, Descripción, Cantidad, PU
3. Agrega materiales desde catálogo
4. Sistema suma partidas = presupuesto_total
5. Valida contra presupuesto de obra
6. Advierte si hay desviación > 10%
```

## 📊 Queries SQL Importantes

### Total gasto de una obra

```sql
SELECT 
  o.id,
  o.nombre,
  COALESCE(SUM(ih.coste_total), 0) as gasto_horas,
  COALESCE(SUM(pp.precio_total), 0) as gasto_materiales,
  COALESCE(SUM(ih.coste_total), 0) + COALESCE(SUM(pp.precio_total), 0) as gasto_total
FROM obras o
LEFT JOIN imputacion_horas ih ON o.id = ih.obra_id
LEFT JOIN partidas_presupuesto pp ON o.id = pp.obra_id
GROUP BY o.id, o.nombre
```

### Horas por operario en período

```sql
SELECT 
  p.nombre_completo,
  prof.nombre as perfil,
  DATE_TRUNC('month', ih.fecha_imputacion) as mes,
  SUM(ih.horas_trabajadas) as total_horas,
  SUM(ih.coste_total) as coste_total
FROM imputacion_horas ih
JOIN personal p ON ih.personal_id = p.id
JOIN perfiles_profesionales prof ON p.perfil_profesional_id = prof.id
WHERE ih.obra_id = ?
GROUP BY p.id, p.nombre_completo, prof.id, mes
ORDER BY mes DESC, total_horas DESC
```

### Margen de materiales

```sql
SELECT 
  categoria,
  AVG(margen_comercial) as margen_medio,
  MIN(margen_comercial) as margen_minimo,
  MAX(margen_comercial) as margen_maximo,
  COUNT(*) as cantidad_materiales
FROM materiales
WHERE empresa_id = ?
GROUP BY categoria
ORDER BY margen_medio DESC
```

## 🎨 Estilos y Diseño

### Tailwind Configuration

Archivo: `tailwind.config.js`

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

### Paleta de Colores

- **Primario**: Blue-600 (`#0284c7`)
- **Éxito**: Green-600 (`#16a34a`)
- **Error**: Red-600 (`#dc2626`)
- **Advertencia**: Yellow-600 (`#ca8a04`)
- **Neutral**: Gray-600 (`#4b5563`)

### Breakpoints

- Mobile: `sm` (640px)
- Tablet: `md` (768px)
- Desktop: `lg` (1024px)

### Mobile-First Approach

Todos los componentes comienzan en mobile y escalan hacia desktop:

```jsx
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Título</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {/* Cards */}
  </div>
</div>
```

## 🚢 Despliegue (Vercel)

### 1. Conectar repositorio

```bash
vercel link
```

### 2. Configurar variables de entorno

En Vercel Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Desplegar

```bash
npm run build
vercel deploy --prod
```

O automático en cada push a `main`

## 🐛 Debugging

### Verificar autenticación

```javascript
const { user } = supabase.auth.getSession()
console.log('Usuario:', user)
```

### Ver RLS en acción

En Supabase Editor SQL:
```sql
-- Simular usuario
SET request.jwt.claim.sub = 'uuid-del-usuario';
SELECT * FROM obras;  -- Solo verá obras de su empresa
```

### Logs de Supabase

Supabase Dashboard → Logs → Recent Logs

## 📚 Recursos

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

## 📞 Soporte

Para problemas de configuración o arquitectura, consultar:
- Logs de Supabase
- Console del navegador (F12)
- React DevTools (extensión de navegador)

---

**Versión**: 1.0  
**Última actualización**: 2024  
**Mantenedor**: Equipo GestiObra
