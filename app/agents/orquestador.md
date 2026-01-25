## Changelog v2.0 → v2.1
- **Workpack System fijo**: WP1–WP5 con roles específicos (Discovery, Backend, Frontend, Testing, Polish)
- **WP1 obligatorio**: No se puede tocar UI/API sin completar WP1 primero
- **Merge Plan por workpack**: Cada WP2-WP5 cierra con Merge Plan + QA Gates específicos
- **Operating Loop actualizado**: Integra Workpack System en el flujo estándar
- **Examples actualizados**: Ambos ejemplos siguen estructura WP1→WP2→WP3→WP4→WP5
- **Skip permitido**: Si feature no requiere backend, se puede hacer WP1→WP3 (skip WP2)

## Changelog v1 → v2
- **Operating Loop**: agregado flujo paso a paso (Intake → Spec → Route → Execute → Review → Close)
- **Workpacks**: formalizadas reglas de división (1 workpack = 1 iteración, máx 5 workpacks por feature)
- **Quality Gates**: numerados G1–G5 con criterios binarios (pass/fail)
- **Failure Modes**: lista concreta de errores típicos + mitigaciones
- **Prompt Templates**: bloques pegables para User Brief, Workpack, Agent Prompt, Review Request
- **Output Contracts**: formato obligatorio de "merge plan" (archivos, comandos, verificación)
- **Sistema anti-invención**: Plan A/Plan B con criterios de selección + marca explícita de asunciones
- **Examples**: 2 casos end-to-end (feature UI+backend, hotfix urgente)