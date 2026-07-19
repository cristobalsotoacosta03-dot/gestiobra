# Acceso desde Otros Dispositivos

## Guía para exponer GestiObra en LAN/Internet

---

## 1. Acceso en Red Local (LAN)

### Método 1: Usar el script npm (Recomendado)

```bash
# Terminal 1: Iniciar la app en modo LAN
npm run dev:lan

# La app estará disponible en:
# - Local: http://localhost:5175
# - LAN: http://192.168.x.x:5175 (tu IP local)
```

### Método 2: Configuración manual de Vite

Edita `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // o '0.0.0.0'
    port: 5175,
  },
})
```

Luego ejecuta:

```bash
npm run dev
```

### Obtener tu IP local

**Windows:**
```bash
ipconfig
# Busca "Dirección IPv4" en tu adaptador WiFi/Ethernet
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Acceder desde otro dispositivo

1. Asegúrate de que ambos dispositivos estén en la misma red WiFi
2. En el navegador del otro dispositivo, visita: `http://TU_IP:5175`
3. Ejemplo: `http://192.168.1.45:5175`

### Firewall

**Windows:** Permite el acceso a Node.js en tu firewall cuando lo solicite.

---

## 2. Túnel Temporal (Internet Público)

### Opción A: ngrok (Recomendado)

#### Instalación

1. Descarga ngrok desde: https://ngrok.com/download
2. Crea una cuenta gratuita en: https://dashboard.ngrok.com/signup
3. Copia tu authtoken desde: https://dashboard.ngrok.com/get-started/your-authtoken
4. Configura el authtoken:

```bash
ngrok config add-authtoken TU_AUTHTOKEN
```

#### Uso

```bash
# Terminal 1: Iniciar la app
npm run dev

# Terminal 2: Iniciar túnel
npm run tunnel:start
```

Verás algo como:

```
✅ Túnel activo: https://abc123.ngrok.io
```

Comparte esa URL con quien necesite acceder.

#### Detener túnel

```bash
npm run tunnel:stop
```

O presiona `Ctrl+C` en la terminal del túnel.

### Opción B: Cloudflare Tunnel (Gratuito)

#### Instalación

**Windows (con Chocolatey):**
```bash
choco install cloudflared
```

**Mac (con Homebrew):**
```bash
brew install cloudflared
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install cloudflared

# O descargar binario desde:
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
```

#### Uso

```bash
# Terminal 1: Iniciar la app
npm run dev

# Terminal 2: Iniciar túnel
npm run tunnel:start
```

Verás algo como:

```
✅ Túnel activo: https://abc123.trycloudflare.com
```

#### Detener túnel

```bash
npm run tunnel:stop
```

O presiona `Ctrl+C` en la terminal del túnel.

---

## 3. Limitaciones de Túneles Gratuitos

### ngrok Free Tier
- ✅ 1 túnel activo
- ✅ 4 horas por sesión (se desconecta automáticamente)
- ⚠️ URL aleatoria cada vez (ej: https://abc123.ngrok.io)
- ⚠️ Límite de 40 conexiones/minuto
- ❌ No permite dominio custom

### Cloudflare Tunnel Free
- ✅ Túneles ilimitados
- ✅ Sin límite de tiempo
- ✅ URL aleatoria cada vez (ej: https://abc123.trycloudflare.com)
- ⚠️ Requiere configuración inicial más compleja
- ⚠️ Sin soporte prioritario

### Soluciones para URLs fijas

**Opción 1:** Usar planes de pago (ngrok Pro $8/mes, Cloudflare Tunnel con dominio propio)

**Opción 2:** Deploy en Vercel/Netlify (recomendado para producción)

---

## 4. Deploy en Producción (Recomendado)

Para acceso permanente, despliega en Vercel o Netlify:

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

---

## 5. Troubleshooting

### No puedo acceder desde otro dispositivo

1. **Verifica que estén en la misma red:**
   ```bash
   # En el dispositivo que corre la app
   ping TU_IP_DESDE_OTRO_DISPOSITIVO
   ```

2. **Verifica el firewall:**
   - Windows: Permitir Node.js en Firewall de Windows
   - Mac: Preferencias del Sistema > Seguridad > Firewall > Permitir

3. **Verifica que la app esté corriendo:**
   ```bash
   # Deberías ver "VITE v8.x.x ready in xxx ms"
   npm run dev:lan
   ```

### El túnel no funciona

1. **Verifica que la app esté corriendo en el puerto correcto:**
   ```bash
   # Debería estar en http://localhost:5175
   npm run dev
   ```

2. **Reinicia el túnel:**
   ```bash
   npm run tunnel:stop
   npm run tunnel:start
   ```

3. **Verifica que ngrok/cloudflared esté instalado:**
   ```bash
   ngrok version
   # o
   cloudflared version
   ```

### La app es muy lenta en el túnel

- Los túneles gratuitos tienen limitaciones de velocidad
- Solución: Deploy en Vercel/Netlify para producción

---

## 6. Próximos Pasos

1. **Acceso temporal:** Usa `npm run dev:lan` para LAN o `npm run tunnel:start` para Internet
2. **Acceso permanente:** Deploy en Vercel/Netlify (ver docs/DEPLOY.md)
3. **Beta cerrada:** Implementa sistema de invitaciones (ver docs/BETA.md)

---

## 7. Comandos Rápidos

```bash
# Desarrollo local
npm run dev

# Desarrollo en LAN
npm run dev:lan

# Iniciar túnel
npm run tunnel:start

# Detener túnel
npm run tunnel:stop

# Verificar entorno
npm run verify

# Build de producción
npm run build

# Preview de build
npm run preview
```

---

**Nota:** Para producción, usa Vercel/Netlify en lugar de túneles. Los túneles son solo para desarrollo y demos temporales.