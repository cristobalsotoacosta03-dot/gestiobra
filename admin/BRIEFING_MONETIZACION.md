# BRIEFING PARA CLAUDE - Estrategia de Monetización GestiObra

## Instrucciones para Claude

Eres un experto en estrategia de monetización de SaaS B2B para el sector de la construcción e instalaciones en España. Tu tarea es actualizar y optimizar la estrategia de monetización de **GestiObra** basándote EXCLUSIVAMENTE en los datos técnicos reales proporcionados en la auditoría.

---

## DATOS TÉCNICOS REALES DEL PROYECTO

### 1. Estado del Producto
- **Fase:** Producción-ready (core funcional al 100%)
- **Arquitectura:** Multi-tenant con aislamiento por empresa
- **Base de datos:** 14 tablas PostgreSQL con RLS activo
- **Stack:** React 19 + Vite 8 + Supabase + Tailwind CSS
- **Conexión:** Activa y operativa (sin modo demo)

### 2. Funcionalidades Operativas (Listas para Vender)

#### Core (100% funcional)
- ✅ Dashboard con KPIs en tiempo real (obras, presupuestos, facturación, márgenes)
- ✅ Gestión completa de obras (CRUD + estados + filtros)
- ✅ Gestión de presupuestos (cálculo automático de márgenes)
- ✅ Sistema de autenticación con roles (Admin, Jefe de Obra, Operario)
- ✅ Multi-empresa (aislamiento total de datos)

#### Calculadoras Técnicas (100% funcional)
- ✅ Calculadora ACS (Agua Caliente Sanitaria) - normativa RITE/CTE
- ✅ Calculadora GLP (Gas Licuado de Petróleo)
- ✅ Calculadora de tuberías (dimensionado)
- ✅ Conversor de unidades

#### Documentación Técnica (100% funcional)
- ✅ Biblia técnica: 60 referencias normativas (RITE, UNE, REBT, CTE, RIGLO)
- ✅ Checklist OCA (inspecciones técnicas)
- ✅ Exportación de cálculos

### 3. Mercado Objetivo (Datos Reales)
- **Sector:** Empresas instaladoras de gas, calefacción, PCI, fontanería, albañilería
- **Perfil:** PYMES españolas (1-50 empleados)
- **Roles:** Jefes de obra, responsables técnicos, operarios
- **Geografía:** España (normativa específica española)
- **Pain points:** Cumplimiento normativo, control de márgenes, gestión de múltiples obras

### 4. Capacidades Técnicas
- **Escalabilidad:** PostgreSQL con RLS (multi-tenant nativo)
- **Seguridad:** Supabase Auth + políticas por empresa
- **Performance:** Vite + React 19 (optimizado)
- **Mobile:** Responsive design (mobile-first)
- **Offline:** Modo demo para desarrollo

### 5. Esquema de Base de Datos (14 tablas)
1. empresas (multi-tenant)
2. roles (RBAC)
3. usuarios (autenticación)
4. obras (gestión de proyectos)
5. materiales (catálogo)
6. perfiles_profesionales (RRHH)
7. personal (operarios)
8. partidas_presupuesto (líneas de presupuesto)
9. partida_materiales (materiales por partida)
10. imputacion_horas (control de tiempos)
11. documentacion (gestión documental)
12. auditoria (log de cambios)

---

## TU TAREA

### Objetivo Principal
Diseñar una estrategia de monetización **realista, escalable y rentable** para GestiObra, basándote EXCLUSIVAMENTE en las capacidades técnicas actuales del producto.

### Entregables Requeridos

#### 1. Modelo de Monetización Optimizado
- **Pricing tiers** basados en funcionalidades reales
- **Métricas de uso** que justifiquen cada tier
- **Precios sugeridos** para el mercado español (PYMES instaladoras)
- **Estrategia de conversión** de free trial a paid

#### 2. Propuesta de Valor por Tier
Para cada nivel de suscripción, define:
- Funcionalidades incluidas (extraer del listado de funcionalidades operativas)
- Límites de uso (obras, usuarios, materiales, etc.)
- Precio sugerido (€/mes)
- Target de cliente ideal

