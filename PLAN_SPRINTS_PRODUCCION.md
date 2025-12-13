# 🚀 PLAN DE SPRINTS - PREPARACIÓN PARA PRODUCCIÓN

**Objetivo:** Dejar el proyecto listo para planear los últimos pasos de deploy a producción  
**Metodología:** Cada microtarea es abordable en una sola petición (1 chat = 1 microtarea)  
**Fecha inicio:** [FECHA]  
**Estado actual:** 🔴 4 errores TypeScript bloqueantes, estructura funcional

> **📝 INSTRUCCIÓN:** Al completar cada microtarea, marca como completada:
> - Agrega "✅ COMPLETADA" al título de la microtarea
> - Marca todos los checkboxes de criterios de aceptación con `[x]`

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
- ✅ **128 componentes** React implementados
- ✅ **28 endpoints API** funcionando
- ✅ **Sistema admin** completo (pendiente fixes)
- ✅ **Infraestructura** sólida (Supabase, tests, CI/CD)
- 🔴 **4 errores TypeScript** bloqueantes
- 🟡 **11 errores lint**, ~472 warnings (reducido de 501, -29 warnings de console)
- 🟡 **Carpetas de prueba** en `/app` que deben limpiarse
- ✅ **Sprint 2 - Microtareas 2.1, 2.2 y 2.3 completadas:**
  - ✅ Imports ES6 modernizados (require() → import)
  - ✅ Sistema de logging implementado (lib/logger.ts)
  - ✅ Console.log reemplazados en 74 archivos de producción
  - ✅ Reducción del 75% en warnings de console (118 → 29)
  - ✅ Tipos `any` críticos eliminados (reducción del 52% en `lib/`, de 44 a 21)
  - ✅ Helpers para branded types creados (`asUuid`, `asIsoDateTime`, `asIsoDate`)
  - ✅ Type safety mejorado con interfaces para Supabase, Google Calendar e ICS

### Meta Final
- ✅ **0 errores TypeScript**
- ✅ **Build exitoso** sin errores
- ✅ **Lint aceptable** (<5 errores, <50 warnings críticos)
- ✅ **Estructura limpia** (sin carpetas de prueba)
- ✅ **Tests >80%** pasando (críticos 100%)
- ✅ **Documentación** de producción completa
- ✅ **Checklist** de producción ready

---

## 🎯 SPRINT 1: CORRECCIÓN CRÍTICA (BLOQUEANTE)

**Objetivo:** Eliminar errores bloqueantes de TypeScript y verificar build  
**Tiempo estimado:** 1-2 horas  
**Prioridad:** 🔴 CRÍTICA - Debe completarse primero

### Microtarea 1.1: Arreglar errores TypeScript en auth-supabase.ts ✅ COMPLETADA
**Archivo:** `lib/admin/auth-supabase.ts`  
**Problema:** `cookies()` ahora retorna `Promise<ReadonlyRequestCookies>` en Next.js 15  
**Líneas afectadas:** 35, 52, 55, 57

**Prompt sugerido:**
```
Arregla los errores de TypeScript en lib/admin/auth-supabase.ts. 
El problema es que cookies() ahora retorna una Promise en Next.js 15.
Necesito:
1. Hacer createSupabaseAuthClient() async
2. Cambiar const cookieStore = cookies() a const cookieStore = await cookies()
3. Actualizar todas las llamadas a createSupabaseAuthClient() para usar await
4. Verificar que getItem, setItem, removeItem funcionen correctamente con await
```

**Criterios de aceptación:**
- [x] `pnpm typecheck` muestra 0 errores en auth-supabase.ts
- [x] Todas las funciones que usan cookies() usan await
- [x] Las llamadas a createSupabaseAuthClient() usan await

