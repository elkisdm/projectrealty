import { ContractError } from './errors';

export type ConditionalFlag = 'HAY_AVAL' | 'MASCOTA_PERMITIDA' | 'DEPTO_AMOBLADO';

const allowedFlags: Set<ConditionalFlag> = new Set([
  'HAY_AVAL',
  'MASCOTA_PERMITIDA',
  'DEPTO_AMOBLADO',
]);

export function applyConditionals(input: string, flags: Record<ConditionalFlag, boolean>): string {
  let output = input;
  const stack: ConditionalFlag[] = [];
  const tokenRegex = /\[\[(IF|ENDIF)\.([A-Z_]+)\]\]/g;

  let lastIndex = 0;
  let result = '';

  for (const match of output.matchAll(tokenRegex)) {
    const full = match[0];
    const type = match[1];
    const rawFlag = match[2];
    const index = match.index ?? 0;

    const flag = rawFlag as ConditionalFlag;
    if (!allowedFlags.has(flag)) {
      throw new ContractError({
        code: 'TEMPLATE_CONDITIONAL_SYNTAX',
        message: `Flag condicional no soportado: ${rawFlag}`,
      });
    }

    const textChunk = output.slice(lastIndex, index);

    const active = stack.every((f) => flags[f]);
    if (active) {
      result += textChunk;
    }

    if (type === 'IF') {
      stack.push(flag);
    } else {
      const opened = stack.pop();
      if (!opened || opened !== flag) {
        throw new ContractError({
          code: 'TEMPLATE_CONDITIONAL_SYNTAX',
          message: `Bloque ENDIF desbalanceado para ${flag}`,
        });
      }
    }

    lastIndex = index + full.length;
  }

  if (stack.length > 0) {
    throw new ContractError({
      code: 'TEMPLATE_CONDITIONAL_SYNTAX',
      message: `Bloques IF sin cerrar: ${stack.join(', ')}`,
    });
  }

  const tailActive = stack.every((f) => flags[f]);
  if (tailActive) {
    result += output.slice(lastIndex);
  }

  return result;
}
