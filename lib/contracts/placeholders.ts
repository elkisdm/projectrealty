import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ContractPayload } from '@/schemas/contracts';
import { ContractError } from './errors';
import { formatCLP, formatUF } from './utils';

interface PlaceholderCatalog {
  allowed: string[];
  required: string[];
}

let cachedCatalog: PlaceholderCatalog | null = null;

function getCatalog(): PlaceholderCatalog {
  if (cachedCatalog) return cachedCatalog;
  const path = join(process.cwd(), 'config/contracts/placeholders.catalog.json');
  cachedCatalog = JSON.parse(readFileSync(path, 'utf8')) as PlaceholderCatalog;
  return cachedCatalog;
}

function getValueFromPath(payload: ContractPayload, path: string): unknown {
  const tokens = path.split('.');
  let current: unknown = payload;
  for (const token of tokens) {
    if (current && typeof current === 'object' && token in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }
  return current;
}

export function buildReplacements(payload: ContractPayload): Record<string, string> {
  const catalog = getCatalog();
  const replacements: Record<string, string> = {};

  for (const placeholder of catalog.allowed) {
    const scoped = placeholder.replace('[[', '').replace(']]', '');
    const lowerPath = scoped.toLowerCase();
    let value = getValueFromPath(payload, lowerPath.replace(/\[(\d+)\]/g, '.$1'));

    if (scoped === 'RENTA.MONTO_CLP' && typeof payload.renta.monto_clp === 'number') {
      value = formatCLP(payload.renta.monto_clp);
    }

    if (scoped === 'RENTA.MONTO_UF' && typeof payload.renta.monto_uf === 'number') {
      value = formatUF(payload.renta.monto_uf);
    }

    if (scoped === 'GARANTIA.MONTO_TOTAL_CLP' && typeof payload.garantia.monto_total_clp === 'number') {
      value = formatCLP(payload.garantia.monto_total_clp);
    }

    if (value === undefined || value === null) {
      continue;
    }

    replacements[placeholder] = String(value);
  }

  return replacements;
}

export function applyReplacements(input: string, replacements: Record<string, string>): string {
  let output = input;
  for (const [token, value] of Object.entries(replacements)) {
    output = output.split(token).join(value);
  }
  return output;
}

export function findResidualPlaceholders(input: string): string[] {
  const matches = input.match(/\[\[[A-Z0-9_\.]+\]\]/g) ?? [];
  return Array.from(new Set(matches));
}

export function assertNoResidualPlaceholders(input: string): void {
  const residual = findResidualPlaceholders(input);
  if (residual.length > 0) {
    throw new ContractError({
      code: 'MISSING_PLACEHOLDERS',
      message: 'Quedaron placeholders sin reemplazar',
      details: residual,
      hint: 'Completa los campos faltantes del payload o corrige la plantilla.',
    });
  }
}

export function assertAvalPlaceholdersProtected(xmlContent: string, hayAval: boolean): void {
  if (hayAval) return;

  const hasRawAvalPlaceholder = /\[\[AVAL\./.test(xmlContent);
  if (hasRawAvalPlaceholder) {
    throw new ContractError({
      code: 'TEMPLATE_AVAL_OUTSIDE_IF',
      message: 'Se detectaron placeholders AVAL fuera de bloque condicional',
      hint: 'Envuelve placeholders AVAL dentro de [[IF.HAY_AVAL]] ... [[ENDIF.HAY_AVAL]].',
    });
  }
}

export function validateCatalogSyntax(content: string): void {
  const catalog = getCatalog();
  const tokens = content.match(/\[\[[A-Z0-9_\.]+\]\]/g) ?? [];
  const invalid = tokens.filter((token) => !catalog.allowed.includes(token) && !token.startsWith('[[IF.') && !token.startsWith('[[ENDIF.'));

  if (invalid.length > 0) {
    throw new ContractError({
      code: 'VALIDATION_ERROR',
      message: 'Template contiene placeholders fuera de catálogo',
      details: Array.from(new Set(invalid)),
    });
  }
}
