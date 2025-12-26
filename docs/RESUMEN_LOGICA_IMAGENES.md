# 📋 Resumen Ejecutivo: Lógica de Imágenes

**Resumen rápido de cómo funcionan las imágenes en el proyecto.**

---

## 🎯 Concepto Principal

**Las imágenes de tipología se reutilizan para todas las unidades del mismo número de habitaciones.**

- Una imagen de `1D/` se usa para **todas** las unidades 1D1B del edificio
- Una imagen de `2D/` se usa para **todas** las unidades 2D1B o 2D2B del edificio
- No se duplican imágenes por unidad individual

---

## 📁 Estructura de Carpetas

```
Imagenes/
└── [Nombre del edificio]/
    ├── Edificio/     → Imágenes del edificio (áreas comunes, fachada)
    ├── Estudio/      → Imágenes de tipología Estudio
    ├── 1D/           → Imágenes de tipología 1D1B
    ├── 2D/           → Imágenes de tipología 2D1B o 2D2B
    └── 3D/           → Imágenes de tipología 3D2B
```

---

## 🗄️ Base de Datos

### Tabla `buildings`
- `gallery`: Array de URLs de imágenes del edificio
- `cover_image`: Primera imagen de `gallery` (portada)

### Tabla `units`
- `images_tipologia`: Array de URLs de imágenes de la tipología (heredadas)
- `images`: Array opcional de imágenes específicas de la unidad (raro)
- `images_areas_comunes`: Array opcional de imágenes de áreas comunes (opcional)

---

## 🖼️ Visualización en Página de Propiedad

La galería muestra:
```
[Imágenes de Tipología] + [Imágenes del Edificio]
```

**Orden de prioridad:**
1. `unit.images` (si existe, raro)
2. `unit.images_tipologia` ⭐ **PRINCIPAL**
3. `unit.images_areas_comunes` (opcional)
4. `building.gallery` (áreas comunes del edificio)

---

## 🚀 Cómo Subir Imágenes

### Paso 1: Organizar Imágenes
Organiza tus imágenes según la estructura de carpetas arriba.

### Paso 2: Ejecutar Script
```bash
node scripts/upload-building-images.mjs "/ruta/a/Imagenes/Nombre Edificio"
```

### Paso 3: Verificar
El script actualiza automáticamente:
- ✅ `buildings.gallery` y `cover_image`
- ✅ `units.images_tipologia` para todas las unidades de cada tipología

---

## 📚 Documentación Completa

- **Lógica detallada:** `docs/LOGICA_BD_IMAGENES.md`
- **Guía de upload:** `docs/GUIA_RAPIDA_IMAGENES.md`
- **Script:** `scripts/upload-building-images.mjs`

---

**Última actualización:** Enero 2025
