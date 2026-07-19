# 📖 ÍNDICE DE DOCUMENTACIÓN — GestiObra v1.0

Guía para encontrar la documentación que necesitas.

---

## 🚀 **EMPEZAR AQUÍ** (Si es la primera vez)

### 1. **[QUICK_START.md](./QUICK_START.md)** ⏱️ 15 minutos
- Setup local
- Crear proyecto Supabase
- Ejecutar schema
- Primer login
- **Recomendado**: ⭐⭐⭐⭐⭐ (Comienza aquí)

### 2. **[RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)** 5 minutos
- Qué es GestiObra
- Objetivos cumplidos
- Arquitectura general
- Casos de uso
- **Perfil**: Gerentes, PMs

---

## 📚 DOCUMENTACIÓN TÉCNICA

### **[ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md)** 📋 Técnico Detallado
**Secciones**:
- Stack tecnológico
- Estructura de carpetas
- Sistema de autenticación
- Modelo de datos (12 tablas)
- RLS políticas
- Flujos de trabajo
- Queries SQL importantes
- Estilos Tailwind
- Despliegue

**Para**: Developers, Arquitectos

---

### **[SUPABASE_SETUP_CHECKLIST.md](./SUPABASE_SETUP_CHECKLIST.md)** ✅ Paso a Paso
**Contenido**:
- Crear proyecto Supabase (11 pasos)
- Obtener credenciales
- Ejecutar schema
- Habilitar auth
- Configurar RLS
- Crear usuario de prueba
- Troubleshooting

**Para**: DevOps, Sysadmins

---

### **[ESTADO_IMPLEMENTACION.md](./ESTADO_IMPLEMENTACION.md)** 📊 Qué Está Hecho
**Secciones**:
- Fase 1-4 completadas ✅
- Características por rol
- Estadísticas del proyecto
- Roadmap 2025
- Próximas fases

**Para**: PMs, Stakeholders

---

### **[README_COMPLETO.md](./README_COMPLETO.md)** 📖 README Integral
**Contenido**:
- Descripción general
- Stack tecnológico
- Instalación
- Usuarios por defecto
- Módulos implementados
- Comandos útiles
- Despliegue
- Troubleshooting

**Para**: Todos

---

## 🗄️ CÓDIGO Y CONFIGURACIÓN

### **[SCHEMA_DB.sql](./SCHEMA_DB.sql)** 🗄️ Schema PostgreSQL
**Incluye**:
- 12 tablas relacionadas
- Índices para optimización
- 10+ políticas RLS
- Roles por defecto
- Datos iniciales (opcionales)

**Usar**: Copiar-pegar en Supabase SQL Editor

---

### **[.env.example](./.env.example)** 🔐 Variables de Entorno
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Copiar a**: `.env` (NO commitear)

---

## 🗂️ ESTRUCTURA DE CÓDIGO

```
src/
├── components/                    # Componentes React
│   ├── LoginPage.jsx             # 🔐 Autenticación
│   ├── GestorObras.jsx           # 🏗️ Gestión de obras
│   ├── GestorMateriales.jsx      # 🧱 Catálogo técnico
│   ├── GestorPersonal.jsx        # 👥 Personal + Perfiles
│   └── ImputacionHoras.jsx       # ⏱️ Registro de horas
│
├── hooks/                         # Lógica reutilizable
│   ├── useAuth.js                # Autenticación + sesión
│   ├── useCalculos.js
│   ├── useObras.js
│   ├── usePartidas.js
│   └── usePresupuestos.js
│
├── pages/                         # Páginas principales
│   ├── DashboardAdvanced.jsx     # 📊 Panel KPI
│   ├── Presupuestos.jsx
│   ├── Catalogo.jsx
│   ├── Calculadoras.jsx
│   └── ...
│
├── lib/
│   ├── supabase.js               # Cliente Supabase
│   └── constants.js
│
├── data/                          # Datos estáticos
│   ├── catalogo-tecnico.js
│   └── mocks.js
│
├── App.jsx                        # Router principal
├── main.jsx                       # Entry point
└── index.css                      # Estilos globales + Tailwind
```

