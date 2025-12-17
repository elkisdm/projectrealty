# Property Page V3 - Arquitectura Completa

## 🎯 Objetivo Principal
Convertir la **Property Page móvil** en una **máquina de agendar visitas** (y WhatsApp), manteniendo **estética premium** y **carga ultrarrápida**.

## 📊 KPIs Críticos
- **CVR visita** (tap CTA/visitas / sesiones): ↑
- **CTR WhatsApp**: ↑
- **LCP < 2.5s**, **INP < 200ms**, **CLS < 0.1**
- **Tiempo en página** (por comuna): ↑

## 🏗️ Arquitectura de la Página (Mobile-First)

### 1. **Hero + Precio + Badge**
- Foto hero full-bleed (1/1.2 ratio), **badge "0% comisión"** superpuesto
- Título corto (tipología + comuna): "2D en Estación Central"
- **Precio total/mes** (arriendo + GC) visible al primer scroll
- Micro-trust: "Respaldado por Assetplan"

### 2. **CTA Sticky (persistente)**
- Barra inferior fija (siempre visible): **[ Agendar visita ]** | **WhatsApp**
- En desktop aparece fija a la derecha; en mobile es bottom bar

### 3. **Galería Pro (Airbnb-like)**
- Carrusel con thumbs; **fullscreen modal** con swipe
- Indicador de cantidad (12 fotos)

### 4. **Resumen Clave (scan-friendly)**
- **Chips**: 2D · 1B · 48m² · Pet-friendly · Estac
- "Costos totales": desglose simple (Arriendo, GC, Depósito — si aplica)

### 5. **Amenidades & Edificio**
- Lista de amenities con iconos (Lucide)
- **"Este depto es parte del Edificio X"** (card con foto y link a Building Page)

### 6. **Preevaluación Express (CRO)**
- **Stepper mínimo (3 campos)**: RUT, sueldo líquido, fecha de mudanza
- Resultado instantáneo: **Preaprobado / Revisión / No califica**
- Si "Preaprobado" ⇒ abre **Agenda**

### 7. **Agenda de visitas**
- Selector de **slots** (hoy/mañana/fin de semana)
- Confirmación + instrucciones + add-to-calendar

### 8. **Propiedades relacionadas**
- 4 mini-cards (mismo edificio o comuna)

### 9. **"Cómo es vivir en [Comuna]"**
- Foto barrial + **4 highlights** (conectividad, servicios, vida urbana, áreas verdes)
- Mapa ligero (mock) con 3 pins (Metro, plaza, universidad)
- **Testimonio** breve + CTA contextual: "Ver más en Estación Central"

### 10. **FAQ corto + Legal**
- 3 preguntas ("¿Qué documentos…?", "Mascotas…?", "Tiempos…")
- Enlaces legales (contrato, privacidad)

## 🎨 Lenguaje Visual (Tokens y Patrones)

### Tipografía
- Headings: **Inter** 700
- Body: **Inter** 400/500
- Escala móvil: H1 24/28, H2 20/26, Body 16/24, Caption 13/20

### Color (Dark + Glass)
- Base: `#0B0F14` (bg), `#121821` (cards)
- Texto: `#E6EDF6` (primario), `#94A3B8` (sec)
- Acento (CTA): **Aqua** `#22D3EE`
- Éxito: `#10B981` | Alerta: `#F59E0B`
- Badges neutrales: `#1F2937`

### Espaciado & Radio
- Grid 8px; secciones 16–24px
- Radius **16px** (cards), **24px** (modals)
- Sombra suave: `shadow-lg/20` (Vercel-like)

### Iconos
- **Lucide** (línea media), tamaño 18–20px en chips

### Fotografía
- Wide, luz natural, 1:1.2
- **Primera foto siempre "wow"** (living o vista)

## ⚡ Micro-interacciones (Conversión + Calma)
- **Fade-in + stagger** en chips y amenidades; 200ms, **respeta `prefers-reduced-motion`**
- **Hover/Press states** claros en CTA
- **Skeletons** (galería y related) para evitar "saltos"
- **Auto-scroll** suave al abrir Agenda desde Preaprobación

## ♿ Accesibilidad
- Roles y `aria-label` en secciones; foco visible
- Alt descriptivo en cada imagen
- Hit-area mínima 44px; contraste AA+ en CTA
- Evitar texto en imágenes (usa badges reales)

## 🚀 Performance (QuintoAndar-Style)
- **Next/Image**: hero con `priority`, `sizes="100vw"`; lazy para el resto
- **RSC + ISR** en Property y Building
- **Virtualización** en carousels/relacionadas
- **Preload** de fuente Inter (subset) y del primer CTA
- **Lighthouse CI** con umbrales (bloquea PR si falla)

## 📝 Copywriting (Claro, Humano, Conversión)
- **Título:** "2D luminoso en Estación Central"
- **Sub:** "Conectado, pet-friendly y a minutos del Metro"
- **CTA:** "Agendar visita" / "Hablar por WhatsApp"
- **Costos:** "Total estimado / mes (arriendo + GG.CC.)"
- **Preaprobación:** "Dinos tu RUT e ingreso y te preaprobamos en 30s"

## 🔍 SEO Programático
- **URL:** `/propiedad/estacion-central/2d-48m2-XXXX`
- **JSON-LD:** `Offer` + `Apartment` + `Place` (comuna)
- **Title/Meta:** "Arriendo 2D en Estación Central – 0% comisión | [Marca]"
- **OG image:** foto hero optimizada
- **Sitemap** por comuna/edificio/tipología

## 📊 Métricas (Instrumentación Mínima)
- `track('property_view', {id, commune})`
- `track('cta_book_click')` / `track('cta_whatsapp_click')`
- `track('preapproval_submit', {status})`
- `track('visit_confirmed')`
- `track('commune_section_view')`
