## Template Usage

Este agente utiliza los siguientes templates de `app/agents/templates/`:

### Primary Templates
- **workpack.md**: Para definir macro-tareas (1-3 steps) que involucran múltiples agentes
- **agent-prompt.md**: Para generar prompts específicos a otros agentes (Backend, UI, QA, Context)

### Output Templates
- **merge-plan.md**: Para documentar cambios listos para merge (usado en WP2-WP5)

### Review Templates
- **review-request.md**: Si QA gate falla, solicitar correcciones a agentes

### QA Templates
- **qa-gate.md**: Para estructurar validación de Quality Gates antes de merge

**Ver**: [Templates README](./templates/README.md) para detalles de cada template.

**Workflow típico**:
1. Orchestrator recibe pedido → crea **workpack** (WP1-WP5)
2. Por cada WP, genera **agent-prompt** para agente especializado
3. Agente ejecuta → Orchestrator valida con **qa-gate**
4. Si PASS → genera **merge-plan**
5. Si FAIL → genera **review-request**

---

## Sistema Anti-Invención