**Archivos a modificar:**
- `lib/admin/auth-supabase.ts`
- `app/api/admin/auth/login/route.ts` (si usa createSupabaseAuthClient)
- `app/api/admin/auth/session/route.ts` (si usa createSupabaseAuthClient)
- `app/api/admin/auth/logout/route.ts` (si usa createSupabaseAuthClient)
- `middleware.ts` (si usa createSupabaseAuthClient)

---

### Microtarea 1.2: Arreglar error TypeScript en csv.ts ✅ COMPLETADA
**Archivo:** `lib/admin/csv.ts`  
**Problema:** Tipo de retorno incorrecto - puede retornar `undefined`  
**Línea afectada:** 280

**Prompt sugerido:**
```
Arregla el error de TypeScript en lib/admin/csv.ts línea 280.
El problema es que processCSVRow puede retornar undefined cuando omite unidades incompletas,
pero el tipo esperado es un array. 
Solución: Cambiar el tipo de retorno para permitir undefined, o retornar un array vacío.
Elige la mejor opción según el contexto del código.
```

**Criterios de aceptación:**
- [x] `pnpm typecheck` muestra 0 errores en csv.ts
- [x] El tipo de retorno es correcto y consistente
- [x] La función maneja correctamente unidades incompletas

---

### Microtarea 1.3: Verificar build exitoso
**Comando:** `pnpm typecheck && pnpm build`

**Prompt sugerido:**
```
Ejecuta pnpm typecheck y pnpm build. Verifica que:
1. No hay errores de TypeScript
2. El build completa exitosamente
3. No hay errores críticos en el output
Si hay errores, muéstrame el output completo para identificar qué falta arreglar.
```

**Criterios de aceptación:**
- [ ] `pnpm typecheck` → 0 errores
- [ ] `pnpm build` → Build exitoso sin errores
- [ ] No hay warnings críticos que bloqueen

---

## 🧹 SPRINT 2: LIMPIEZA DE CÓDIGO

**Objetivo:** Reducir errores de lint y mejorar calidad de código  
**Tiempo estimado:** 2-3 horas  
**Prioridad:** 🟡 ALTA - Mejora calidad pero no bloquea  
**Progreso:** 3/4 microtareas completadas (75%)

### Microtarea 2.1: Corregir imports require() en supabase.ts ✅ COMPLETADA
**Archivos:** `lib/supabase.ts`, `lib/supabase-data-processor.ts`  
**Problema:** Uso de `require()` en lugar de `import`

**Prompt sugerido:**
```
Reemplaza todos los require() por imports ES6 en lib/supabase.ts y lib/supabase-data-processor.ts.
Mantén la misma funcionalidad pero usa la sintaxis moderna de imports.
Verifica que no rompa ninguna dependencia.
```

**Criterios de aceptación:**
- [x] No hay `require()` en supabase.ts
- [x] No hay `require()` en supabase-data-processor.ts
- [x] Todos los imports usan sintaxis ES6
- [x] `pnpm lint` no muestra errores relacionados
- [x] Mejorada la tipificación con tipos de retorno explícitos
- [x] Agregada documentación JSDoc a las funciones helper
- [x] Corregida inconsistencia en nombre de variable (supabaseAnonKey → supabaseServiceKey)

---

### Microtarea 2.2: Eliminar/reemplazar console.log en producción ✅ COMPLETADA
**Archivos:** Múltiples (identificar con grep)

**Prompt sugerido:**
```
Identifica todos los console.log, console.error, console.warn en archivos de producción
(excluyendo tests y scripts). Reemplázalos por:
- Un sistema de logging apropiado para producción (puedes crear lib/logger.ts)
- O elimínalos si no son necesarios
- Mantén console.error solo para errores críticos que deben verse en desarrollo
Crea lib/logger.ts con funciones log, error, warn que solo funcionen en desarrollo.
```