---

## 🎯 GUÍAS POR TAREA

### ✅ "Quiero instalar GestiObra"
→ [QUICK_START.md](./QUICK_START.md)

### ✅ "Necesito entender la arquitectura"
→ [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md)

### ✅ "Quiero saber qué está hecho"
→ [ESTADO_IMPLEMENTACION.md](./ESTADO_IMPLEMENTACION.md)

### ✅ "Necesito configurar Supabase"
→ [SUPABASE_SETUP_CHECKLIST.md](./SUPABASE_SETUP_CHECKLIST.md)

### ✅ "Quiero resumen ejecutivo"
→ [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)

### ✅ "Necesito referencia rápida"
→ [README_COMPLETO.md](./README_COMPLETO.md)

### ✅ "Voy a ejecutar el SQL"
→ [SCHEMA_DB.sql](./SCHEMA_DB.sql)

---

## 🔍 BÚSQUEDA DE TEMAS

| Tema | Archivo | Sección |
|------|---------|---------|
| **Autenticación** | ARQUITECTURA | Sistema de Autenticación |
| **Roles/Permisos** | ARQUITECTURA | Roles y Permisos |
| **RLS** | ARQUITECTURA | Row Level Security (RLS) |
| **Tablas DB** | ARQUITECTURA | Modelo de Datos |
| **Setup Supabase** | SUPABASE_CHECKLIST | Todos los pasos |
| **Componentes React** | ARQUITECTURA | UI/UX Componentes |
| **Tailwind** | ARQUITECTURA | Estilos y Diseño |
| **Despliegue** | ARQUITECTURA / README | Despliegue (Vercel) |
| **Troubleshooting** | README | Troubleshooting |
| **Commandos** | README | Comandos Útiles |
| **KPIs Proyecto** | ESTADO | Estadísticas |
| **Roadmap** | ESTADO | Próximas Fases |
| **Queries SQL** | ARQUITECTURA | Queries SQL Importantes |
| **Flujos de Trabajo** | ARQUITECTURA | Flujos de Trabajo Típicos |

---

## 📱 POR ROLE

### 👨‍💼 Gerente / PM
**Lee**:
1. [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)
2. [ESTADO_IMPLEMENTACION.md](./ESTADO_IMPLEMENTACION.md)

### 👨‍💻 Developer Frontend
**Lee**:
1. [QUICK_START.md](./QUICK_START.md)
2. [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) → Secciones: React + Tailwind
3. Explore: `src/components/`

### 👨‍💻 Developer Backend
**Lee**:
1. [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) → Secciones: Modelo de Datos + RLS
2. [SCHEMA_DB.sql](./SCHEMA_DB.sql)
3. [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) → Queries SQL

### 🔧 DevOps / Sysadmin
**Lee**:
1. [SUPABASE_SETUP_CHECKLIST.md](./SUPABASE_SETUP_CHECKLIST.md)
2. [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) → Secciones: Despliegue

### 🆘 Soporte Técnico
**Lee**:
1. [QUICK_START.md](./QUICK_START.md)
2. [README_COMPLETO.md](./README_COMPLETO.md) → Troubleshooting

---

## 🎓 LECTURAS RECOMENDADAS POR ORDEN

### Primer Día
1. QUICK_START.md (setup)
2. RESUMEN_EJECUTIVO.md (contexto)
3. Explorar app: Dashboard → Obras → Materiales → Horas

### Primera Semana
1. ARQUITECTURA_COMPLETA.md (comprensión)
2. ESTADO_IMPLEMENTACION.md (qué está hecho)
3. SCHEMA_DB.sql (entender datos)
4. Leer código React: src/components/

### Próximas Semanas
1. README_COMPLETO.md (referencia)
2. Roadmap (próximas features)
3. Explorar queries SQL
4. Planificar integraciones

