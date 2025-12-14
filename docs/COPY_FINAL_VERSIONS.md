# Copy Final Recomendado - Home Page

## 🎯 VERSIONES LISTAS PARA IMPLEMENTAR

### 1. HERO SECTION

#### Badge
```
La forma más fácil de encontrar arriendo
```

#### Headline (H1)
```
Arrienda departamentos
en [Santiago]
```
**Nota**: `[Santiago]` es un componente dinámico que rota cada 2-3 segundos mostrando diferentes comunas disponibles (Ñuñoa, Las Condes, Providencia, etc.)

#### Subheadline
```
Propiedades dedicadas para arrendar. Experiencia hotelera.
Agenda visitas, compara precios y arrienda 100% online.
```

#### CTA Primario
```
Buscar departamentos
```

#### CTA Secundario
```
Ver todos los departamentos
```

#### Stats (3 métricas)
- **0%** → Sin comisión de corretaje
- **100%** → Proceso 100% online
- **[+X]** → Propiedades disponibles (número dinámico desde BD)

---

### 2. SEARCH SECTION

#### Título (H2)
```
Encuentra tu departamento
```

#### Input de Búsqueda
**Placeholder:**
```
Busca por comuna, dirección o nombre de edificio
```

**Botón Filtros:**
```
🔽 Filtros
```
*(Se muestra junto al input, al hacer click despliega panel)*

#### Panel de Filtros (Desplegable)
**Labels:**
- **Comuna**: "Comuna" (pills)
- **Dormitorios**: "Dormitorios" (pills)
- **Precio Mínimo**: "Precio mínimo" (hint: "Desde $500.000")
- **Precio Máximo**: "Precio máximo" (hint: "Hasta $5.000.000")

**CTA dentro del panel:**
```
Buscar departamentos
```

#### Link Secundario (Fuera del panel)
```
Ver todos los departamentos
```

**Nota**: El panel de filtros se despliega con animación slide-down al hacer click en el botón "Filtros"

---

### 3. FEATURED UNITS SECTIONS

#### Títulos (H2)
- "Departamentos en Ñuñoa"
- "Departamentos en Las Condes"
- "Departamentos en Providencia"
- "Departamentos 1 dormitorio"
- "Departamentos 2 dormitorios"
- "Departamentos económicos"
- "Departamentos destacados" *(cambiar de "Propiedades destacadas")*

#### Subtítulos Opcionales (Solo si agregan valor)
- "Departamentos en Ñuñoa" → "Ubicación céntrica con excelente conectividad"
- "Departamentos 1 dormitorio" → "Ideales para profesionales y estudiantes"
- "Departamentos económicos" → "Desde $800.000 mensuales"

---

### 4. BENEFITS SECTION

#### Título (H2)
```
Por qué elegirnos
```

#### Subtítulo
```
Proceso simple, transparente y 100% digital
```

#### Benefit Card 1
**Título:**
```
Arrienda sin estrés
```

**Descripción:**
```
Proceso guiado paso a paso. Desde la búsqueda hasta la firma, todo en un solo lugar.
```

#### Benefit Card 2
**Título:**
```
Proceso 100% digital
```

**Descripción:**
```
Agenda visitas, compara precios y completa trámites desde tu celular. Sin papeleos ni esperas.
```

#### Benefit Card 3
**Título:**
```
Propiedades verificadas
```

**Descripción:**
```
Cada departamento está verificado. Disponibilidad confirmada y precios actualizados en tiempo real.
```

---

## 📱 VERSIONES MÓVIL (Texto Reducido)

### Hero Badge Mobile
```
La forma más fácil de encontrar arriendo
```
*(Mantener igual, es corto)*

### Hero Headline Mobile
```
Arrienda departamentos
en [Santiago]
```
*(Componente dinámico de comunas funciona igual en móvil)*

### Hero Subheadline Mobile
```
Propiedades dedicadas para arrendar.
Proceso 100% digital.
```

---

## 🎨 MICROCOPY

### Estados de Formulario
- **Placeholder**: "Busca por comuna, dirección o nombre de edificio"
- **Error**: "Por favor, completa al menos un campo"
- **Loading**: "Buscando departamentos..."
- **Empty**: "No encontramos departamentos con esos filtros. Intenta con otros criterios."

### Botones
- **Primary**: "Buscar departamentos"
- **Secondary**: "Ver todos los departamentos"
- **Tertiary**: "Agendar visita"

### Links
- "Ver más" → "Ver más departamentos"
- "Ver detalles" → "Ver detalles completos"
- "Contactar" → "Hablar por WhatsApp"

---

## ✅ CHECKLIST RÁPIDO

- [ ] Todos los textos usan "departamentos" (no "propiedades")
- [ ] Headlines tienen máximo 10 palabras
- [ ] CTAs usan verbos de acción
- [ ] Beneficios son específicos, no genéricos
- [ ] Microcopy para estados de error/loading/empty
- [ ] Versiones móvil más cortas implementadas
- [ ] Componente dinámico de comunas implementado (rotación cada 2-3 segundos)
- [ ] Contador de propiedades dinámico desde BD
- [ ] Panel de filtros desplegable funcional
- [ ] Animaciones respetan `prefers-reduced-motion`

---

**Listo para implementar** ✅

