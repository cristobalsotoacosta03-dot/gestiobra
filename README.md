# 📋 GestiObra — README Completo

**Plataforma integral de gestión para el control técnico, logístico y económico de instalaciones**

![Estado](https://img.shields.io/badge/estado-producción-green) ![Version](https://img.shields.io/badge/version-1.0.0-blue) ![React](https://img.shields.io/badge/React-19-blue) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

## 🎯 Descripción del Proyecto

**GestiObra** es una solución completa de software-as-a-service diseñada para empresas de instalaciones técnicas. Permite:

✅ **Gestión de proyectos** con control presupuestario en tiempo real  
✅ **Imputación de horas** desde campo mediante app mobile-friendly  
✅ **Catálogo de materiales** con gestión de precios y márgenes comerciales  
✅ **Control de personal** con perfiles profesionales y costes horarios  
✅ **Dashboard analítico** para jefes de obra con KPIs y desviaciones  
✅ **Roles y permisos** diferenciados (Admin, Jefe de Obra, Operario)  
✅ **Seguridad empresarial** mediante Row Level Security (RLS)  
✅ **Sistema de pagos** con suscripciones Stripe (Basic €49, Pro €99, Enterprise €249)

---

## 🏗️ Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Frontend** | React + Vite | 19 + 8 |
| **UI/CSS** | Tailwind CSS | 4 |
| **Backend** | Supabase (PostgreSQL) | Latest |
| **Pagos** | Stripe | Latest |
| **Autenticación** | Supabase Auth (JWT) | - |
| **Realtime** | Supabase Realtime | - |
| **Storage** | Supabase Storage | - |
| **Despliegue** | Vercel | - |

---

## 📁 Estructura del Proyecto

```
gestiobra/
├── src/
│   ├── components/               # Componentes React
│   │   ├── LoginPage.jsx         # Autenticación
│   │   ├── GestorObras.jsx       # CRUD de proyectos
│   │   ├── GestorMateriales.jsx  # Catálogo técnico
│   │   ├── GestorPersonal.jsx    # Personal + Perfiles
│   │   ├── SubscriptionGate.jsx  # Protección de funcionalidades premium
│   │   └── ImputacionHoras.jsx   # Registro de horas (mobile)
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.js            # Autenticación y sesión
│   │   ├── useSubscription.js    # Gestión de suscripciones Stripe
│   │   └── ...
│   ├── pages/                    # Páginas principales
│   │   ├── Dashboard.jsx         # Panel de control
│   │   ├── Obras.jsx             # Gestión de obras
│   │   ├── Presupuestos.jsx      # Gestión de presupuestos
│   │   ├── Materiales.jsx        # Catálogo de materiales
│   │   ├── Catalogo.jsx          # Consulta catálogo
│   │   ├── Calculadoras.jsx      # Centro de calculadoras
│   │   ├── Pricing.jsx           # Planes y precios
│   │   └── Billing.jsx           # Facturación y suscripción
│   ├── lib/
│   │   ├── supabase.js           # Cliente Supabase
│   │   └── stripe.js             # Cliente Stripe
│   └── App.jsx                   # Router principal
├── api/
│   └── stripe/                   # API Routes de Stripe
│       ├── checkout.js           # Crear checkout sessions
│       ├── webhook.js            # Webhook de Stripe
│       └── portal.js             # Customer portal
├── docs/                         # Documentación técnica
│   ├── SCHEMA_DB.sql            # Esquema PostgreSQL completo
│   ├── STRIPE_TABLES.sql        # Tablas para Stripe
│   ├── ARQUITECTURA_COMPLETA.md # Documentación técnica
│   ├── SUPABASE_SETUP_CHECKLIST.md # Guía de configuración
│   ├── DEPLOY.md                # Guía de despliegue
│   └── ...
├── admin/                        # Documentación estratégica
│   ├── PLAN_ACCION.md           # Plan de acción
│   ├── BRIEFING_MONETIZACION.md # Estrategia de monetización
│   └── ...
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example                  # Variables de entorno
```

---

## 🚀 Instalación Rápida

### 1. Clonar y preparar

```bash
git clone <repositorio>
cd gestiobra
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en https://supabase.com
2. Copiar credenciales (Project URL + Anon Key)
3. Crear archivo `.env` basado en `.env.example`:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (modo test)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
VITE_APP_URL=http://localhost:5175
VITE_APP_NAME=GestiObra
```

4. Ejecutar SQL schema en Supabase:
   - Ir a SQL Editor
   - Ejecutar `docs/SCHEMA_DB.sql` (tablas core)
   - Ejecutar `docs/STRIPE_TABLES.sql` (tablas de pagos)

📖 **Guía completa**: Ver [docs/SUPABASE_SETUP_CHECKLIST.md](./docs/SUPABASE_SETUP_CHECKLIST.md)

### 3. Configurar Stripe (Test Mode)

1. Crear cuenta en https://dashboard.stripe.com/register
2. Activar modo test
3. Crear productos y precios:
   - Basic: €49/mes
   - Pro: €99/mes
   - Enterprise: €249/mes
4. Configurar webhook: `http://localhost:5175/api/stripe/webhook`
5. Actualizar price IDs en `src/pages/Pricing.jsx`

📖 **Guía completa**: Ver [docs/PAGOS.md](./docs/PAGOS.md)

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:5175

### 5. Build para producción

```bash
npm run build
npm run preview
```

---

## 👤 Usuarios por Defecto

| Rol | Email | Contraseña | Acceso |
|-----|-------|-----------|--------|
| Admin | admin@test.com | TestPassword123! | Todo |
| Jefe de Obra | jefe@test.com | TestPassword123! | Presupuestos, Personal, Horas |
| Operario | operario@test.com | TestPassword123! | Solo imputar horas |

*Crear en Supabase → Authentication → Users*

---

## 🔐 Sistema de Roles y Permisos

### 🔴 Admin
- Gestión de empresas
- Gestión de usuarios
- Configuración del sistema
- Acceso total

### 🟠 Jefe de Obra
- Dashboard con KPIs
- Crear/editar obras
- Gestionar presupuestos
- Gestionar personal
- Ver horas imputadas
- Gestionar documentación

### 🟡 Operario
- Imputar horas (móvil)
- Consultar catálogo
- Usar calculadoras
- Ver planos

---

## 💳 Sistema de Pagos

### Planes Disponibles

| Plan | Precio | Usuarios | Obras | Características |
|------|--------|----------|-------|-----------------|
| **Basic** | €49/mes | 3 | 5 | Calculadoras básicas, Biblia técnica |
| **Pro** | €99/mes | 10 | 20 | Todas las calculadoras, Gestión de materiales, Exportación |
| **Enterprise** | €249/mes | Ilimitado | Ilimitado | API access, Soporte 24/7, Formación personalizada |

### Características
- ✅ Checkout seguro con Stripe
- ✅ Customer portal para autogestión
- ✅ Webhooks para sincronización automática
- ✅ Cancelación en cualquier momento
- ✅ Facturación automática mensual

📖 **Guía completa**: Ver [docs/PAGOS.md](./docs/PAGOS.md)

---

## 📊 Módulos Implementados

### 1. **Dashboard** (`Dashboard.jsx`)
- KPIs en tiempo real
- Resumen financiero de obras
- Actividad reciente
- Acceso rápido a herramientas

### 2. **Gestor de Obras** (`Obras.jsx`)
- CRUD completo de proyectos
- Filtros por estado
- Seguimiento financiero
- Barra de progreso de gasto

### 3. **Gestión de Presupuestos** (`Presupuestos.jsx`)
- Creación de partidas
- Cálculo automático de márgenes
- Estados: borrador, enviado, aceptado, rechazado
- KPIs: pendientes, aceptados, facturado

### 4. **Catálogo de Materiales** (`Materiales.jsx`)
- 6 categorías (Gas, Calefacción, PCI, Fontanería, Albañilería, Diversos)
- Control de precios coste/venta
- Cálculo de márgenes
- Búsqueda y filtrado

### 5. **Calculadoras Técnicas** (`Calculadoras.jsx`)
- CalcACS (Agua Caliente Sanitaria)
- CalcGLP (Gas Licuado)
- CalcTuberías (Dimensionado)
- Conversor de unidades

### 6. **Biblia Técnica** (`Catalogo.jsx`)
- 60 referencias normativas
- Categorías: RITE, UNE, REBT, CTE, RIGLO
- Búsqueda y filtrado

### 7. **Sistema de Pagos** (`Pricing.jsx`, `Billing.jsx`)
- 3 planes de suscripción
- Checkout con Stripe
- Customer portal
- Gestión de facturación

---

## 🗄️ Modelo de Datos

### Tablas Principales

**empresas** → Propietarias de los datos  
**usuarios** → Acceso al sistema con roles  
**roles** → Definición de permisos  
**obras** → Proyectos a ejecutar  
**materiales** → Catálogo técnico  
**perfiles_profesionales** → Tipos de operarios  
**personal** → Operarios de la empresa  
**partidas_presupuesto** → Estructura de costes  
**imputacion_horas** → Registro de trabajo en campo  
**documentacion** → Trámites y certificados  
**customers** → Clientes de Stripe  
**subscriptions** → Suscripciones activas  
**plans** → Planes de precios

### Relaciones Clave

```
empresas (1) ─── (*) usuarios ─── (*) obras
                  │
                  ├─── (*) materiales
                  ├─── (*) personal ─── (*) perfiles_profesionales
                  └─── (*) partidas_presupuesto ─── (*) imputacion_horas
                  │
                  └─── (*) customers ─── (*) subscriptions
```

---

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas de RLS que garantizan:

✅ Usuarios solo ven datos de su empresa  
✅ Datos estrictamente aislados por empresa  
✅ Personal solo accede a sus obras asignadas  
✅ Webhooks verificados con firma de Stripe  
✅ Service role key nunca expuesta al frontend  

### Autenticación

- JWT generado por Supabase Auth
- Contraseñas encriptadas con bcrypt
- Sesiones seguras con refresh tokens
- Logout automático al cerrar sesión

---

## 📱 Diseño Mobile-First

La interfaz está optimizada para dispositivos móviles en campo:

✅ Botones grandes (≥48px)  
✅ Alto contraste  
✅ Formularios minimalos (≤3 campos)  
✅ Validación en tiempo real  
✅ Responsive desde 320px  

**Breakpoints**: 640px (sm) → 768px (md) → 1024px (lg)

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Compilar
npm run build

# Preview de build
npm run preview

# Linter
npm run lint

# Verificar proyecto
npm run verify

# Instalar dependencias
npm install
```

---

## 🚢 Despliegue en Vercel

### 1. Preparar variables de entorno

En Vercel Dashboard → Settings → Environment Variables:

```
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
VITE_APP_URL=https://gestiobra.vercel.app
VITE_APP_NAME=GestiObra
```

### 2. Desplegar

```bash
npm run build
vercel deploy --prod
```

O automático en cada push a `main`

📖 **Guía completa**: Ver [docs/DEPLOY.md](./docs/DEPLOY.md)

---

## 🐛 Troubleshooting

### ❌ "VITE_SUPABASE_URL is not defined"

**Solución**: Verificar que `.env` está en raíz del proyecto

```bash
cat .env
```

### ❌ "Tabla no existe" o "RLS policy violation"

**Solución**: Ejecutar SCHEMA_DB.sql y STRIPE_TABLES.sql en Supabase SQL Editor

### ❌ "No puedo registrarme"

**Solución**: Verificar Email auth habilitado en Supabase → Authentication → Providers → Email → ON

### ❌ "403 Forbidden" al imputar horas

**Solución**: Usuario debe estar vinculado a empresa. Verificar:

```sql
SELECT * FROM usuarios WHERE email = 'usuario@test.com';
```

### ❌ "Stripe webhook falla"

**Solución**: Verificar que STRIPE_WEBHOOK_SECRET es correcto y el webhook está configurado en Stripe Dashboard

---

## 📚 Documentación

### Técnica
- [docs/ARQUITECTURA_COMPLETA.md](./docs/ARQUITECTURA_COMPLETA.md) — Arquitectura técnica detallada
- [docs/SUPABASE_SETUP_CHECKLIST.md](./docs/SUPABASE_SETUP_CHECKLIST.md) — Guía paso a paso de Supabase
- [docs/SCHEMA_DB.sql](./docs/SCHEMA_DB.sql) — Schema completo de base de datos
- [docs/STRIPE_TABLES.sql](./docs/STRIPE_TABLES.sql) — Tablas para sistema de pagos
- [docs/SEGURIDAD_RLS.md](./docs/SEGURIDAD_RLS.md) — Políticas de seguridad
- [docs/DEPLOY.md](./docs/DEPLOY.md) — Guía de despliegue

### Estratégica
- [admin/PLAN_ACCION.md](./admin/PLAN_ACCION.md) — Plan de acción y roadmap
- [admin/BRIEFING_MONETIZACION.md](./admin/BRIEFING_MONETIZACION.md) — Estrategia de monetización
- [admin/RESUMEN_EJECUTIVO.md](./admin/RESUMEN_EJECUTIVO.md) — Resumen ejecutivo

---

## 🌐 Enlaces Útiles

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## 📝 Requisitos del Sistema

- Node.js ≥ 20
- npm o yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (Supabase + Stripe)

---

## 📜 Licencia

Proprietary Software © 2024 GestiObra. All rights reserved.

---

## 👥 Equipo

**Desarrollo**: Full-Stack Senior Developer  
**Arquitectura**: Software Architect  
**PM**: Technical Project Manager  

---

## 📞 Soporte

Para problemas técnicos:
1. Consultar [docs/SUPABASE_SETUP_CHECKLIST.md](./docs/SUPABASE_SETUP_CHECKLIST.md)
2. Ver [docs/DEPLOY.md](./docs/DEPLOY.md) para despliegue
3. Ver [docs/PAGOS.md](./docs/PAGOS.md) para Stripe
4. Ver logs en Supabase Dashboard
5. Abrir consola del navegador (F12)

---

**¡Bienvenido a GestiObra! 🚀**

Última actualización: Julio 2026  
Versión: 1.0.0  
Estado: Production Ready - Stripe Integrado