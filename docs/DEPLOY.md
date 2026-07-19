# Deploy en Producción

## Guía de Despliegue de GestiObra

---

## 1. Plataforma Recomendada: Vercel

### Justificación
- **Stack compatible:** Vite + React SPA funciona perfectamente en Vercel
- **Supabase integration:** Configuración sencilla de variables de entorno
- **SSL automático:** HTTPS sin configuración adicional
- **Preview deployments:** Cada PR genera un preview automático
- **CDN global:** Baja latencia para usuarios en España
- **Gratis para empezar:** Hobby plan sin costo

### Alternativas
- **Netlify:** Similar a Vercel, también recomendado
- **Fly.io:** Para apps con backend (si necesitamos API routes)
- **Render:** Alternativa económica

---

## 2. Preparación Previa

### 2.1. Build Local

```bash
# Verificar que el build funciona
npm run build

# Verificar que no hay errores
npm run verify

# Preview del build localmente
npm run preview
```

### 2.2. Verificar Variables de Entorno

Asegúrate de tener un archivo `.env` con:

```env
VITE_SUPABASE_URL=https://szfikjyaktdpsimpqgxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_K85u06yzTpyDPfvts86mSQ_ewEzlF7b
VITE_APP_URL=https://gestiobra.vercel.app
VITE_APP_NAME=GestiObra
```

---

## 3. Deploy en Vercel

### Opción A: Vercel CLI (Recomendado)

#### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso 2: Autenticarse

```bash
vercel login
```

Sigue las instrucciones en el navegador.

#### Paso 3: Primer Deploy (Preview)

```bash
vercel
```

