# Emails Transaccionales

## Implementación de Resend para GestiObra

---

## 1. Proveedor de Email: Resend

### 1.1. ¿Por qué Resend?

- **Simplicidad:** API moderna y fácil de usar
- **Precio:** Gratis hasta 100 emails/día, luego $0.0005/email
- **Entregabilidad:** Excelente tasa de entrega
- **Templates:** Soporte para React Email
- **Webhooks:** Eventos de email (delivered, opened, clicked)

### 1.2. Alternativas

- **SendGrid:** Más maduro, pero más complejo
- **Mailgun:** Bueno para volumen, pero requiere más configuración
- **Postmark:** Excelente entregabilidad, pero más caro

### 1.3. Crear Cuenta en Resend

1. Ve a: https://resend.com/signup
2. Crea una cuenta
3. Verifica tu dominio (opcional en desarrollo)

### 1.4. Obtener API Key

1. Ve a: https://resend.com/api-keys
2. Crea una nueva API key
3. Copia la key: `re_xxx`

### 1.5. Configurar Variables de Entorno

```env
# .env
RESEND_API_KEY=re_xxx

# Vercel
vercel env add RESEND_API_KEY production
```

---

## 2. Configuración de Dominio (Producción)

### 2.1. Verificar Dominio

1. Ve a: https://resend.com/domains
2. Agrega tu dominio: `gestiobra.com`
3. Resend te dará registros DNS para agregar:

```
Type: TXT
Host: @
Value: resend-verification=xxx

Type: MX
Host: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
```

### 2.2. Configurar SPF y DKIM

Agrega estos registros DNS en tu registrador:

```
Type: TXT
Host: @
Value: v=spf1 include:amazonses.com -all

Type: TXT
Host: resend._domainkey
Value: xxx

Type: TXT
Host: resend._domainkey.newsletters
Value: xxx
```

### 2.3. Verificar Configuración

```bash
# Verificar DNS
dig TXT gestiobra.com
dig MX gestiobra.com

# Enviar email de prueba
resend emails send --from="test@gestiobra.com" --to="tu@email.com" --subject="Test" --text="Test"
```

---

## 3. Implementación

### 3.1. Cliente de Resend

```javascript
// src/lib/email.js
import { Resend } from 'resend'

export const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const EMAIL_FROM = {
  default: 'GestiObra <noreply@gestiobra.com>',
  support: 'Soporte GestiObra <soporte@gestiobra.com>',
  billing: 'Facturación GestiObra <facturacion@gestiobra.com>'
}
```

### 3.2. API Route para Enviar Emails

```javascript
// api/email/send.js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { to, subject, html, from } = await request.json()

    // Validar que el usuario esté autenticado
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: from || 'GestiObra <noreply@gestiobra.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })

    if (error) {
      console.error('Error sending email:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Guardar log de email
    await supabase.from('email_logs').insert({
      user_id: user.id,
      to,
      subject,
      resend_id: data.id,
      status: 'sent'
    })

    return Response.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

---

## 4. Templates de Email

### 4.1. Template: Bienvenida

```javascript
// src/lib/email-templates/welcome.js
export function welcomeTemplate(userName, userEmail) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bienvenido a GestiObra</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">GestiObra</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Gestión Integral de Obras</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #111827; margin-top: 0;">¡Bienvenido, ${userName}! 👋</h2>
            
            <p style="color: #4b5563;">
              Gracias por registrarte en GestiObra. Estamos emocionados de tenerte a bordo.
            </p>
            
            <h3 style="color: #111827; margin-top: 30px;">¿Qué puedes hacer ahora?</h3>
            
            <ul style="color: #4b5563;">
              <li>✅ Crear y gestionar tus obras</li>
              <li>✅ Generar presupuestos profesionales</li>
              <li>✅ Usar calculadoras técnicas (ACS, GLP, Tuberías)</li>
              <li>✅ Acceder a la biblia técnica (RITE, UNE, REBT)</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${import.meta.env.VITE_APP_URL}/dashboard" 
                 style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Ir al Dashboard
              </a>
            </div>
            
            <h3 style="color: #111827; margin-top: 30px;">¿Necesitas ayuda?</h3>
            
            <p style="color: #4b5563;">
              Consulta nuestra <a href="${import.meta.env.VITE_APP_URL}/docs" style="color: #2563eb;">documentación</a> 
              o contacta con nosotros en <a href="mailto:soporte@gestiobra.com" style="color: #2563eb;">soporte@gestiobra.com</a>
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2026 GestiObra. Todos los derechos reservados.<br>
              <a href="${import.meta.env.VITE_APP_URL}/legal/privacidad" style="color: #6b7280;">Privacidad</a> | 
              <a href="${import.meta.env.VITE_APP_URL}/legal/aviso" style="color: #6b7280;">Aviso Legal</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
