---
title: SEO Metadata Implementation
objective: Implementar metadata, canonical URLs y Open Graph tags en rutas principales
area: [seo]
routes: [/], [/landing], [/coming-soon], [/property/[slug]]
acceptance:
  - [ ] AC1: Metadata base implementada
  - [ ] AC2: Canonical URLs configuradas
  - [ ] AC3: Open Graph tags optimizados
  - [ ] AC4: Twitter Cards implementadas
  - [ ] AC5: JSON-LD estructurado
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/ARQUITECTURA.md, /docs/DECISIONES.md]
---

# SEO Metadata Implementation

## 🎯 Objetivo
Implementar un sistema completo de SEO metadata incluyendo canonical URLs, Open Graph tags, Twitter Cards y JSON-LD estructurado para mejorar el posicionamiento en buscadores y la experiencia de compartir en redes sociales.

## 📋 Criterios de Aceptación

### AC1: Metadata Base Implementada
- [ ] Metadata dinámica en todas las rutas especificadas
- [ ] Títulos optimizados con template consistente
- [ ] Descripciones únicas y relevantes por página
- [ ] Robots meta tags apropiados

### AC2: Canonical URLs Configuradas
- [ ] URLs canónicas en todas las páginas
- [ ] URLs absolutas usando getBaseUrl()
- [ ] Manejo correcto de parámetros de consulta
- [ ] Prevención de contenido duplicado

### AC3: Open Graph Tags Optimizados
- [ ] OG title, description y URL en todas las páginas
- [ ] OG images apropiadas por página
- [ ] OG type configurado correctamente
- [ ] OG site_name consistente

### AC4: Twitter Cards Implementadas
- [ ] Twitter card type configurado
- [ ] Twitter title y description
- [ ] Twitter images optimizadas
- [ ] Twitter creator y site cuando aplique

### AC5: JSON-LD Estructurado
- [ ] Schema.org markup para propiedades
- [ ] Organization schema para sitio principal
- [ ] BreadcrumbList para navegación
- [ ] Validación y escape seguro de JSON-LD

## 🔧 Implementación

### Archivos a modificar
- `app/layout.tsx` - Metadata base y template
- `app/page.tsx` - Metadata para página raíz
- `app/(marketing)/landing/metadata.ts` - Optimizar metadata existente
- `app/coming-soon/metadata.ts` - Optimizar metadata existente
- `app/(catalog)/property/[slug]/page.tsx` - Mejorar generateMetadata

### Archivos a crear
- `lib/seo/metadata.ts` - Utilidades de metadata
- `lib/seo/schemas.ts` - Schemas JSON-LD centralizados

### Dependencias
- Ninguna nueva
- Usar utilidades existentes: `@lib/site`, `@lib/seo/jsonld`

## ✅ Checklist

### Funcional
- [ ] AC1 implementado
- [ ] AC2 implementado
- [ ] AC3 implementado
- [ ] AC4 implementado
- [ ] AC5 implementado

### Calidad
- [ ] Tests pasando
- [ ] TypeScript sin errores
- [ ] Lint sin warnings

### A11y
- [ ] Metadata no interfiere con screen readers
- [ ] Títulos descriptivos y únicos
- [ ] Descripciones accesibles

### Performance
- [ ] Metadata no impacta LCP
- [ ] JSON-LD optimizado
- [ ] Images optimizadas para OG

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅
- [ ] SEO check ✅
- [ ] Robots check ✅
- [ ] Root check ✅

## 📚 Referencias
- [/docs/ARQUITECTURA.md]
- [/docs/DECISIONES.md]
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)

## ⚠️ Riesgos
- **Duplicación de metadata**: Mitigación con utilidades centralizadas
- **URLs canónicas incorrectas**: Mitigación con getBaseUrl() y validación
- **JSON-LD inválido**: Mitigación con safeJsonLd() y validación
- **Performance impact**: Mitigación con metadata estática donde sea posible

## 🎯 Estimación
- **Tiempo:** ≤3h
- **Complejidad:** Media

## 📝 Notas de Implementación

### Estructura de Metadata por Ruta

#### `/` (Home)
```typescript
{
  title: "Hommie · 0% Comisión",
  description: "Arrienda departamentos con 0% de comisión. Compara, agenda visita y arrienda fácil.",
  alternates: { canonical: baseUrl },
  openGraph: { /* ... */ },
  twitter: { /* ... */ }
}
```

#### `/landing`
```typescript
{
  title: "Arrienda con 0% comisión",
  description: "Explora edificios disponibles, filtra por comuna y tipología, y agenda tu visita sin pagar comisión.",
  alternates: { canonical: `${baseUrl}/landing` },
  openGraph: { /* ... */ },
  twitter: { /* ... */ }
}
```

#### `/coming-soon`
```typescript
{
  title: "Próximamente - Hommie",
  description: "Estamos preparando la nueva experiencia de arriendo 0% comisión. Sin letra chica.",
  alternates: { canonical: `${baseUrl}/coming-soon` },
  robots: { index: false, follow: false },
  openGraph: { /* ... */ },
  twitter: { /* ... */ }
}
```

#### `/property/[slug]`
```typescript
{
  title: `${building.name} - 0% Comisión | Hommie`,
  description: `Arrienda ${building.name} en ${building.comuna} sin comisión de corretaje.`,
  alternates: { canonical: `${baseUrl}/property/${slug}` },
  openGraph: { /* ... */ },
  twitter: { /* ... */ },
  // JSON-LD incluido en el componente
}
```

### Utilidades a Crear

#### `lib/seo/metadata.ts`
- `generateBaseMetadata()` - Metadata base reutilizable
- `generateOpenGraph()` - OG tags consistentes
- `generateTwitterCard()` - Twitter Cards consistentes
- `generateCanonicalUrl()` - URLs canónicas

#### `lib/seo/schemas.ts`
- `generateOrganizationSchema()` - Schema para la empresa
- `generateBreadcrumbSchema()` - Schema para navegación
- `generatePropertySchema()` - Schema para propiedades
- `generateWebsiteSchema()` - Schema para el sitio web
