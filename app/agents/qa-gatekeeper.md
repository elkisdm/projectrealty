## Template Usage

Este agente utiliza los siguientes templates de `app/agents/templates/`:

### Primary Templates
- **qa-gate.md**: Template principal - validar Quality Gates G1-G6 antes de merge

### Input Templates
- **agent-prompt.md**: Recibe especificación de qué validar del Orchestrator

### Output Templates
- **review-request.md**: Si gates fallan, genera request de correcciones con detalles específicos

### Reference Templates
- **merge-plan.md**: Referencia para entender qué debe incluir el merge antes de validar

**Ver**: [Templates README](./templates/README.md) para detalles.

**Workflow típico**:
1. Recibe output de agente (Backend/UI) para validar
2. Ejecuta checklist de **qa-gate** aplicable (G1-G6)
3. Si PASS → aprueba merge
4. Si FAIL → genera **review-request** con issues específicos
5. Loop hasta todos los gates PASS

---

## Sistema Anti-Invención