```

### 4.2. Template: Confirmación de Suscripción

```javascript
// src/lib/email-templates/subscription-confirmation.js
export function subscriptionConfirmationTemplate(userName, planName, amount, nextBillingDate) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Confirmación de Suscripción</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✅ Suscripción Activa</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #111827; margin-top: 0;">¡Gracias, ${userName}!</h2>
            
            <p style="color: #4b5563;">
              Tu suscripción al plan <strong>${planName}</strong> ha sido activada exitosamente.
            </p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #111827; margin-top: 0;">Detalles de la Suscripción</h3>
              
              <table style="width: 100%; color: #4b5563;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Plan:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>Precio:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">€${amount}/mes</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Próxima facturación:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${nextBillingDate}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${import.meta.env.VITE_APP_URL}/billing" 
                 style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Gestionar Suscripción
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Recibirás un recibo por email cada vez que se procese un pago. 
              Puedes cancelar tu suscripción en cualquier momento desde tu panel de facturación.
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2026 GestiObra. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
```

### 4.3. Template: Pago Fallido

```javascript
// src/lib/email-templates/payment-failed.js
export function paymentFailedTemplate(userName, amount, retryDate) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Pago Fallido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">⚠️ Pago Fallido</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #111827; margin-top: 0;">Hola, ${userName}</h2>
            
            <p style="color: #4b5563;">
              No pudimos procesar el pago de tu suscripción de <strong>€${amount}</strong>.
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;">
                <strong>¿Qué significa esto?</strong><br>
                Tu suscripción se mantendrá activa hasta el <strong>${retryDate}</strong>. 
                Después de esa fecha, tu cuenta pasará a modo de solo lectura hasta que actualices tu método de pago.
              </p>
            </div>
            
            <h3 style="color: #111827; margin-top: 30px;">¿Cómo solucionarlo?</h3>
            
            <ol style="color: #4b5563;">
              <li>Inicia sesión en tu cuenta</li>
              <li>Ve a <a href="${import.meta.env.VITE_APP_URL}/billing" style="color: #2563eb;">Facturación</a></li>
              <li>Actualiza tu método de pago</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${import.meta.env.VITE_APP_URL}/billing" 
                 style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Actualizar Método de Pago
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Si tienes preguntas, contacta con nosotros en 
              <a href="mailto:soporte@gestiobra.com" style="color: #2563eb;">soporte@gestiobra.com</a>
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2026 GestiObra. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
```

---

## 5. Webhooks de Resend

### 5.1. Configurar Webhook

1. Ve a: https://resend.com/webhooks
2. Crea un nuevo webhook
3. URL: `https://gestiobra.vercel.app/api/email/webhook`
4. Eventos a escuchar:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.complained`

### 5.2. API Route para Webhook

```javascript
// api/email/webhook.js
export async function POST(request) {
  try {
    const event = await request.json()
    
    // Actualizar log de email
    await supabase
      .from('email_logs')
      .update({
        status: event.type,
        delivered_at: event.type === 'email.delivered' ? new Date() : null,
        opened_at: event.type === 'email.opened' ? new Date() : null,
        clicked_at: event.type === 'email.clicked' ? new Date() : null
      })
      .eq('resend_id', event.data.email_id)
    
    return Response.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: err.message }, { status: 400 })
  }
}
```

---

## 6. Servicio de Emails

```javascript
// src/lib/email-service.js
import { resend, EMAIL_FROM } from './email'
import { welcomeTemplate } from './email-templates/welcome'
import { subscriptionConfirmationTemplate } from './email-templates/subscription-confirmation'
import { paymentFailedTemplate } from './email-templates/payment-failed'

export async function sendWelcomeEmail(user) {
  try {
    const html = welcomeTemplate(user.nombre, user.email)
    
    await resend.emails.send({
      from: EMAIL_FROM.default,
      to: user.email,
      subject: '¡Bienvenido a GestiObra!',
      html
    })
  } catch (err) {
    console.error('Error sending welcome email:', err)
  }
}

export async function sendSubscriptionConfirmation(user, plan, amount, nextBillingDate) {
  try {
    const html = subscriptionConfirmationTemplate(
      user.nombre,
      plan.name,
      amount,
      nextBillingDate
    )
    
    await resend.emails.send({
      from: EMAIL_FROM.billing,
      to: user.email,
      subject: 'Confirmación de Suscripción - GestiObra',
      html
    })
  } catch (err) {
    console.error('Error sending subscription confirmation:', err)
  }
}

