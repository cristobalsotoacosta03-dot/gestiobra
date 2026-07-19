#!/usr/bin/env node

/**
 * Script de túnel temporal para exponer GestiObra en LAN/Internet
 * Soporta: ngrok (si está instalado) o Cloudflare Tunnel
 */

import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { platform } from 'os'

const TUNNEL_PORT = 5175
const TUNNEL_URLS_FILE = '.tunnel_urls'

let tunnelProcess = null

function detectTunnelTool() {
  // Verificar ngrok
  try {
    const ngrokPath = platform() === 'win32' ? 'ngrok.exe' : 'ngrok'
    if (existsSync(ngrokPath) || process.env.PATH.includes('ngrok')) {
      return 'ngrok'
    }
  } catch (e) {
    // Ignorar
  }

  // Verificar cloudflared
  try {
    const cloudflaredPath = platform() === 'win32' ? 'cloudflared.exe' : 'cloudflared'
    if (existsSync(cloudflaredPath) || process.env.PATH.includes('cloudflared')) {
      return 'cloudflared'
    }
  } catch (e) {
    // Ignorar
  }

  return null
}

function startNgrok() {
  console.log('🚀 Iniciando túnel con ngrok...')
  
  tunnelProcess = spawn('ngrok', ['http', TUNNEL_PORT.toString()], {
    stdio: 'inherit',
    shell: true
  })

  tunnelProcess.on('error', (err) => {
    console.error('❌ Error al iniciar ngrok:', err.message)
    console.log('💡 Instala ngrok desde: https://ngrok.com/download')
    process.exit(1)
  })

  // ngrok muestra la URL en stdout, la capturamos
  let output = ''
  tunnelProcess.stdout?.on('data', (data) => {
    output += data.toString()
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/)
    if (urlMatch) {
      console.log(`\n✅ Túnel activo: ${urlMatch[0]}`)
      saveTunnelUrl(urlMatch[0])
    }
  })
}

function startCloudflared() {
  console.log('🚀 Iniciando túnel con Cloudflare Tunnel...')
  
  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${TUNNEL_PORT}`], {
    stdio: 'inherit',
    shell: true
  })

  tunnelProcess.on('error', (err) => {
    console.error('❌ Error al iniciar cloudflared:', err.message)
    console.log('💡 Instala cloudflared desde: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation')
    process.exit(1)
  })

  // Cloudflare muestra la URL en formato: trycloudflare.com
  let output = ''
  tunnelProcess.stdout?.on('data', (data) => {
    output += data.toString()
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
    if (urlMatch) {
      console.log(`\n✅ Túnel activo: ${urlMatch[0]}`)
      saveTunnelUrl(urlMatch[0])
    }
  })
}

function saveTunnelUrl(url) {
  try {
    import('fs').then(fs => {
      fs.writeFileSync(TUNNEL_URLS_FILE, url)
      console.log(`💾 URL guardada en ${TUNNEL_URLS_FILE}`)
    })
  } catch (e) {
    // Ignorar
  }
}

function stopTunnel() {
  console.log('\n🛑 Deteniendo túnel...')
  
  if (tunnelProcess) {
    tunnelProcess.kill('SIGTERM')
    tunnelProcess = null
  }

  // Limpiar archivo de URLs
  try {
    import('fs').then(fs => {
      if (existsSync(TUNNEL_URLS_FILE)) {
        fs.unlinkSync(TUNNEL_URLS_FILE)
      }
    })
  } catch (e) {
    // Ignorar
  }

  console.log('✅ Túnel detenido')
  process.exit(0)
}

function showHelp() {
  console.log(`
🌐 GestiObra - Script de Túnel Temporal

Uso:
  node scripts/tunnel.js start    Iniciar túnel
  node scripts/tunnel.js stop     Detener túnel
  node scripts/tunnel.js help     Mostrar esta ayuda

Herramientas soportadas:
  - ngrok (recomendado)
  - Cloudflare Tunnel (gratuito)

Instalación:
  ngrok: https://ngrok.com/download
  cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

Notas:
  - Asegúrate de que la app esté corriendo en puerto ${TUNNEL_PORT}
  - Ejecuta 'npm run dev' en otra terminal antes de iniciar el túnel
  - La URL del túnel se guarda en ${TUNNEL_URLS_FILE}
  `)
  process.exit(0)
}

// Manejo de señales
process.on('SIGINT', stopTunnel)
process.on('SIGTERM', stopTunnel)

// Main
const command = process.argv[2]

if (!command || command === 'help') {
  showHelp()
}

if (command === 'start') {
  const tool = detectTunnelTool()
  
  if (!tool) {
    console.error('❌ No se detectó ninguna herramienta de túnel instalada')
    console.log('💡 Instala ngrok o cloudflared:')
    console.log('   - ngrok: https://ngrok.com/download')
    console.log('   - cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation')
    process.exit(1)
  }

  console.log(`🔧 Herramienta detectada: ${tool}`)
  
  if (tool === 'ngrok') {
    startNgrok()
  } else if (tool === 'cloudflared') {
    startCloudflared()
  }
} else if (command === 'stop') {
  stopTunnel()
} else {
  console.error(`❌ Comando desconocido: ${command}`)
  showHelp()
}