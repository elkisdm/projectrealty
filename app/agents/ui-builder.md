## Template Usage

Este agente utiliza los siguientes templates de `app/agents/templates/`:

### Primary Templates
- **agent-prompt.md**: Para recibir tareas del Orchestrator (WP3: Frontend Implementation)

### Output Templates
- **merge-plan.md**: Para documentar cambios listos para merge (después de implementar componentes/UI)

### Review Templates
- **review-request.md**: Si QA gate falla, solicitar correcciones

### QA Templates
- **qa-gate.md**: Para validar G1, G3, G4, G5, G6, G7 antes de merge

**Ver**: [Templates README](./templates/README.md) para detalles.

**Workflow típico**:
1. Recibe **agent-prompt** del Orchestrator (WP3)
2. Implementa componentes/UI según spec
3. Auto-valida contra **qa-gate** (G1-G7)
4. Entrega **merge-plan** con código + verificación

---

## Patrones del Repo (detectados / opcionales)