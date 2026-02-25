export type ContractErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_RUT'
  | 'INVALID_DATES'
  | 'INVALID_AMOUNTS'
  | 'MISSING_PLACEHOLDERS'
  | 'TEMPLATE_CONDITIONAL_SYNTAX'
  | 'TEMPLATE_AVAL_OUTSIDE_IF'
  | 'TEMPLATE_NOT_ACTIVE'
  | 'RENDER_FAILED'
  | 'STORAGE_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN';

export interface ContractErrorShape {
  code: ContractErrorCode;
  message: string;
  details?: unknown;
  hint?: string;
}

export class ContractError extends Error {
  code: ContractErrorCode;
  details?: unknown;
  hint?: string;

  constructor(shape: ContractErrorShape) {
    super(shape.message);
    this.name = 'ContractError';
    this.code = shape.code;
    this.details = shape.details;
    this.hint = shape.hint;
  }

  toJSON(): ContractErrorShape {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      hint: this.hint,
    };
  }
}

export function asErrorResponse(error: unknown): ContractErrorShape {
  if (error instanceof ContractError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return {
      code: 'RENDER_FAILED',
      message: error.message,
    };
  }

  return {
    code: 'RENDER_FAILED',
    message: 'Unexpected error',
  };
}