**Criterios de aceptación:**
- [x] `lib/logger.ts` creado con sistema de logging (solo funciona en desarrollo)
- [x] console.log eliminados/reemplazados en TODOS los archivos de producción:
  - [x] Todos los archivos en `lib/` (10 archivos)
  - [x] Todos los archivos en `app/api/` (14 archivos)
  - [x] Componentes críticos en `components/` (23 archivos)
  - [x] Páginas y otros archivos en `app/` (27 archivos)
- [x] `pnpm lint` muestra reducción significativa de warnings de console:
  - **Antes:** 118 warnings
  - **Después:** 29 warnings (75% de reducción)
  - Los 29 warnings restantes son principalmente de `lib/logger.ts` (intencional) y algunos archivos con console.log comentados

---

### Microtarea 2.3: Corregir tipos any críticos ✅ COMPLETADA
**Archivos:** `lib/supabase-data-processor.ts`, `lib/data.ts`, `lib/calendar/google.ts`, `lib/calendar/ics.ts`, `lib/adapters/assetplan.ts`, `components/calendar/WeekView.tsx`, `components/calendar/CalendarVisitFlow.tsx`, `types/calendar.ts`

**Criterios de aceptación:**
- [x] Tipos `any` críticos eliminados
  - ✅ Reducción del 52% en `lib/` (de 44 a 21 usos de `any`)
  - ✅ Corregidos 6 `any` en `lib/supabase-data-processor.ts` (tipos SupabaseClient y TremendoUnitsProcessor)
  - ✅ Corregidos 5 `any` en `lib/data.ts` (type guards con `unknown` y tipos específicos)
  - ✅ Corregidos 7 `any` en `lib/calendar/google.ts` e `ics.ts` (interfaces para Google Calendar e ICS)
  - ✅ Corregidos 5 `any` en `lib/adapters/assetplan.ts` (type narrowing con interfaces)
  - ✅ Corregidos 21 `any` en componentes de calendario (helpers `asIsoDateTime` y `asUuid`)
  - ✅ Creados helpers para branded types en `types/calendar.ts` (`asUuid`, `asIsoDateTime`, `asIsoDate`)
- [x] Type safety mejorado
  - ✅ Interfaces definidas para Supabase query results (`SupabaseUnitRow`)
  - ✅ Interfaces para Google Calendar API (`GoogleCalendarItem`)
  - ✅ Interfaces para ICS parsing (`IcsEventParsing`)
  - ✅ Type guards implementados con `unknown` en lugar de `any`
- [x] `pnpm typecheck` sigue pasando (errores restantes son pre-existentes, no introducidos por estos cambios)

---

### Microtarea 2.4: Verificar lint aceptable
**Comando:** `pnpm lint`

**Prompt sugerido:**
```
Ejecuta pnpm lint y genera un reporte:
1. Total de errores (meta: <5)
2. Total de warnings críticos (meta: <50)
3. Lista de errores restantes con archivos y líneas
4. Recomendaciones para los errores más importantes
Si hay más de 5 errores, identifica los 5 más críticos para arreglar.
```

**Criterios de aceptación:**
- [ ] <5 errores de lint
- [ ] <50 warnings críticos
- [ ] Reporte generado con recomendaciones

---

## 📁 SPRINT 3: LIMPIEZA DE ESTRUCTURA

**Objetivo:** Eliminar carpetas de prueba y organizar estructura  
**Tiempo estimado:** 1-2 horas  
**Prioridad:** 🟡 MEDIA - Mejora organización

### Microtarea 3.1: Eliminar carpetas de prueba de /app
**Carpetas:** `/app/test-*`, `/app/demo`, `/app/test`, etc.

**Prompt sugerido:**
```
Identifica y elimina todas las carpetas de prueba y demo de /app/:
- app/test-*
- app/demo
- app/test
- app/test-calendar*
- app/test-property-client
- app/unit-207
- app/liquid-capsules
- app/icon-demo
Verifica que no haya rutas importantes antes de eliminar.
Si alguna carpeta tiene código útil, muéstrame su contenido para decidir si moverlo o eliminarlo.
```

