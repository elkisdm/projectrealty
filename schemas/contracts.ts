import { z } from 'zod';

const rutField = z.string().min(3).max(20);

const cuotaSchema = z.object({
  monto_clp: z.number().int().nonnegative(),
  n: z.number().int().positive(),
  fecha: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

export const ContractPayloadSchema = z.object({
  contrato: z.object({
    ciudad_firma: z.string().min(1),
    fecha_firma: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fecha_termino: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  arrendadora: z.object({
    razon_social: z.string().min(1),
    rut: rutField,
    domicilio: z.string().min(1),
    email: z.string().email(),
    cuenta: z.object({
      banco: z.string().min(1),
      tipo: z.string().min(1),
      numero: z.string().min(1),
      email_pago: z.string().email(),
    }),
    personeria: z.object({
      fecha: z.string().min(1),
      notaria: z.string().min(1),
      ciudad: z.string().min(1),
      notario_nombre: z.string().min(1),
    }),
    representante: z.object({
      nombre: z.string().min(1),
      rut: rutField,
      nacionalidad: z.string().min(1),
      estado_civil: z.string().min(1),
      profesion: z.string().min(1),
    }),
  }),
  propietario: z.object({
    nombre: z.string().min(1),
    rut: rutField,
  }),
  arrendatario: z.object({
    nombre: z.string().min(1),
    rut: rutField,
    nacionalidad: z.string().min(1),
    estado_civil: z.string().min(1),
    email: z.string().email(),
    telefono: z.string().optional(),
    domicilio: z.string().min(1),
  }),
  aval: z.object({
    nombre: z.string().min(1),
    rut: rutField,
    nacionalidad: z.string().min(1),
    estado_civil: z.string().min(1),
    profesion: z.string().min(1),
    domicilio: z.string().min(1),
    email: z.string().email().optional(),
  }).optional(),
  inmueble: z.object({
    condominio: z.string().min(1),
    direccion: z.string().min(1),
    comuna: z.string().min(1),
    ciudad: z.string().min(1),
    numero_depto: z.string().optional(),
    numero_casa: z.string().optional(),
  }),
  renta: z.object({
    monto_clp: z.number().int().positive(),
    monto_uf: z.number().nonnegative(),
    dia_limite_pago: z.number().int().min(1).max(31),
    mes_primer_reajuste: z.string().min(1),
  }),
  garantia: z.object({
    monto_total_clp: z.number().int().nonnegative(),
    pago_inicial_clp: z.number().int().nonnegative(),
    cuotas: z.array(cuotaSchema).default([]),
  }),
  flags: z.object({
    hay_aval: z.boolean(),
    mascota_permitida: z.boolean(),
    depto_amoblado: z.boolean(),
  }),
  declaraciones: z.object({
    fondos_origen_texto: z.string().min(1),
    fondos_origen_fuente: z.string().min(1).optional(),
  }),
});

export const IssueContractRequestSchema = z.object({
  templateId: z.string().uuid(),
  payload: ContractPayloadSchema,
});

export type ContractPayload = z.infer<typeof ContractPayloadSchema>;
export type IssueContractRequest = z.infer<typeof IssueContractRequestSchema>;