Responde las preguntas:
- Set up and deploy? **Y**
- Which scope? **Tu cuenta**
- Link to existing project? **N**
- Project name? **gestiobra** (o el que prefieras)
- In which directory is your code located? **./**
- Want to override settings? **N**

Verás algo como:
```
✅  Deployed to: https://gestiobra-xxx.vercel.app
```

#### Paso 4: Configurar Variables de Entorno

```bash
# Supabase
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# App
vercel env add VITE_APP_URL production
vercel env add VITE_APP_NAME production

# Stripe (cuando lo implementes)
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
```

Para cada variable, pega el valor cuando lo solicite.

#### Paso 5: Deploy a Producción

```bash
vercel --prod
```

Tu app estará en: `https://gestiobra.vercel.app`

### Opción B: Vercel Dashboard (Web)

#### Paso 1: Importar Proyecto

1. Ve a: https://vercel.com/new
2. Importa tu repositorio de GitHub/GitLab/Bitbucket
3. O selecciona "Import Third-Party Repository"

#### Paso 2: Configurar Proyecto

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Paso 3: Variables de Entorno

En la sección "Environment Variables", agrega:

| Variable | Valor | Environment |
|----------|-------|-------------|
| VITE_SUPABASE_URL | https://szfikjyaktdpsimpqgxl.supabase.co | Production, Preview, Development |
| VITE_SUPABASE_ANON_KEY | sb_publishable_K85u06yzTpyDPfvts86mSQ_ewEzlF7b | Production, Preview, Development |
| VITE_APP_URL | https://gestiobra.vercel.app | Production |
| VITE_APP_NAME | GestiObra | Production, Preview, Development |

#### Paso 4: Deploy

Haz clic en "Deploy". Espera 1-2 minutos.

---

## 4. Configuración de Supabase para Producción

### 4.1. Actualizar URL en Supabase

1. Ve a: https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/settings/api
2. En "URL Configuration", agrega tu dominio de Vercel:
   - `https://gestiobra.vercel.app`
   - `https://*.vercel.app` (para preview deployments)

### 4.2. Verificar RLS

Las políticas RLS ya están implementadas. Verifica que funcionen:

```sql
-- En Supabase SQL Editor
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4.3. Configurar CORS (si es necesario)

En Supabase Dashboard:
1. Ve a Settings > API
2. En "CORS", agrega tu dominio: `https://gestiobra.vercel.app`

---

## 5. Configuración de Dominio Custom (Opcional)

### 5.1. Comprar Dominio

Recomendados:
- **Namecheap:** https://www.namecheap.com
- **GoDaddy:** https://www.godaddy.com
- **Google Domains:** https://domains.google

Busca: `gestiobra.com`, `gestiobra.es`, `gestiobra.app`

### 5.2. Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings > Domains
3. Agrega tu dominio: `gestiobra.com`
4. Vercel te dará los nameservers o registros DNS

### 5.3. Configurar DNS en tu Registrador

En Namecheap/GoDaddy/Google Domains, agrega:

**Opción A: Nameservers (Recomendado)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Opción B: Registros A/AAAA**
```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### 5.4. SSL Automático

Vercel configura SSL automáticamente. Espera 5-10 minutos.

---

## 6. Verificación Post-Deploy

### 6.1. Checklist Básico

```bash
# 1. Verificar que la app carga
curl https://gestiobra.vercel.app

# 2. Verificar que Supabase responde
# Abre la app en el navegador y verifica que el dashboard cargue datos

# 3. Verificar consola del navegador
# Abre DevTools (F12) y verifica que no haya errores

# 4. Verificar HTTPS
# Debe mostrar el candado en la barra de direcciones
```

### 6.2. Pruebas Funcionales

1. **Login:** Prueba el login con credenciales de prueba
2. **Dashboard:** Verifica que los KPIs se muestren
3. **Obras:** Crea una obra de prueba
4. **Presupuestos:** Crea un presupuesto de prueba
5. **Calculadoras:** Prueba las 3 calculadoras

### 6.3. Verificar Variables de Entorno

En la consola del navegador (F12 > Console):

```javascript
// Debería mostrar la URL de Supabase
console.log(import.meta.env.VITE_SUPABASE_URL)

// Debería mostrar la URL de la app
console.log(import.meta.env.VITE_APP_URL)
```

---

## 7. CI/CD Automático (Opcional)

### 7.1. GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run verification
        run: npm run verify
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.2. Configurar Secrets en GitHub

1. Ve a tu repo > Settings > Secrets and variables > Actions
2. Agrega:
   - `VERCEL_TOKEN`: Token de Vercel (desde vercel.com/account/tokens)
   - `VERCEL_ORG_ID`: Tu ID de organización en Vercel
   - `VERCEL_PROJECT_ID`: ID del proyecto en Vercel

---

## 8. Troubleshooting

### Error: "Function timeout"

**Causa:** Build muy lento o dependencias pesadas

**Solución:**
```bash
# Verificar tamaño de bundle
npm run build

# Si es muy grande, considera:
# 1. Code splitting
# 2. Lazy loading de componentes
# 3. Remover dependencias innecesarias
```

### Error: "Module not found"

**Causa:** Dependencia no instalada

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Environment variable not found"

**Causa:** Variables no configuradas en Vercel

**Solución:**
```bash
# Verificar variables en Vercel
vercel env ls

# Agregar variables faltantes
vercel env add NOMBRE_VARIABLE production
```

### La app carga pero no hay datos

**Causa:** Problema con Supabase o RLS

**Solución:**
1. Verifica que las variables de Supabase estén correctas
2. Verifica que las políticas RLS permitan lectura
3. Verifica que haya datos en las tablas

### Error 404 en rutas

**Causa:** Vercel no está configurado para SPA

**Solución:** Crea `vercel.json` en la raíz:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 9. Monitoreo Post-Deploy

### 9.1. Vercel Analytics

Habilita en Vercel Dashboard > Analytics:
- Web Vitals
- Speed Insights
- Analytics

### 9.2. Logs

```bash
# Ver logs en tiempo real
vercel logs https://gestiobra.vercel.app --follow
```

### 9.3. Alertas

Configura alertas en Vercel para:
- Deploy fallidos
- Errores 5xx
- Límite de bandwidth

---

## 10. Próximos Pasos

1. ✅ Deploy básico completado
2. ⏳ Configurar dominio custom
3. ⏳ Implementar Stripe (ver docs/PAGOS.md)
4. ⏳ Implementar analítica (ver docs/OBSERVABILIDAD.md)
5. ⏳ Implementar emails (ver docs/EMAILS.md)
6. ⏳ Sistema de invitaciones (ver docs/BETA.md)

---

## 11. Comandos Útiles

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs https://gestiobra.vercel.app

# Rollback a deploy anterior
vercel rollback

# Ver variables de entorno
vercel env ls

# Agregar variable
vercel env add VARIABLE_NAME production

# Remover deploy
vercel rm gestiobra-xxx
```

---

**URL de Producción:** https://gestiobra.vercel.app  
**URL de Preview:** https://gestiobra-git-xxx.vercel.app  
**Último deploy:** Verificar en Vercel Dashboard