# PLAN.md - Auditoría Rápida del Entorno
## De Demo Local a MVP Monetizable en 24-48h

---

## 1. VARIABLES DE ENTORNO REQUERIDAS

### Obligatorias (Producción)
```env
# Supabase
VITE_SUPABASE_URL=https://szfikjyaktdpsimpqgxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_K85u06yzTpyDPfvts86mSQ_ewEzlF7b

# Stripe (Pagos)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
VITE_APP_URL=https://gestiobra.vercel.app
VITE_APP_NAME=GestiObra
```

### Opcionales (Analítica/Errores)
```env
# PostHog (Analítica)
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Sentry (Errores)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Resend (Emails)
RESEND_API_KEY=re_xxx
```

### Seguras (Nunca exponer en frontend)
```env
# Solo backend/serverless
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

---

## 2. RIESGOS DE SEGURIDAD

### ✅ Ya Implementado
- RLS activo en todas las tablas de Supabase
- Políticas por empresa (aislamiento multi-tenant)
- Anon key expuesta en frontend (correcto para Supabase)
- Service key NUNCA se expone al cliente

### ⚠️ Riesgos Identificados
1. **Stripe Webhook sin verificación de firma** → CRÍTICO
   - Solución: Implementar verificación de firma en endpoint /stripe/webhook

2. **Variables de entorno en cliente** → MEDIO
   - Solo VITE_* son accesibles en frontend (correcto)
   - STRIPE_SECRET_KEY nunca debe estar en VITE_*

3. **CORS no configurado** → MEDIO
   - Solución: Configurar CORS en Vercel/Supabase para dominio de producción

4. **Sin rate limiting** → BAJO
   - Solución: Agregar rate limiting en API routes (Vercel Edge Middleware)

5. **Emails sin verificación SPF/DKIM** → MEDIO
   - Solución: Configurar dominio en Resend y verificar DNS

---

## 3. HUECOS DE BUILD/DEPLOY

### Build
- ✅ Vite configurado correctamente
- ✅ Scripts npm: dev, build, preview
- ⚠️ Falta: script de verificación pre-deploy
- ⚠️ Falta: adaptador para Vercel (si es necesario)

### Deploy
- ⚠️ Falta: vercel.json o netlify.toml
- ⚠️ Falta: configuración de variables de entorno en plataforma
- ⚠️ Falta: dominio custom (opcional pero recomendado)
- ⚠️ Falta: SSL/HTTPS (automático en Vercel/Netlify)

### CI/CD
- ⚠️ Falta: GitHub Actions workflow
- ⚠️ Falta: tests automáticos pre-deploy
- ⚠️ Falta: preview deployments por PR

---

## 4. STACK DETECTADO

### Frontend
- React 19.2.6
- Vite 8.0.12
- Tailwind CSS + PostCSS
- Supabase Client 2.49.0

### Backend
- Supabase (PostgreSQL + Auth + Edge Functions)
- API Routes (Vercel/Netlify Functions)

### Pagos
- Stripe (no implementado aún)

### Analítica
- PostHog/Umami (no implementado aún)
- Sentry (no implementado aún)

### Emails
- Resend/Mailgun/SendGrid (no implementado aún)

---

## 5. PLAN DE ACCIÓN INMEDIATO

### Fase 1: Preparación (1-2h)
1. ✅ Generar PLAN.md (este archivo)
2. Actualizar .env.example con todas las variables
3. Crear estructura de docs/
4. Configurar .gitignore y .clineignore

### Fase 2: Infraestructura (2-3h)
5. Configurar túnel temporal (ngrok/Cloudflare)
6. Crear scripts npm: dev:lan, tunnel:start, tunnel:stop
7. Documentar acceso desde otros dispositivos

### Fase 3: Deploy (3-4h)
8. Configurar Vercel/Netlify
9. Crear vercel.json/netlify.toml
10. Configurar variables de entorno en plataforma
11. Primer deploy a producción

### Fase 4: Pagos (4-6h)
12. Crear cuenta Stripe (test mode)
13. Implementar API routes para checkout
14. Implementar webhook /stripe/webhook
15. Crear página /billing
16. Implementar gating de funcionalidades

### Fase 5: Observabilidad (2-3h)
17. Integrar PostHog/Umami
18. Integrar Sentry
19. Crear eventos básicos

### Fase 6: Legal y Beta (2-3h)
20. Crear páginas /legal/privacidad y /legal/aviso
21. Implementar sistema de invitaciones
22. Crear página /pricing
23. Crear página /beta

### Fase 7: Testing y Verificación (2-3h)
24. Crear CHECKLIST_SALIDA_PRODUCCION.md
25. Implementar npm run verify
26. Implementar smoke tests básicos
27. Verificar RLS y seguridad

---

## 6. ENTREGABLES FINALES

### Archivos de Configuración
- ✅ .env.example actualizado
- ✅ vercel.json o netlify.toml
- ✅ .clineignore
- ✅ package.json con scripts actualizados

### Documentación
- ✅ PLAN.md (este archivo)
- ⏳ docs/ACCESO_DESDE_OTROS_DISPOSITIVOS.md
- ⏳ docs/DEPLOY.md
- ⏳ docs/SEGURIDAD_RLS.md
- ⏳ docs/PAGOS.md
- ⏳ docs/OBSERVABILIDAD.md
- ⏳ docs/EMAILS.md
- ⏳ docs/BETA.md
- ⏳ CHECKLIST_SALIDA_PRODUCCION.md

### Código
- ⏳ src/lib/stripe.js (cliente Stripe)
- ⏳ src/pages/Billing.jsx
- ⏳ src/pages/Pricing.jsx
- ⏳ src/pages/Beta.jsx
- ⏳ src/pages/legal/Privacidad.jsx
- ⏳ src/pages/legal/AvisoLegal.jsx
- ⏳ src/components/PaymentGate.jsx
- ⏳ src/hooks/useSubscription.js
- ⏳ api/stripe/webhook.js (o .ts)
- ⏳ api/stripe/checkout.js
- ⏳ middleware.js (rate limiting)

### Base de Datos
- ⏳ Tabla subscriptions (si no existe)
- ⏳ Tabla invitations (si no existe)
- ⏳ Triggers para auditoría (si no existen)

---

## 7. CRONOGRAMA ESTIMADO

| Fase | Duración | Dependencias |
|------|----------|--------------|
| 1. Preparación | 1-2h | Ninguna |
| 2. Infraestructura | 2-3h | Fase 1 |
| 3. Deploy | 3-4h | Fase 2 |
| 4. Pagos | 4-6h | Fase 3 |
| 5. Observabilidad | 2-3h | Fase 3 |
| 6. Legal y Beta | 2-3h | Fase 3 |
| 7. Testing | 2-3h | Todas las anteriores |

**Total: 16-24h de trabajo**

---

## 8. DECISIONES PENDIENTES

### Por el Usuario
1. ¿Plataforma de deploy? (Vercel/Netlify/Fly/Render)
2. ¿Cuenta de Stripe? (test mode primero)
3. ¿Proveedor de emails? (Resend recomendado)
4. ¿Analítica? (PostHog o Umami)
5. ¿Errores? (Sentry)
6. ¿Dominio custom? (opcional)

### Por el Equipo
1. ¿Túnel: ngrok o Cloudflare?
2. ¿Pricing: €49, €99, €149/mes?
3. ¿Trial: 7 días, 14 días, 30 días?
4. ¿Beta: invitaciones o abierta con email?

---

**Estado:** Listo para ejecutar Fase 1
**Próximo paso:** Actualizar .env.example y crear estructura de docs/