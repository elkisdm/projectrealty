import { NextResponse } from 'next/server';
import { asErrorResponse, ContractError } from './errors';

export function okJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorJson(error: unknown): NextResponse {
  const payload = asErrorResponse(error);

  const status = (() => {
    if (error instanceof ContractError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
          return 401;
        case 'FORBIDDEN':
          return 403;
        case 'VALIDATION_ERROR':
        case 'INVALID_RUT':
        case 'INVALID_DATES':
        case 'INVALID_AMOUNTS':
        case 'MISSING_PLACEHOLDERS':
        case 'TEMPLATE_CONDITIONAL_SYNTAX':
        case 'TEMPLATE_AVAL_OUTSIDE_IF':
        case 'TEMPLATE_NOT_ACTIVE':
          return 400;
        case 'STORAGE_ERROR':
        case 'RENDER_FAILED':
        default:
          return 500;
      }
    }

    return 500;
  })();

  return NextResponse.json(payload, { status });
}