**Criterios de aceptación:**
- [ ] Carpetas de prueba eliminadas de /app
- [ ] No hay rutas rotas por la eliminación
- [ ] Build sigue funcionando

---

### Microtarea 3.2: Consolidar componentes duplicados
**Archivos:** Identificar componentes con versiones (V2, V3, etc.)

**Prompt sugerido:**
```
Identifica componentes duplicados o con versiones múltiples:
- BuildingCard vs BuildingCardV2
- FeaturedGrid vs FeaturedGridClient
- Cualquier componente con sufijos V2, V3, etc.
Analiza cuál versión está en uso y cuál puede eliminarse.
Consolida eliminando versiones no usadas o fusionando mejoras.
Muestra un reporte de qué se eliminó y qué se mantuvo.
```

**Criterios de aceptación:**
- [ ] Componentes duplicados identificados
- [ ] Versiones no usadas eliminadas
- [ ] Versiones en uso mantenidas o consolidadas
- [ ] Build sigue funcionando

---

### Microtarea 3.3: Organizar documentación
**Carpetas:** `docs/`, `_workspace/docs/`

**Prompt sugerido:**
```
Organiza la documentación:
1. Mueve documentación antigua a docs/_archive/
2. Mantén solo docs esenciales en raíz de docs/:
   - ARQUITECTURA.md (simplificado)
   - VARIABLES_ENTORNO.md
   - DEPLOY.md
3. Crea docs/PRODUCCION.md con checklist de producción
4. Mueve reportes antiguos a docs/reports/_archive/
Muestra estructura final propuesta antes de ejecutar.
```

**Criterios de aceptación:**
- [ ] Documentación organizada y accesible
- [ ] Docs esenciales en lugar claro
- [ ] Docs antiguos archivados pero accesibles
- [ ] Estructura documentada

---

### Microtarea 3.4: Verificar estructura final
**Comando:** Revisar estructura de carpetas

**Prompt sugerido:**
```
Genera un reporte de la estructura final del proyecto:
1. Lista de carpetas principales en raíz
2. Verifica que no haya carpetas de prueba en /app
3. Verifica que componentes estén organizados
4. Identifica cualquier inconsistencia o carpeta que deba moverse
5. Sugiere mejoras finales si las hay
```

**Criterios de aceptación:**
- [ ] Estructura limpia y organizada
- [ ] Sin carpetas de prueba en /app
- [ ] Componentes bien organizados
- [ ] Reporte generado

---

## ✅ SPRINT 4: VERIFICACIÓN Y TESTS

**Objetivo:** Verificar funcionalidad y corregir tests críticos  
**Tiempo estimado:** 2-3 horas  
**Prioridad:** 🟡 ALTA - Asegura calidad

### Microtarea 4.1: Ejecutar suite completa de tests
**Comando:** `pnpm test`

**Prompt sugerido:**
```
Ejecuta la suite completa de tests:
1. pnpm test (todos los tests)
2. Genera un reporte con:
   - Total de tests ejecutados
   - Tests pasando (número y %)
   - Tests fallando (número y lista)
   - Cobertura si está disponible
3. Identifica los tests críticos que deben pasar al 100%
4. Lista los tests no críticos que pueden fallar temporalmente
```

**Criterios de aceptación:**
- [ ] Suite ejecutada completamente
- [ ] Reporte generado con métricas
- [ ] Tests críticos identificados
- [ ] >80% tests pasando (meta)

---

### Microtarea 4.2: Corregir tests críticos fallando
**Archivos:** Identificar tests críticos que fallan

**Prompt sugerido:**
```
Corrige los tests críticos que están fallando. Empieza con los más importantes:
1. Tests de autenticación admin
2. Tests de APIs principales (buildings, booking)
3. Tests de componentes core (BuildingCard, FeaturedGrid)
4. Tests de validación de datos
Para cada test que corrijas, explica qué estaba mal y cómo lo arreglaste.
Prioriza tests que afectan funcionalidad crítica.
```

