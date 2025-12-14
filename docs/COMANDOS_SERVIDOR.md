# 🚀 Comandos para Servidor de Producción

## Setup Inicial (Primera vez)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp config/env.production.example .env.production
# Editar .env.production con tus valores reales

# 3. Construir la aplicación
 
```

## Ejecutar en Producción

### Opción 1: Servidor Next.js (Recomendado)

```bash
# Construir (si aún no lo has hecho)
pnpm run build

# Iniciar servidor de producción
pnpm run start
```

El servidor se iniciará en `http://localhost:3000` por defecto.

### Opción 2: Con puerto personalizado

```bash
# Especificar puerto
PORT=3000 pnpm run start

# O con variable de entorno
export PORT=3000
pnpm run start
```

### Opción 3: Con PM2 (Recomendado para producción real)

```bash
# Instalar PM2 globalmente (si no lo tienes)
npm install -g pm2

# Iniciar con PM2
pm2 start npm --name "hommie-app" -- start

# Ver logs
pm2 logs hommie-app

# Ver estado
pm2 status

# Reiniciar
pm2 restart hommie-app

# Detener
pm2 stop hommie-app
```

### Opción 4: Con systemd (Linux)

Crear archivo `/etc/systemd/system/hommie-app.service`:

```ini
[Unit]
Description=Hommie 0% Comisión App
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/a/hommie-0-commission-next
Environment="NODE_ENV=production"
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Luego:

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Iniciar servicio
sudo systemctl start hommie-app

# Habilitar inicio automático
sudo systemctl enable hommie-app

# Ver logs
sudo journalctl -u hommie-app -f
```

## Verificación

```bash
# Verificar que el servidor responde
curl http://localhost:3000

# Verificar variables de entorno
grep -E "^[A-Z]" .env.production | grep -v "^#"
```

## Variables de Entorno Críticas

Asegúrate de que `.env.production` tenga:

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
USE_SUPABASE=true
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

## Troubleshooting

### El servidor no inicia

```bash
# Verificar que el build existe
ls -la .next

# Si no existe, construir
pnpm run build
```

### Error de puerto en uso

```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000

# Matar proceso
kill -9 $(lsof -t -i:3000)

# O usar otro puerto
PORT=3001 pnpm run start
```

### Variables de entorno no se leen

```bash
# Verificar que .env.production existe
ls -la .env.production

# Verificar contenido
cat .env.production | grep -v "^#"
```

## Comandos Útiles

```bash
# Ver logs en tiempo real (si usas PM2)
pm2 logs hommie-app --lines 100

# Reiniciar después de cambios en .env.production
pm2 restart hommie-app

# Ver uso de recursos
pm2 monit

# Verificar estado de la app
curl -I http://localhost:3000
```

## Notas Importantes

1. **Build primero**: Siempre ejecuta `pnpm run build` antes de `pnpm run start`
2. **Variables de entorno**: El servidor de producción solo lee `.env.production`, NO `.env.local`
3. **Puerto**: Por defecto usa 3000, pero puedes cambiarlo con `PORT=XXXX`
4. **PM2**: Recomendado para producción real (auto-restart, logs, etc.)