export async function sendPaymentFailedEmail(user, amount, retryDate) {
  try {
    const html = paymentFailedTemplate(user.nombre, amount, retryDate)
    
    await resend.emails.send({
      from: EMAIL_FROM.billing,
      to: user.email,
      subject: 'Pago Fallido - Acción Requerida',
      html
    })
  } catch (err) {
    console.error('Error sending payment failed email:', err)
  }
}
```

---

## 7. Integración con Stripe Webhooks

```javascript
// api/stripe/webhook.js
import { sendSubscriptionConfirmation, sendPaymentFailedEmail } from '../lib/email-service'

async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata.user_id
      
      // Obtener datos del usuario
      const { data: user } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Obtener datos del plan
      const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', session.metadata.plan_id)
        .single()
      
      // Enviar email de confirmación
      await sendSubscriptionConfirmation(
        user,
        plan,
        plan.price,
        new Date(session.current_period_end * 1000).toLocaleDateString('es-ES')
      )
      
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      
      // Obtener usuario
      const { data: customer } = await supabase
        .from('customers')
        .select('user_id')
        .eq('stripe_customer_id', invoice.customer)
        .single()
      
      const { data: user } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', customer.user_id)
        .single()
      
      // Enviar email de pago fallido
      await sendPaymentFailedEmail(
        user,
        invoice.amount_due / 100,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
      )
      
      break
    }
  }
}
```

---

## 8. Esquema de Base de Datos

```sql
-- Tabla: email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id);
```

---

## 9. Testing

### 9.1. Enviar Email de Prueba

```bash
# Usando Resend CLI
resend emails send \
  --from="test@gestiobra.com" \
  --to="tu@email.com" \
  --subject="Test Email" \
  --text="Este es un email de prueba"
```

### 9.2. Verificar en Desarrollo

```javascript
// En desarrollo, usar Resend test mode
if (import.meta.env.DEV) {
  // Resend automáticamente usa modo test
  console.log('📧 Email enviado (modo test)')
}
```

### 9.3. Verificar Entregabilidad

1. **Resend Dashboard:**
   - Ve a: https://resend.com/emails
   - Verifica que el email aparece como "Delivered"

2. **Verificar SPF/DKIM:**
   ```bash
   dig TXT gestiobra.com
   dig TXT resend._domainkey.gestiobra.com
   ```

---

## 10. Mejores Prácticas

### 10.1. Evitar Spam

- ✅ Usar dominio verificado
- ✅ Configurar SPF, DKIM, DMARC
- ✅ No usar palabras spam en subject
- ✅ Incluir dirección física
- ✅ Incluir link de unsubscribe (si es marketing)

### 10.2. Performance

- ✅ Enviar emails de forma asíncrona
- ✅ No bloquear la UI esperando confirmación
- ✅ Usar colas para volumen alto (Bull/BullMQ)

### 10.3. Seguridad

- ✅ Verificar autenticación antes de enviar
- ✅ No enviar datos sensibles sin encriptar
- ✅ Rate limiting en API de emails
- ✅ Log de todos los emails enviados

---

## 11. Troubleshooting

### Error: "Domain not verified"

**Solución:**
1. Verifica que agregaste los registros DNS
2. Espera 24-48 horas para propagación DNS
3. Verifica en Resend Dashboard > Domains

### Error: "Invalid API key"

**Solución:**
1. Verifica que RESEND_API_KEY esté correcta
2. Verifica que no expiró la key
3. Genera una nueva key si es necesario

### Email no llega

**Solución:**
1. Verifica carpeta de spam
2. Verifica logs en Resend Dashboard
3. Verifica que el dominio esté verificado
4. Verifica SPF/DKIM configurados correctamente

---

## 12. Costos

### Resend Pricing

- **Free:** 100 emails/día, 1 dominio
- **Core:** $20/mes (50K emails)
- **Pro:** $80/mes (200K emails)

### Estimación para GestiObra (mes 1)

- **Bienvenidas:** ~50 emails → Gratis
- **Confirmaciones de suscripción:** ~20 emails → Gratis
- **Recordatorios de pago:** ~10 emails → Gratis
- **Total:** €0/mes

---

**Responsable:** Cristóbal Soto  
**Última revisión:** 5 de Julio de 2026  
**Próxima revisión:** 5 de Agosto de 2026