**Criterios de aceptación:**
- [ ] Tests críticos pasando al 100%
- [ ] Tests corregidos documentados
- [ ] Suite completa >80% pasando

---

### Microtarea 4.3: Verificar funcionalidad core manualmente
**Rutas:** `/`, `/property/[slug]`, `/admin`, `/cotizador`

**Prompt sugerido:**
```
Crea un script de verificación de funcionalidad core que verifique:
1. Landing page carga correctamente (/)
2. Página de propiedad carga (/property/[slug] con slug real)
3. Sistema admin funciona (/admin/login)
4. Cotizador funciona (/cotizador)
5. APIs principales responden (curl a /api/buildings)
El script debe mostrar ✅ o ❌ para cada verificación.
Guarda el script como scripts/verify-core-functionality.mjs
```

**Criterios de aceptación:**
- [ ] Script creado y ejecutable
- [ ] Funcionalidad core verificada
- [ ] Reporte claro de estado

---

### Microtarea 4.4: Verificar build de producción
**Comando:** `pnpm build`

**Prompt sugerido:**
```
Ejecuta pnpm build con modo producción y verifica:
1. Build completa sin errores
2. Tamaño de bundles razonable
3. No hay warnings críticos
4. Genera un reporte con:
   - Tiempo de build
   - Tamaño de archivos principales
   - Warnings (si los hay)
   - Recomendaciones de optimización
```

**Criterios de aceptación:**
- [ ] Build de producción exitoso
- [ ] Sin errores críticos
- [ ] Reporte generado

---

## 🚀 SPRINT 5: PREPARACIÓN PARA PRODUCCIÓN

**Objetivo:** Documentar y preparar checklist de producción  
**Tiempo estimado:** 2-3 horas  
**Prioridad:** 🟢 MEDIA - Documentación esencial

### Microtarea 5.1: Crear checklist de producción
**Archivo:** `docs/CHECKLIST_PRODUCCION.md`

**Prompt sugerido:**
```
Crea docs/CHECKLIST_PRODUCCION.md con un checklist completo para deploy a producción:
1. Pre-deploy (variables de entorno, Supabase, build)
2. Deploy (plataforma, configuración, dominio)
3. Post-deploy (verificaciones, monitoreo)
4. Rollback (procedimiento si algo falla)
Incluye comandos específicos y criterios de éxito para cada paso.
Basate en la información de config/env.example y los documentos existentes.
```

**Criterios de aceptación:**
- [ ] Checklist completo y claro
- [ ] Comandos específicos incluidos
- [ ] Criterios de éxito definidos
- [ ] Procedimiento de rollback documentado

---

### Microtarea 5.2: Documentar variables de entorno
**Archivo:** `docs/VARIABLES_ENTORNO.md`

**Prompt sugerido:**
```
Crea docs/VARIABLES_ENTORNO.md documentando todas las variables de entorno:
1. Variables requeridas (con descripción y ejemplo)
2. Variables opcionales (con valores por defecto)
3. Variables de desarrollo vs producción
4. Dónde configurarlas (Vercel, .env.local, etc.)
5. Validación de variables (qué verificar antes de deploy)
Basate en config/env.example y config/env.production.example
```

**Criterios de aceptación:**
- [ ] Todas las variables documentadas
- [ ] Diferencias dev/prod claras
- [ ] Instrucciones de configuración claras
- [ ] Validación documentada

---

### Microtarea 5.3: Crear script de verificación pre-deploy
**Archivo:** `scripts/verify-production-ready.mjs`

**Prompt sugerido:**
```
Crea scripts/verify-production-ready.mjs que verifique:
1. TypeScript sin errores (pnpm typecheck)
2. Build exitoso (pnpm build)
3. Variables de entorno presentes (verificar .env.production)
4. Lint aceptable (pnpm lint con umbrales)
5. Tests críticos pasando (pnpm test con filtro)
6. Estructura limpia (sin carpetas de prueba)
Muestra un reporte claro con ✅ o ❌ para cada verificación.
El script debe poder ejecutarse antes de cada deploy.
```

