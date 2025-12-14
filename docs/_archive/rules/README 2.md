# Reglas de Desarrollo - Hommie 0% Comisión

## Índice de Reglas

### 20-components.mdc
**UI/Componentes (Next 14, TS estricto, Tailwind, Framer Motion)**
- Reglas para desarrollo de componentes React
- Patrones de UI/UX y accesibilidad
- Testing básico de componentes
- Mejores prácticas de rendimiento

### 25-testing-warnings.mdc
**Testing y Corrección de Warnings**
- Reglas obligatorias para evitar warnings en tests
- Patrones de testing con React Testing Library
- Corrección de warnings comunes (act(), forwardRef, Framer Motion)
- Comandos de verificación y troubleshooting

## Aplicación de Reglas

### Reglas Siempre Aplicadas
- TypeScript estricto (prohibido `any`)
- Server Components por defecto
- A11y y accesibilidad obligatoria
- Testing de componentes nuevos

### Reglas por Contexto
- **Componentes UI:** Usar regla `20-components`
- **Tests y warnings:** Usar regla `25-testing-warnings`
- **APIs:** Usar regla `10-api` (cuando esté disponible)

## Comandos de Verificación

```bash
# Verificar que no hay warnings en tests
pnpm test --passWithNoTests

# Verificar linting
pnpm lint

# Verificar tipos TypeScript
pnpm type-check
```

## Checklist de QA

### Antes de Commit
- [ ] Todos los tests pasan (472/472)
- [ ] No warnings en consola de tests
- [ ] Linting sin errores
- [ ] TypeScript sin errores
- [ ] A11y verificada

### Antes de PR
- [ ] Tests de integración pasan
- [ ] Cobertura de tests >80%
- [ ] Documentación actualizada
- [ ] Checklist de PR completado
