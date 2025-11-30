#!/bin/bash

echo "🏗️  Construyendo versión estática para Unidad 207..."

# Hacer build de producción
echo "📦 Haciendo build de producción..."
pnpm build

# Crear directorio para la versión estática
echo "📁 Creando directorio para versión estática..."
mkdir -p static-build

# Copiar archivos estáticos
echo "📋 Copiando archivos estáticos..."
cp -r public/* static-build/
cp -r .next/static static-build/_next/static

# Crear archivo de configuración para servidor estático
echo "⚙️  Creando configuración de servidor..."
cat > static-build/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'unit-207-static.html'));
});

// Ruta para la unidad 207
app.get('/unit-207', (req, res) => {
    res.sendFile(path.join(__dirname, 'unit-207-static.html'));
});

// Fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'unit-207-static.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor estático corriendo en http://localhost:${PORT}`);
    console.log(`📱 Página de Unidad 207: http://localhost:${PORT}/unit-207-static.html`);
    console.log(`📱 Para móvil: http://localhost:${PORT}/unit-207-static.html`);
});
EOF

# Crear package.json para el servidor estático
echo "📦 Creando package.json para servidor estático..."
cat > static-build/package.json << 'EOF'
{
  "name": "hommie-unit-207-static",
  "version": "1.0.0",
  "description": "Página estática para Unidad 207 - Home Amengual",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Crear README con instrucciones
echo "📖 Creando README con instrucciones..."
cat > static-build/README.md << 'EOF'
# Unidad 207 - Home Amengual | Página Estática

Esta es la página estática para la Unidad 207 del edificio Home Amengual.

## 🚀 Cómo usar

### Opción 1: Servidor local
```bash
npm install
npm start
```

### Opción 2: Servidor de desarrollo
```bash
npx serve .
```

### Opción 3: Python
```bash
python -m http.server 3001
```

## 📱 Para móvil

1. Abre la página en tu navegador móvil
2. Toca el botón "Compartir"
3. Selecciona "Añadir a pantalla de inicio"
4. La app se instalará como PWA

## 🌐 URLs disponibles

- **Página principal**: http://localhost:3001
- **Unidad 207**: http://localhost:3001/unit-207-static.html
- **Manifest**: http://localhost:3001/manifest.json

## ✨ Funcionalidades

- ✅ PWA (Progressive Web App)
- ✅ Modo offline
- ✅ Galería de imágenes
- ✅ Información detallada
- ✅ Botones de contacto
- ✅ Diseño responsive
- ✅ Modo oscuro
- ✅ Animaciones suaves

## 📊 Características de la unidad

- **Tipología**: 2D2B
- **Superficie**: 65 m²
- **Precio**: $850.000/mes
- **Comisión**: 0%
- **Ubicación**: Av. Amengual 1234, Providencia
EOF

echo "✅ ¡Build estático completado!"
echo ""
echo "📁 Archivos generados en: ./static-build/"
echo ""
echo "🚀 Para ejecutar:"
echo "   cd static-build"
echo "   npm install"
echo "   npm start"
echo ""
echo "📱 Para probar en móvil:"
echo "   http://localhost:3001/unit-207-static.html"
echo ""
echo "✨ La página incluye:"
echo "   - PWA (instalable en móvil)"
echo "   - Modo offline"
echo "   - Todas las funcionalidades del PropertyClientV3"
echo "   - Diseño responsive optimizado para móvil"