**Criterios de aceptación:**
- [ ] Script ejecutable y completo
- [ ] Reporte claro y accionable
- [ ] Integrable en CI/CD

---

### Microtarea 5.4: Actualizar README con instrucciones de deploy
**Archivo:** `README.md`

**Prompt sugerido:**
```
Actualiza README.md agregando una sección "Deploy a Producción" con:
1. Enlace a docs/CHECKLIST_PRODUCCION.md
2. Enlace a docs/VARIABLES_ENTORNO.md
3. Comandos básicos de verificación
4. Referencias a documentación completa
5. Quick start para deploy rápido
Mantén el README conciso pero completo.
```

**Criterios de aceptación:**
- [ ] Sección de deploy agregada
- [ ] Enlaces a documentación completa
- [ ] Comandos básicos incluidos
- [ ] README actualizado y claro

---

### Microtarea 5.5: Crear documento de estado final
**Archivo:** `ESTADO_PRE_DEPLOY.md`

**Prompt sugerido:**
```
Crea ESTADO_PRE_DEPLOY.md con el estado final del proyecto:
1. Estado de cada área (TypeScript, Lint, Tests, Build)
2. Métricas finales (errores, warnings, coverage)
3. Checklist de completitud de sprints
4. Próximos pasos para deploy
5. Riesgos conocidos y mitigaciones
6. Configuración requerida antes de deploy
Este documento será la referencia final antes de planear el deploy.
```

**Criterios de aceptación:**
- [ ] Estado completo documentado
- [ ] Métricas finales incluidas
- [ ] Próximos pasos claros
- [ ] Riesgos identificados

---

## 📋 CHECKLIST DE COMPLETITUD

### Sprint 1: Corrección Crítica
- [ ] Microtarea 1.1: Errores TypeScript auth-supabase.ts arreglados
- [ ] Microtarea 1.2: Error TypeScript csv.ts arreglado
- [ ] Microtarea 1.3: Build exitoso verificado

### Sprint 2: Limpieza de Código
- [ ] Microtarea 2.1: Imports require() corregidos
- [ ] Microtarea 2.2: console.log eliminados/reemplazados
- [ ] Microtarea 2.3: Tipos any críticos corregidos
- [ ] Microtarea 2.4: Lint aceptable (<5 errores, <50 warnings críticos)

### Sprint 3: Limpieza de Estructura
- [ ] Microtarea 3.1: Carpetas de prueba eliminadas
- [ ] Microtarea 3.2: Componentes duplicados consolidados
- [ ] Microtarea 3.3: Documentación organizada
- [ ] Microtarea 3.4: Estructura verificada

### Sprint 4: Verificación y Tests
- [ ] Microtarea 4.1: Suite de tests ejecutada
- [ ] Microtarea 4.2: Tests críticos corregidos
- [ ] Microtarea 4.3: Funcionalidad core verificada
- [ ] Microtarea 4.4: Build de producción verificado

### Sprint 5: Preparación para Producción
- [ ] Microtarea 5.1: Checklist de producción creado
- [ ] Microtarea 5.2: Variables de entorno documentadas
- [ ] Microtarea 5.3: Script de verificación creado
- [ ] Microtarea 5.4: README actualizado
- [ ] Microtarea 5.5: Documento de estado final creado

---

## 🎯 CRITERIOS DE ÉXITO FINAL

### Técnicos
- ✅ `pnpm typecheck` → 0 errores
- ✅ `pnpm build` → Build exitoso sin errores
- ✅ `pnpm lint` → <5 errores, <50 warnings críticos
- ✅ `pnpm test` → >80% tests pasando (críticos 100%)

