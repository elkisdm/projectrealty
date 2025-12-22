# ✅ CHECKLIST DIARIO - LANZAMIENTO EN 7 DÍAS

## 📅 DÍA 1: LIMPIEZA MASIVA

### Tareas
- [ ] **Backup antes de empezar**
  ```bash
  git add -A
  git commit -m "backup: antes de limpieza día 1"
  ```

- [ ] **Ejecutar script de limpieza**
  ```bash
  # Primero en modo dry-run
  bash scripts/cleanup-duplicates.sh --dry-run
  
  # Si todo se ve bien, ejecutar
  bash scripts/cleanup-duplicates.sh
  ```

- [ ] **Limpiar documentación**
  - [ ] Mover docs antiguos a `docs/_archive/`
  - [ ] Mantener solo: `README.md`, `docs/ARQUITECTURA.md`

- [ ] **Verificar que compila**
  ```bash
  pnpm build
  ```

**✅ Día 1 completado cuando:**
- [ ] No hay archivos duplicados
- [ ] Build exitoso
- [ ] Git commit hecho

---

## 📅 DÍA 2: SIMPLIFICAR SISTEMA DE DATOS

### Tareas
- [ ] **Auditar sistemas de datos**
  ```bash
  grep -r "USE_SUPABASE\|USE_MOCK" lib/ --include="*.ts"
  ```

- [ ] **Simplificar lib/data.ts**
  - [ ] Eliminar lógica de mocks
  - [ ] Usar solo Supabase
  - [ ] Mantener solo funciones esenciales:
    - [ ] `getAllBuildings()`
    - [ ] `getBuildingBySlug()`
    - [ ] `getRelatedBuildings()`

- [ ] **Verificar APIs**
  ```bash
  curl http://localhost:3000/api/buildings
  ```

**✅ Día 2 completado cuando:**
- [ ] Solo Supabase como fuente de datos
- [ ] APIs funcionan correctamente
- [ ] Build exitoso

---

## 📅 DÍA 3: SIMPLIFICAR ESTADO Y HOOKS

### Tareas
- [ ] **Decidir sistema de estado**
  - [ ] Opción A: Solo Zustand
  - [ ] Opción B: Solo React Query (RECOMENDADO)

- [ ] **Simplificar hooks**
  - [ ] Mantener: `useBuildingsData.ts`
  - [ ] Eliminar: `useBuildingsPagination.ts` (usar React Query)
  - [ ] Eliminar: `useVirtualGrid.ts`
  - [ ] Simplificar: `useAdvancedFilters.ts`

- [ ] **Eliminar store innecesario**
  - [ ] Si usamos React Query → eliminar Zustand
  - [ ] O viceversa

- [ ] **Verificar landing**
  ```bash
  pnpm dev
  # Abrir http://localhost:3000
  ```

**✅ Día 3 completado cuando:**
- [ ] Un solo sistema de estado
- [ ] Landing carga datos correctamente
- [ ] No hay errores en consola

---

## 📅 DÍA 4: SIMPLIFICAR COMPONENTES

### Tareas
- [ ] **Auditar componentes marketing**
  ```bash
  ls components/marketing/*.tsx | wc -l
  ```

- [ ] **Mantener solo esenciales**
  - [ ] `HeroV2.tsx`
  - [ ] `FeaturedGrid.tsx`
  - [ ] `BuildingCard.tsx` (una sola versión)
  - [ ] `StickyMobileCTA.tsx`

- [ ] **Simplificar FeaturedGrid**
  - [ ] Asegurar que lista propiedades
  - [ ] Eliminar lógica compleja innecesaria

- [ ] **Verificar funcionalidad**
  - [ ] Landing muestra propiedades
  - [ ] Cards son clickeables
  - [ ] Links llevan a detalle

**✅ Día 4 completado cuando:**
- [ ] Componentes esenciales funcionando
- [ ] Landing muestra propiedades
- [ ] Navegación funciona

---

## 📅 DÍA 5: FILTROS BÁSICOS Y NAVEGACIÓN

### Tareas
- [ ] **Implementar filtros básicos**
  - [ ] Filtro por comuna (dropdown)
  - [ ] Filtro por precio (rango)
  - [ ] Integrar con FeaturedGrid

- [ ] **Verificar navegación**
  - [ ] Home → Landing
  - [ ] Landing → Property Detail
  - [ ] Property Detail → WhatsApp

- [ ] **Testing manual**
  - [ ] Probar filtros
  - [ ] Probar navegación
  - [ ] Probar WhatsApp CTA

**✅ Día 5 completado cuando:**
- [ ] Filtros funcionan
- [ ] Navegación fluida
- [ ] WhatsApp CTA funciona

---

## 📅 DÍA 6: CORRECCIONES Y OPTIMIZACIONES

### Tareas
- [ ] **Corregir errores TypeScript**
  ```bash
  pnpm typecheck
  # Corregir errores críticos uno por uno
  ```

- [ ] **Optimizar imágenes**
  - [ ] Usar `next/image` en todos lados
  - [ ] Verificar tamaños

- [ ] **Verificar build producción**
  ```bash
  pnpm build
  pnpm start
  # Probar localmente
  ```

- [ ] **Testing final**
  - [ ] Landing carga correctamente
  - [ ] Propiedades se listan
  - [ ] Detalle funciona
  - [ ] Mobile responsive

**✅ Día 6 completado cuando:**
- [ ] TypeScript sin errores críticos
- [ ] Build exitoso
- [ ] App funciona en producción local

---

## 📅 DÍA 7: DEPLOY Y TESTING FINAL

### Tareas
- [ ] **Preparar variables de entorno**
  - [ ] Verificar `.env.production`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL`

- [ ] **Deploy a Vercel**
  - [ ] Conectar repo
  - [ ] Configurar variables
  - [ ] Deploy

- [ ] **Testing manual en producción**
  - [ ] Landing carga
  - [ ] Propiedades se listan
  - [ ] Filtros funcionan
  - [ ] Detalle funciona
  - [ ] WhatsApp CTA funciona
  - [ ] Mobile responsive

- [ ] **Fixes finales**
  - [ ] Corregir bugs encontrados
  - [ ] Ajustes UI menores

**✅ Día 7 completado cuando:**
- [ ] Deploy exitoso
- [ ] Testing completo
- [ ] **🚀 LANZAMIENTO COMPLETO**

---

## 🎯 META FINAL

### Funcionalidades MVP
- [x] Landing page con lista de propiedades
- [x] Página de detalle de propiedad
- [x] Filtros básicos (comuna, precio)
- [x] WhatsApp CTA
- [x] Navegación funcional
- [x] Mobile responsive

### Métricas de éxito
- [ ] Build exitoso: `pnpm build`
- [ ] TypeScript: < 5 errores críticos
- [ ] Landing carga en < 3 segundos
- [ ] Propiedades se listan correctamente
- [ ] App funciona en mobile

---

## 📝 NOTAS DIARIAS

### Día 1:
```
[Escribe tus notas aquí]
```

### Día 2:
```
[Escribe tus notas aquí]
```

### Día 3:
```
[Escribe tus notas aquí]
```

### Día 4:
```
[Escribe tus notas aquí]
```

### Día 5:
```
[Escribe tus notas aquí]
```

### Día 6:
```
[Escribe tus notas aquí]
```

### Día 7:
```
[Escribe tus notas aquí]
```

---

**¡Vamos a lanzar! 🚀**

