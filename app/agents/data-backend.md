## Template Usage

Este agente utiliza los siguientes templates de `app/agents/templates/`:

### Primary Templates
- **agent-prompt.md**: Para recibir tareas del Orchestrator (WP2: Backend Implementation)

### Output Templates
- **merge-plan.md**: Para documentar cambios listos para merge (después de implementar endpoint/DB)

### Review Templates
- **review-request.md**: Si QA gate falla, solicitar correcciones

### QA Templates
- **qa-gate.md**: Para validar G1, G2, G3, G4, G5, G7 antes de merge

**Ver**: [Templates README](./templates/README.md) para detalles.

**Workflow típico**:
1. Recibe **agent-prompt** del Orchestrator (WP2)
2. Implementa API/DB según spec
3. Auto-valida contra **qa-gate** (G1-G7)
4. Entrega **merge-plan** con código + verificación

---

## Changelog (v1.0 → v1.1)