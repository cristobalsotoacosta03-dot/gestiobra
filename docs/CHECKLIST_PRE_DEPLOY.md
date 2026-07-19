# Checklist de Salida a Producción

## Verificación Completa para GestiObra

---

## 1. Variables de Entorno

### Desarrollo Local (.env)
- [ ] VITE_SUPABASE_URL configurada
- [ ] VITE_SUPABASE_ANON_KEY configurada
- [ ] VITE_APP_URL configurada (http://localhost:5175)
- [ ] VITE_APP_NAME configurada
- [ ] VITE_STRIPE_PUBLISHABLE_KEY configurada (test)
- [ ] RESEND_API_KEY configurada (opcional)
- [ ] VITE_POSTHOG_KEY configurada (opcional)
- [ ] VITE_SENTRY_DSN configurada (opcional)

### Producción (Vercel)
- [ ] VITE_SUPABASE_URL agregada en Vercel
- [ ] VITE_SUPABASE_ANON_KEY agregada en Vercel
- [ ] VITE_APP_URL agregada en Vercel (https://gestiobra.vercel.app)
- [ ] VITE_APP_NAME agregada en Vercel
- [ ] VITE_STRIPE_PUBLISHABLE_KEY agregada en Vercel (live)
- [ ] STRIPE_SECRET_KEY agregada en Vercel (live)
- [ ] STRIPE_WEBHOOK_SECRET agregada en Vercel
- [ ] RESEND_API_KEY agregada en Vercel (opcional)
- [ ] VITE_POSTHOG_KEY agregada en Vercel (opcional)
- [ ] VITE_SENTRY_DSN agregada en Vercel (opcional)

### Verificación
- [ ] Ejecutar `npm run verify` sin errores
- [ ] Verificar que no hay secretos hardcodeados en el código
- [ ] Verificar que .env está en .gitignore
- [ ] Verificar que .env está en .clineignore

---

## 2. Base de Datos (Supabase)

### Tablas Creadas
- [ ] empresas
- [ ] roles
- [ ] usuarios
- [ ] obras
- [ ] materiales
- [ ] perfiles_profesionales
- [ ] personal
- [ ] partidas_presupuesto
- [ ] partida_materiales
- [ ] imputacion_horas
- [ ] documentacion
- [ ] auditoria
- [ ] customers (Stripe)
- [ ] subscriptions (Stripe)
- [ ] plans (Stripe)
- [ ] invitations (Beta)
- [ ] beta_users (Beta)
- [ ] email_logs (Emails)

### Datos Iniciales
- [ ] Roles insertados (Admin, Jefe de Obra, Operario)
- [ ] Planes de Stripe insertados (Basic, Pro, Enterprise)
- [ ] Empresa de prueba creada
- [ ] Usuario admin de prueba creado

### Row Level Security (RLS)
- [ ] RLS activado en todas las tablas
- [ ] Políticas de empresas implementadas
- [ ] Políticas de usuarios implementadas
- [ ] Políticas de obras implementadas
- [ ] Políticas de materiales implementadas
- [ ] Políticas de personal implementadas
- [ ] Políticas de partidas implementadas
- [ ] Políticas de imputación de horas implementadas
- [ ] Políticas de documentación implementadas
- [ ] Políticas de auditoría implementadas

### Índices
- [ ] idx_usuarios_auth_id
- [ ] idx_usuarios_empresa_id
- [ ] idx_obras_empresa_id
- [ ] idx_obras_estado
- [ ] idx_materiales_empresa_id
- [ ] idx_materiales_categoria
- [ ] idx_personal_empresa_id
- [ ] idx_imputacion_obra_id
- [ ] idx_imputacion_fecha
- [ ] idx_documentacion_obra_id
- [ ] idx_documentacion_estado
- [ ] idx_auditoria_tabla
- [ ] idx_auditoria_created_at

### Verificación
- [ ] Probar aislamiento multi-tenant (empresa A no ve datos de empresa B)
- [ ] Probar que usuario sin auth no puede acceder a datos
- [ ] Probar que usuario normal no puede acceder a datos de admin
- [ ] Verificar que no hay errores en logs de Supabase

---

## 3. Build y Deploy

### Build Local
- [ ] `npm run build` completa sin errores
- [ ] `npm run preview` funciona correctamente
- [ ] No hay warnings críticos en consola
- [ ] Tamaño de bundle < 500KB (gzipped)
- [ ] Assets estáticos se cargan correctamente

### Deploy en Vercel
- [ ] Proyecto creado en Vercel
- [ ] Repositorio conectado (si aplica)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Framework preset: Vite
- [ ] Node.js version: 20.x

### Variables en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Variables marcadas para Production, Preview, Development según corresponda
- [ ] No hay variables con valores de desarrollo en producción

### Dominio
- [ ] Dominio default de Vercel funciona (xxx.vercel.app)
- [ ] Dominio custom configurado (si aplica)
- [ ] SSL/HTTPS funcionando
- [ ] Redirección HTTP → HTTPS (si aplica)

### Verificación Post-Deploy
- [ ] App carga correctamente en producción
- [ ] No hay errores en consola del navegador
- [ ] HTTPS funciona correctamente
- [ ] Todas las rutas funcionan (SPA routing)
- [ ] Assets estáticos se cargan (imágenes, CSS, JS)

---

## 4. Autenticación y Seguridad

### Supabase Auth
- [ ] Login con email/password funciona
- [ ] Registro de usuarios funciona
- [ ] Logout funciona
- [ ] Sesión persiste al recargar página
- [ ] Token se refresca automáticamente
- [ ] Redirección a login si no autenticado
- [ ] Redirección a dashboard si ya autenticado

### Roles y Permisos
- [ ] Admin ve todas las empresas
- [ ] Jefe de Obra ve solo su empresa
- [ ] Operario ve solo su empresa
- [ ] Permisos se respetan en todas las páginas
- [ ] Botones/acciones se ocultan según permisos

### Seguridad
- [ ] RLS bloquea acceso no autorizado
- [ ] Service role key NO expuesta en frontend
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados (X-Frame-Options, etc.)
- [ ] No hay datos sensibles en localStorage

---

## 5. Funcionalidades Core

### Dashboard
- [ ] KPIs se muestran correctamente
- [ ] Filtro por obra funciona
- [ ] Actividad reciente se muestra
- [ ] Accesos rápidos funcionan
- [ ] Modo demo NO aparece (conexión real activa)

### Obras
- [ ] Lista de obras se carga
- [ ] Crear obra funciona
- [ ] Editar obra funciona
- [ ] Eliminar obra funciona
- [ ] Filtros por estado funcionan
- [ ] Búsqueda funciona

### Presupuestos
- [ ] Lista de presupuestos se carga
- [ ] Crear presupuesto funciona
- [ ] Cálculo de totales es correcto
- [ ] Estados funcionan (borrador, enviado, aceptado, rechazado)
- [ ] KPIs de presupuestos correctos

### Calculadoras
- [ ] Calculadora ACS funciona
- [ ] Calculadora GLP funciona
- [ ] Calculadora de tuberías funciona
- [ ] Conversor de unidades funciona
- [ ] Resultados son correctos

### Biblia Técnica
- [ ] 60 referencias se muestran
- [ ] Búsqueda funciona
- [ ] Filtrado por categoría funciona
- [ ] Navegación funciona

---

## 6. Pagos (Stripe)

### Configuración
- [ ] Cuenta de Stripe creada (test mode)
- [ ] Claves API configuradas
- [ ] Producto y precios creados en Stripe
- [ ] Webhook configurado en Stripe Dashboard

### Frontend
- [ ] Página /pricing carga correctamente
- [ ] Planes se muestran correctamente
- [ ] Botón "Suscribirse" funciona
- [ ] Redirección a Stripe Checkout funciona
- [ ] Checkout de Stripe carga correctamente

### Backend
- [ ] API route /api/stripe/checkout funciona
- [ ] API route /api/stripe/webhook funciona
- [ ] Webhook verifica firma correctamente
- [ ] Suscripciones se crean en BD
- [ ] Eventos de Stripe se procesan correctamente

### Testing
- [ ] Checkout funciona con tarjeta de prueba (4242 4242 4242 4242)
- [ ] Webhook recibe eventos en desarrollo
- [ ] Suscripción se activa después de pago
- [ ] Customer portal funciona

### Producción (cuando aplique)
- [ ] Claves de producción configuradas
- [ ] Webhook de producción configurado
- [ ] Checkout funciona con tarjeta real
- [ ] Facturación funciona correctamente

---

## 7. Emails (Resend)

### Configuración
- [ ] Cuenta de Resend creada
- [ ] API key configurada
- [ ] Dominio verificado (producción)
- [ ] SPF/DKIM configurados (producción)

### Templates
- [ ] Email de bienvenida funciona
- [ ] Email de confirmación de suscripción funciona
- [ ] Email de pago fallido funciona

### Envío
- [ ] Emails se envían correctamente
- [ ] Emails llegan a bandeja de entrada (no spam)
- [ ] Logs de emails se guardan en BD
- [ ] Webhook de Resend funciona (opcional)

---

## 8. Analítica y Errores

### PostHog (Analítica)
- [ ] Cuenta de PostHog creada
- [ ] API key configurada
- [ ] Eventos se capturan correctamente
- [ ] Dashboard de PostHog muestra datos
- [ ] Eventos principales trackeados:
  - [ ] user_signed_up
  - [ ] user_logged_in
  - [ ] project_created
  - [ ] budget_created
  - [ ] calculator_used
  - [ ] pricing_viewed
  - [ ] checkout_started
  - [ ] subscription_created

### Sentry (Errores)
- [ ] Cuenta de Sentry creada
- [ ] DSN configurada
- [ ] Errores se capturan correctamente
- [ ] Alertas configuradas
- [ ] No hay errores críticos en producción

---

## 9. Beta Cerrada

### Base de Datos
- [ ] Tabla invitations creada
- [ ] Tabla beta_users creada
- [ ] Tabla beta_requests creada (opcional)

### Funcionalidad
- [ ] Página /beta funciona
- [ ] Validación de códigos funciona
- [ ] Canje de invitaciones funciona
- [ ] Panel de administración funciona
- [ ] Emails de invitación se envían

### Gestión
- [ ] 50 códigos de invitación generados
- [ ] Lista de beta testers definida
- [ ] Proceso de aprobación definido
- [ ] Documentación de beta lista

---

## 10. Legal

### Páginas Legales
- [ ] /legal/privacidad creada
- [ ] /legal/aviso creada
- [ ] /legal/terminos creada (opcional)
- [ ] Links en footer funcionan

### Contenido
- [ ] Política de privacidad completa
- [ ] Aviso legal completo
- [ ] Información fiscal incluida
- [ ] Datos de contacto incluidos

### Cumplimiento
- [ ] RGPD compliance verificado
- [ ] Cookie consent implementado (si aplica)
- [ ] Términos de servicio aceptados en registro

---

## 11. Performance

### Métricas
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

### Optimización
- [ ] Imágenes optimizadas
- [ ] Code splitting implementado
- [ ] Lazy loading de componentes
- [ ] Bundle size < 500KB (gzipped)
- [ ] Sin dependencias innecesarias

### Caching
- [ ] Cache headers configurados en Vercel
- [ ] Assets estáticos con cache largo
- [ ] API responses con cache apropiado

---

## 12. Acceso desde Otros Dispositivos

### LAN
- [ ] Script `npm run dev:lan` funciona
- [ ] App accesible desde otros dispositivos en misma red
- [ ] Firewall permite conexiones

### Túnel Temporal
- [ ] Script `npm run tunnel:start` funciona
- [ ] ngrok o cloudflared detectado correctamente
- [ ] URL del túnel se genera correctamente
- [ ] App accesible desde Internet

### Producción
- [ ] App accesible desde dominio de Vercel
- [ ] App accesible desde dominio custom (si aplica)
- [ ] HTTPS funciona correctamente
- [ ] No hay errores de CORS

---

## 13. CI/CD (Opcional)

### GitHub Actions
- [ ] Workflow de deploy creado (.github/workflows/deploy.yml)
- [ ] Build automático en push a main
- [ ] Tests automáticos (si aplica)
- [ ] Deploy automático a Vercel

### Secrets
- [ ] VERCEL_TOKEN configurado
- [ ] VERCEL_ORG_ID configurado
- [ ] VERCEL_PROJECT_ID configurado
- [ ] Otros secrets necesarios configurados

---

## 14. Monitoreo

### Vercel
- [ ] Analytics habilitado
- [ ] Speed Insights habilitado
- [ ] Alertas configuradas (deploy fallidos, errores 5xx)

### Sentry
- [ ] Alertas de errores críticos configuradas
- [ ] Alertas de errores repetitivos configuradas
- [ ] Notificaciones por email/Slack funcionando

### PostHog
- [ ] Alertas de caída en conversión configuradas
- [ ] Alertas de aumento de errores configuradas

### Health Check
- [ ] Endpoint /api/health funciona
- [ ] Monitoreo automático configurado
- [ ] Alertas si el endpoint falla

---

## 15. Documentación

### Archivos Creados
- [ ] README.md actualizado
- [ ] ESTADO_PROYECTO_ACTUAL.md completo
- [ ] PLAN.md completo
- [ ] docs/ACCESO_DESDE_OTROS_DISPOSITIVOS.md completo
- [ ] docs/DEPLOY.md completo
- [ ] docs/SEGURIDAD_RLS.md completo
- [ ] docs/PAGOS.md completo
- [ ] docs/OBSERVABILIDAD.md completo
- [ ] docs/EMAILS.md completo
- [ ] docs/BETA.md completo
- [ ] CHECKLIST_SALIDA_PRODUCCION.md (este archivo)

### Código Documentado
- [ ] Funciones principales tienen comentarios
- [ ] Componentes complejos tienen comentarios
- [ ] API routes tienen documentación
- [ ] Esquema de BD documentado

---

## 16. Testing

### Manual
- [ ] Login/logout funciona
- [ ] Crear obra funciona
- [ ] Crear presupuesto funciona
- [ ] Calculadoras funcionan
- [ ] Navegación funciona
- [ ] Responsive en móvil
- [ ] Responsive en tablet
- [ ] Responsive en desktop

### Navegadores
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (última versión)
- [ ] Edge (última versión)

### Dispositivos
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Windows/Mac)

---

## 17. Accesibilidad

### WCAG 2.1 Nivel AA
- [ ] Contraste de colores adecuado
- [ ] Textos alternativos en imágenes
- [ ] Navegación por teclado funciona
- [ ] Lectores de pantalla compatibles
- [ ] Tamaño de fuente ajustable

---

## 18. SEO (Opcional)

### Meta Tags
- [ ] Title tag configurado
- [ ] Meta description configurada
- [ ] Open Graph tags configurados
- [ ] Twitter Cards configurados

### Sitemap
- [ ] sitemap.xml generado
- [ ] robots.txt configurado

---

## 19. Soporte

### Canales de Soporte
- [ ] Email de soporte configurado (soporte@gestiobra.com)
- [ ] Formulario de contacto (opcional)
- [ ] Chat en vivo (opcional)

### Documentación de Usuario
- [ ] Guía de inicio rápido
- [ ] FAQ
- [ ] Videos tutoriales (opcional)

---

## 20. Backup y Recuperación

### Base de Datos
- [ ] Backups automáticos configurados en Supabase
- [ ] Frecuencia de backups: diaria
- [ ] Retención de backups: 30 días
- [ ] Proceso de restauración documentado

### Código
- [ ] Repositorio en GitHub/GitLab
- [ ] Ramas protegidas (main)
- [ ] Tags para versiones
- [ ] README con instrucciones de deploy

---

## 21. Costos y Presupuesto

### Infraestructura Mensual
- [ ] Supabase: €0 (hobby plan)
- [ ] Vercel: €0 (hobby plan)
- [ ] Resend: €0 (100 emails/día)
- [ ] PostHog: €0 (1M eventos/mes)
- [ ] Sentry: €0 (5K errores/mes)
- [ ] Dominio: €10-15/año (si aplica)
- [ ] **Total estimado: €0-15/mes**

### Proyección a 6 meses
- [ ] MRR objetivo: €3,000-5,000
- [ ] Costos infraestructura: €0-50/mes
- [ ] Margen: >95%

---

## 22. Aprobaciones

### Técnica
- [ ] Code review completado
- [ ] Tests pasan
- [ ] Build exitoso
- [ ] Deploy exitoso

### Negocio
- [ ] Precios aprobados
- [ ] Términos de servicio aprobados
- [ ] Política de privacidad aprobada
- [ ] Estrategia de monetización aprobada

### Legal
- [ ] Términos de servicio revisados por abogado
- [ ] Política de privacidad revisada por abogado
- [ ] Cumplimiento RGPD verificado
- [ ] Datos fiscales configurados

---

## 23. Lanzamiento

### Pre-Launch
- [ ] Todos los checks anteriores completados
- [ ] Equipo notificado
- [ ] Plan de comunicación listo
- [ ] Soporte preparado

### Launch Day
- [ ] Deploy a producción
- [ ] Verificación final en producción
- [ ] Comunicado a beta users
- [ ] Monitoreo activo 24h

### Post-Launch
- [ ] Métricas revisadas diariamente
- [ ] Bugs corregidos inmediatamente
- [ ] Feedback recolectado
- [ ] Iteración planificada

---

## 24. Contactos de Emergencia

### Equipo
- **Desarrollo:** Cristóbal Soto - cristobalsotoacosta03@gmail.com
- **Supabase:** https://supabase.com/dashboard
- **Vercel:** https://vercel.com/dashboard
- **Stripe:** https://dashboard.stripe.com
- **Resend:** https://resend.com/dashboard

### Documentación
- **Repositorio:** https://github.com/cristobalsotoacosta03-dot/gestiobra.git
- **Documentación:** /docs
- **Estado:** ESTADO_PROYECTO_ACTUAL.md

---

## Resumen

**Fecha de Checklist:** _______________  
**Revisado por:** _______________  
**Aprobado por:** _______________  
**Fecha de Launch:** _______________

**Estado Final:**
- [ ] ✅ LISTO PARA PRODUCCIÓN
- [ ] ⚠️ LISTO CON RESTRICCIONES (especificar)
- [ ] ❌ NO LISTO (especificar bloqueos)

**Notas:**
_____________________________________________
_____________________________________________
_____________________________________________