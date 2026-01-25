All notable changes to the agent system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-01-24 - System Consolidation

### Added
- **QUALITY_GATES.md** with unified gate definitions (G1-G9)
  - G1-G5: Universal gates for all agents
  - G6-G9: Specialized gates (Mobile Sheet, Performance, Freshness, Actionable)
  - Matrix by agent and workpack
- **ROUTING_RULES.md** with escalation flowchart
  - 5 escalation triggers to Orchestrator
  - Agent selection rules (when to use each agent)
  - Cross-agent handoff protocols
  - Decision matrix for routing
- **WORKFLOW_DIAGRAM.md** with WP1-WP5 visual flow
  - Complete Mermaid diagrams of workpack system
  - Skip rules and decision trees
  - Time estimates per feature type
  - Common patterns (CRUD, UI, Full Stack)
- **CHANGELOG.md** (this file) for version tracking
- **Orchestrator v2.1** as official version (WP1-WP5 system)
  - Workpack System fijo WP1-WP5
  - WP1 obligatorio antes de tocar UI/API
  - Discovery phase valida contra CONTRACTS.md
- **_archive/** directory for deprecated files

### Changed
- **Standardized Quality Gates** across all agents
  - All agents now reference QUALITY_GATES.md instead of inline definitions
  - QA Gate G1 now includes validation against CONTRACTS.md
- **WP1 (Discovery) now mandatory** - validates CONTRACTS.md
  - Added step: "Verificar CONTRACTS.md para tipos/APIs existentes"
- **Context Indexer triggers** updated to sync with workpacks
  - Trigger 3 now notifies Orchestrator when new contracts added
- **CONTRACTS.md** updated with validation note
  - Added header note about WP1 validation requirement

### Deprecated
- **Orchestrator v2.0** (flexible workpacks)
  - Moved to `_archive/Orchestrator-v2.0-deprecated.md`
  - v2.1 with fixed WP1-WP5 system is now official

### Fixed
- **Ambiguity in gate definitions** between agents
  - G1-G5 now have consistent meaning across all agents
- **Missing validation against CONTRACTS.md**
  - WP1 now requires checking CONTRACTS.md before creating new types
- **Routing rules scattered** across individual agents
  - Now consolidated in ROUTING_RULES.md with clear decision tree

### Security
- **Added QA Gate G1 check**: validate against CONTRACTS.md before creating new types
  - Prevents duplicate definitions and type inconsistencies
- **RLS verification** now explicit in G2 (Security & Privacy)

---

## [1.1.0] - 2026-01-20 - Agent Specialization

### Added
- **Data/Backend Agent v1.1** with comprehensive RLS rules
  - Section F: Security (RLS/Policies) Rules (S1-S7)
  - Section G: Performance Rules (Indexes, Query Optimization) (P1-P7)
  - Section H: Error Contract (standardized responses)
  - Section M: Examples (end-to-end property search + RLS audit)
- **UI Builder Agent v1.1** with mobile-first patterns
  - Section F: UX Rules (mobile-first)
  - Section G: Accessibility Rules (focus/keyboard/aria)
  - Section H: Performance Rules (rendering/layout shift)
  - Section M: Examples (modal creation + component improvement)
- **QA Gatekeeper Agent v1.1** with risk scoring
  - Section: Risk Scoring Framework (High/Med/Low)
  - Section: Quality Gates (G1-G6) for UI/Flows
  - Section: Mobile Sheet gate (G5) - scroll + focus
  - Section: Examples (price filter feature + hotfix)
- **Context Indexer Agent v1.0**
  - Section F: Context Files Structure (INDEX, PATTERNS, CONTRACTS, DECISIONS)
  - Section G: Update Rules (4 triggers + cadence)
  - Section H: Quick Queries (5 templates)
  - Section M: Examples (context pack + full index refresh)
- **Templates System v1.1** (5 core templates)
  - workpack.md
  - agent-prompt.md
  - qa-gate.md
  - merge-plan.md
  - review-request.md

### Changed
- **Orchestrator split into specialized roles**
  - Data/Backend: API, DB, RLS, Performance
  - UI Builder: Components, UX, Mobile-first, A11y
  - QA Gatekeeper: Testing, Risk assessment, Gates validation
  - Context Indexer: Documentation, Patterns, Contracts
- **Quality Gates expanded** to G1-G6 per agent
  - Each agent now has specialized gates beyond universal G1-G5

### Improved
- **Output Contracts formalized** across all agents
  - Goal statement
  - Spec mínimo
  - Files to change
  - Implementation
  - Comandos de verificación
  - Risks/Tradeoffs
  - DoD (Definition of Done)

---

## [1.0.0] - 2026-01-15 - Initial System

### Added
- **Orchestrator v1.0** (basic coordination)
  - Core Principles (6 principles)
  - Operating Loop (Intake → Spec → Route → Execute → Review → Close)
  - Workpack concept (flexible division of work)
  - Routing Rules (when to call each agent)
  - Quality Gates (G1-G5 basic)
- **Agent prompt templates**
  - User Brief template
  - Workpack template
  - Agent Prompt template
  - Review Request template
- **Basic quality gates**
  - G1: Contract Compliance
  - G2: Security
  - G3: UX States
  - G4: Code Quality
  - G5: Verification
- **Workpack concept**
  - 1 workpack = 1 iteration
  - Max 5 workpacks per feature
  - 1 micro-tarea por iteración
- **Sistema anti-invención**
  - Assumptions + Open Questions
  - Plan A/B proposal mechanism
  - Escalation rules

### Principles Established
1. 1 micro-tarea por iteración
2. No inventar datos
3. Contratos siempre
4. Estados completos
5. Refactor solo si se pidió
6. Output copy/paste

---

## [0.9.0] - 2026-01-10 - Pre-release

### Added
- Initial agent roles definition
- Basic prompt engineering patterns
- Core project rules (.cursor/rules/00-core.mdc)

### Experimental
- Early workpack experiments
- Quality gate prototypes

---

## Version History Summary

| Version | Date | Focus | Status |
|---------|------|-------|--------|
| 2.0.0 | 2026-01-24 | System Consolidation | ✅ Current |
| 1.1.0 | 2026-01-20 | Agent Specialization | Superseded |
| 1.0.0 | 2026-01-15 | Initial System | Superseded |
| 0.9.0 | 2026-01-10 | Pre-release | Deprecated |

---

## Migration Guides

### From v1.1 to v2.0

**Breaking Changes**:
- Orchestrator v2.0 deprecated → use Orchestrator v2.1
- Quality Gates now reference QUALITY_GATES.md (not inline)
- WP1 now mandatory - cannot skip Discovery phase

**Action Required**:
1. Update any references to Orchestrator.md (now uses v2.1 with fixed workpacks)
2. Read QUALITY_GATES.md to understand G1-G9 matrix
3. Always execute WP1 before WP2/WP3 (validate CONTRACTS.md)
4. Reference ROUTING_RULES.md for agent selection

**No Code Changes Required**:
- Existing agent prompts still work
- Templates remain compatible
- Quality gate checks still pass (now with unified definitions)

---

### From v1.0 to v1.1

**Breaking Changes**:
- Orchestrator split into specialized agents (must route correctly)
- Quality gates expanded (G6 added for some agents)

**Action Required**:
1. Use Data/Backend agent for API/DB work (not generic Orchestrator)
2. Use UI Builder agent for component work
3. Use QA Gatekeeper for testing/validation
4. Check specialized gates (G6-G9) if applicable

---

## Upcoming Changes (v2.1 planned)

### Planned for Next Release
- [ ] Automated validation script for Quality Gates
- [ ] Template usage sections in all agents
- [ ] Standardized anti-invention format across agents
- [ ] Agent README.md with quick start guide
- [ ] Performance benchmarks for workpack times

### Under Consideration
- [ ] Agent orchestration automation (CLI tool)
- [ ] Quality gate auto-checking (pre-commit hooks)
- [ ] Context pack generation automation
- [ ] Integration with CI/CD pipeline

---

## How to Contribute

### Reporting Issues
- File issues at project root
- Use template: [Bug/Feature/Documentation]
- Tag with affected agent (Orchestrator, Backend, UI, QA, Context)

### Proposing Changes
- Create ADR (Architectural Decision Record) in Context Indexer format
- Update relevant agent documentation
- Update this CHANGELOG under "Unreleased"
- Increment version according to semver

### Version Numbering
- **Major (X.0.0)**: Breaking changes to agent interfaces or workpack system
- **Minor (x.Y.0)**: New agents, gates, or significant features (backward compatible)
- **Patch (x.y.Z)**: Bug fixes, documentation, small improvements

---

## Maintainers

- **System Architect**: Orchestrator Agent
- **Documentation**: Context Indexer Agent
- **Quality Assurance**: QA Gatekeeper Agent

---

## License

Internal project - all rights reserved.

---

**Last Updated**: 2026-01-24  
**Current Version**: 2.0.0  
**Status**: Active Development