---

## 🔗 ENLACES EXTERNOS

### Documentación de Librerías
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Herramientas
- [Supabase Dashboard](https://app.supabase.com)
- [VS Code](https://code.visualstudio.com)
- [GitHub](https://github.com)
- [Vercel](https://vercel.com)

---

## ✨ CHEAT SHEETS

### Comandos Rápidos
```bash
npm run dev        # Desarrollo
npm run build      # Compilar
npm run lint       # Linter
npm run preview    # Preview build
```

### Estructura URLs
```
http://localhost:5173/           # App principal
http://localhost:5173/dashboard  # Dashboard
http://localhost:5173/obras      # Gestión de obras
```

### Usuarios de Prueba
```
admin@test.com / TestPassword123!      # Admin
jefe@test.com / TestPassword123!       # Jefe de Obra
operario@test.com / TestPassword123!   # Operario
```

### Keys Supabase
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🆘 ¿NECESITAS AYUDA?

### Problema: "No sé por dónde empezar"
**Solución**: [QUICK_START.md](./QUICK_START.md) (15 minutos)

### Problema: "Quiero entender el sistema"
**Solución**: [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md)

### Problema: "¿Qué está implementado?"
**Solución**: [ESTADO_IMPLEMENTACION.md](./ESTADO_IMPLEMENTACION.md)

### Problema: "Tengo error en setup"
**Solución**: [SUPABASE_SETUP_CHECKLIST.md](./SUPABASE_SETUP_CHECKLIST.md) → Troubleshooting

### Problema: "¿Cómo despliego?"
**Solución**: [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) → Despliegue

### Problema: "¿Cuáles son los comandos?"
**Solución**: [README_COMPLETO.md](./README_COMPLETO.md) → Comandos Útiles

---

## 📊 ESTADÍSTICAS DE DOCUMENTACIÓN

| Archivo | Líneas | Secciones | Tiempo Lectura |
|---------|--------|-----------|----------------|
| QUICK_START.md | 200 | 6 | 5 min |
| RESUMEN_EJECUTIVO.md | 450 | 15 | 10 min |
| ARQUITECTURA_COMPLETA.md | 800 | 20 | 30 min |
| SUPABASE_SETUP_CHECKLIST.md | 350 | 12 | 15 min |
| README_COMPLETO.md | 600 | 18 | 20 min |
| ESTADO_IMPLEMENTACION.md | 500 | 16 | 15 min |
| **TOTAL** | **2900** | **77** | **95 min** |

---

## ✅ CHECKLIST DE LECTURA

Marca qué has leído:

- [ ] QUICK_START.md
- [ ] RESUMEN_EJECUTIVO.md
- [ ] ARQUITECTURA_COMPLETA.md
- [ ] SUPABASE_SETUP_CHECKLIST.md
- [ ] README_COMPLETO.md
- [ ] ESTADO_IMPLEMENTACION.md
- [ ] SCHEMA_DB.sql
- [ ] src/ (código)

---

## 📝 NOTAS FINALES

### Archivos Importantes
- ✅ `.env` — NO commitear, solo variables de entorno
- ✅ `SCHEMA_DB.sql` — Ejecutar una sola vez en Supabase
- ✅ `package.json` — No modificar sin razón
- ✅ `src/` — El corazón de la app

### No Tocar
- ❌ `node_modules/` — Auto-generado
- ❌ `dist/` — Build output
- ❌ `.git/` — Control de versiones
- ❌ `.vercel/` — Deployment config

### Personalizar
- ✅ `tailwind.config.js` — Colores, fuentes
- ✅ `vite.config.js` — Build config
- ✅ `src/App.jsx` — Router principal

---

**Última actualización**: Enero 2025  
**Versión de Documentación**: 1.0  
**Status**: ✅ Completa

---

**¿Listo para empezar?** → [QUICK_START.md](./QUICK_START.md)