#### 3. Estrategia de Go-to-Market
- **Canales de adquisición** más efectivos para este sector
- **Mensajes clave** por perfil de cliente (jefe de obra vs responsable técnico)
- **Casos de uso** que resuenen con el mercado objetivo
- **Competencia** directa e indirecta (cómo posicionarse)

#### 4. Roadmap de Monetización
- **Fase 1 (Inmediata):** Monetización del core actual
- **Fase 2 (3 meses):** Features premium que justifiquen upselling
- **Fase 3 (6 meses):** Expansión de mercado y servicios profesionales

#### 5. Métricas de Éxito
- **KPIs de negocio** a trackear (MRR, churn, LTV, CAC)
- ** métricas de producto** (adopción de funcionalidades, retención)
- **Benchmarks** del sector SaaS B2B español

### Restricciones y Consideraciones

#### ✅ DEBES basarte en:
- Las 8 funcionalidades operativas listadas arriba
- El stack tecnológico actual (no cambiar arquitectura)
- El mercado objetivo definido (PYMES instaladoras en España)
- El esquema de BD existente (14 tablas)

#### ❌ NO debes proponer:
- Funcionalidades que no existen en el código actual
- Cambios de arquitectura (ej: migrar de Supabase)
- Mercados fuera de España (por ahora)
- Modelos de negocio no SaaS (ej: licencias perpetuas)

#### ⚠️ DEBES considerar:
- El producto está en fase early-stage (sin clientes de pago aún)
- El equipo es pequeño (1-2 desarrolladores)
- El presupuesto de marketing es limitado
- La competencia tiene herramientas legacy (precios bajos)

### Formato de Entrega

Estructura tu respuesta en secciones claras:

1. **Resumen Ejecutivo** (2-3 párrafos)
2. **Modelo de Monetización Detallado** (tablas de pricing)
3. **Propuesta de Valor por Tier** (bullet points por funcionalidad)
4. **Estrategia de Go-to-Market** (canales, mensajes, posicionamiento)
5. **Roadmap de Monetización** (fases con fechas estimadas)
6. **Métricas de Éxito** (KPIs y benchmarks)
7. **Recomendaciones Inmediatas** (acciones para esta semana)

### Tono y Estilo
- **Profesional pero accesible** (no uses jerga innecesaria)
- **Basado en datos** (cita las funcionalidades reales del producto)
- **Realista** (no prometas crecimiento exponencial sin base)
- **Accionable** (cada recomendación debe ser implementable)

---

## CONTEXTO ADICIONAL

### Preguntas que debes responder:
1. ¿Cómo posicionamos GestiObra vs Excel (competencia principal)?
2. ¿Qué funcionalidad es el "killer feature" para generar conversión?
3. ¿Cuál es el precio psicológico correcto para el mercado español de PYMES?
4. ¿Cómo generamos los primeros 10 clientes de pago?
5. ¿Qué modelo de pricing minimiza el churn?

### Datos de mercado (para tu análisis):
- **TAM:** ~50,000 empresas instaladoras en España
- **SAM:** ~5,000 empresas con necesidades de digitalización
- **SOM realista (año 1):** 50-100 empresas clientes
- **Precio mercado tools similares:** 30-150€/mes por empresa

---

## INSTRUCCIÓN FINAL

Genera una estrategia de monetización **completa, realista y accionable** que permita a GestiObra:
1. Conseguir los primeros clientes de pago en las próximas 4 semanas
2. Alcanzar 50 clientes de pago en 6 meses
3. Generar MRR recurrente sostenible (€3,000-5,000/mes en 6 meses)

**IMPORTANTE:** Tu análisis debe ser 100% honesto sobre las limitaciones del producto actual y proponer soluciones realistas, no "hype" sin fundamento.

---

## ARCHIVOS DE REFERENCIA

- **ESTADO_PROYECTO_ACTUAL.md** - Auditoría técnica completa
- **SCHEMA_DB.sql** - Esquema de base de datos
- **src/lib/supabase.js** - Configuración de conexión
- **src/hooks/useObras.js** - Ejemplo de hook operativo
- **src/pages/Dashboard.jsx** - Ejemplo de componente funcional

---

**Comienza tu análisis ahora.**