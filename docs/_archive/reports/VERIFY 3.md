# Smoke Test

- Fecha: 2025-08-20T01:59:53.119Z
- Sitio: https://tudominio.com

### Resumen
- **site**: https://tudominio.com
- **estado**: 7/16 PASS
- **home**: 1º=200, 2º=200, cache=no header
- **canonical home**: not found
- **sitemap**: urls=0, propiedades=0
- **muestra propiedad**: n/a
- **robots Allow /**: sí
- **coming soon redirect**: no
- **coming soon content**: no
- **coming soon noindex**: no
- **robots Disallow /**: sí

### Detalles
```json
{
  "site": "https://tudominio.com",
  "checks": [
    {
      "name": "home-200-first",
      "pass": true,
      "status": 200
    },
    {
      "name": "home-200-second",
      "pass": true,
      "status": 200
    },
    {
      "name": "home-cache-header",
      "pass": false,
      "detail": "no header"
    },
    {
      "name": "home-cache-hit",
      "pass": false,
      "detail": "no header"
    },
    {
      "name": "home-canonical",
      "pass": false,
      "detail": "not found"
    },
    {
      "name": "coming-soon-redirect",
      "pass": false,
      "status": 200,
      "detail": "no location header"
    },
    {
      "name": "coming-soon-200",
      "pass": true,
      "status": 200
    },
    {
      "name": "coming-soon-content",
      "pass": false,
      "detail": "missing coming soon text"
    },
    {
      "name": "coming-soon-noindex",
      "detail": "no robots meta"
    },
    {
      "name": "sitemap-200",
      "pass": true,
      "status": 200
    },
    {
      "name": "sitemap-has-home",
      "pass": false,
      "count": 0
    },
    {
      "name": "sitemap-has-property",
      "pass": false,
      "count": 0
    },
    {
      "name": "property-sample-skipped",
      "pass": false,
      "detail": "No hay URLs /property/ en sitemap"
    },
    {
      "name": "robots-200",
      "pass": true,
      "status": 200
    },
    {
      "name": "robots-allow-root",
      "pass": true,
      "detail": "Allow: /"
    },
    {
      "name": "robots-disallow-root",
      "pass": true,
      "detail": "Disallow: /"
    }
  ],
  "propertySample": {}
}
```