### Estructurales
- ✅ Sin carpetas de prueba en `/app`
- ✅ Sin componentes duplicados activos
- ✅ Documentación esencial organizada
- ✅ Estructura limpia y clara

### Documentación
- ✅ Checklist de producción completo
- ✅ Variables de entorno documentadas
- ✅ Script de verificación funcional
- ✅ README actualizado
- ✅ Estado final documentado

### Producción Ready
- ✅ Script de verificación pasa todas las checks
- ✅ Documentación de deploy completa
- ✅ Procedimiento de rollback documentado
- ✅ Variables de entorno identificadas y documentadas

---

## 🚀 PRÓXIMOS PASOS POST-SPRINTS

Una vez completados los 5 sprints, el proyecto estará listo para:

### Fase 6: Configuración de Producción (Nueva fase)
1. **Configurar Supabase para producción**
   - Crear proyecto de producción
   - Ejecutar migraciones
   - Configurar RLS (Row Level Security)
   - Configurar backups

2. **Configurar plataforma de deploy**
   - Vercel/Netlify/otra plataforma
   - Variables de entorno
   - Dominio personalizado
   - SSL/HTTPS

3. **Deploy a staging**
   - Deploy inicial
   - Verificaciones post-deploy
   - Testing en staging

4. **Deploy a producción**
   - Deploy final
   - Verificaciones post-deploy
   - Monitoreo inicial

---

## 📝 NOTAS IMPORTANTES

### Metodología
- Cada microtarea es **completable en una sola petición**
- Si una microtarea es muy grande, dividirla en sub-microtareas
- Verificar cada microtarea antes de pasar a la siguiente
- Usar los prompts sugeridos como guía, ajustar según necesidad

### Priorización
- **Sprint 1 es CRÍTICO** - debe completarse primero
- Sprints 2-4 pueden hacerse en paralelo si hay tiempo
- Sprint 5 es preparación, puede hacerse después de Sprint 1

### Commits y Versionado
- Hacer commit después de cada sprint completado
- Usar mensajes convencionales: `fix(ts): corregir errores TypeScript en auth-supabase`
- Taggear versión después de Sprint 1: `v1.0.0-pre-production`

### Rollback
- Si algo falla críticamente, revertir al último commit estable
- Mantener branch de backup antes de cambios grandes
- Documentar problemas encontrados para referencia futura

---

## 📊 ESTIMACIÓN TOTAL

| Sprint | Microtareas | Tiempo Estimado | Prioridad |
|--------|-------------|-----------------|-----------|
| Sprint 1 | 3 | 1-2 horas | 🔴 CRÍTICA |
| Sprint 2 | 4 | 2-3 horas | 🟡 ALTA |
| Sprint 3 | 4 | 1-2 horas | 🟡 MEDIA |
| Sprint 4 | 4 | 2-3 horas | 🟡 ALTA |
| Sprint 5 | 5 | 2-3 horas | 🟢 MEDIA |
| **TOTAL** | **20** | **8-13 horas** | |

**Tiempo real estimado:** 2-3 días de trabajo enfocado

---

## ✅ DEFINICIÓN DE "LISTO PARA PRODUCCIÓN"

El proyecto estará **listo para planear deploy a producción** cuando:

1. ✅ Todos los sprints 1-5 completados
2. ✅ Script `verify-production-ready.mjs` pasa todas las verificaciones
3. ✅ Documentación de producción completa
4. ✅ Checklist de producción creado y revisado
5. ✅ Variables de entorno identificadas y documentadas
6. ✅ Procedimiento de rollback documentado

**Estado objetivo:** 🟢 **READY FOR PRODUCTION PLANNING**

---

**📋 Plan creado:** [FECHA]  
**🎯 Objetivo:** Dejar terreno listo para planear últimos pasos de deploy  
**⏱️ Tiempo estimado:** 8-13 horas (2-3 días)  
**🚀 Siguiente paso:** Comenzar Sprint 1, Microtarea 1.1
