import { z } from 'zod';

const rutField = z.string().min(3).max(20);
const generoField = z.enum(['masculino', 'femenino']).optional();
const tipoPersonaField = z.enum(['natural', 'juridica']).optional();

const cuotaSchema = z.object({
  monto_clp: z.number().int().nonnegative(),
  n: z.number().int().positive(),
  fecha: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

export const ContractPayloadSchema = z.object({
  contrato: z.object({
    ciudad_firma: z.string().min(1),
    tipo: z.enum(['standard', 'subarriendo_propietario']).default('standard'),
    aviso_termino_dias: z.number().int().min(1).max(365).optional(),
    fecha_firma: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fecha_termino: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  arrendadora: z.object({
    tipo_persona: tipoPersonaField,
    razon_social: z.string().min(1),
    rut: rutField,
    nacionalidad: z.string().optional(),
    estado_civil: z.string().optional(),
    profesion: z.string().optional(),
    domicilio: z.string().min(1),
    email: z.string().email(),
    cuenta: z.object({
      banco: z.string().optional(),
      tipo: z.string().optional(),
      numero: z.string().optional(),
      email_pago: z.string().optional(),
    }),
    personeria: z.object({
      fecha: z.string().optional(),
      notaria: z.string().optional(),
      ciudad: z.string().optional(),
      notario_nombre: z.string().optional(),
    }),
    representante: z.object({
      nombre: z.string().optional(),
      rut: z.string().optional(),
      genero: generoField,
      nacionalidad: z.string().optional(),
      estado_civil: z.string().optional(),
      profesion: z.string().optional(),
    }),
  }),
  propietario: z.object({
    nombre: z.string().min(1),
    rut: rutField,
    genero: generoField,
  }),
  arrendatario: z.object({
    tipo_persona: tipoPersonaField,
    nombre: z.string().min(1),
    rut: rutField,
    genero: generoField,
    nacionalidad: z.string().optional(),
    estado_civil: z.string().optional(),
    email: z.string().email(),
    telefono: z.string().optional(),
    domicilio: z.string().min(1),
    representante_legal: z.object({
      nombre: z.string().min(1),
      rut: rutField,
      genero: generoField,
      nacionalidad: z.string().min(1),
      estado_civil: z.string().min(1),
      profesion: z.string().min(1),
      domicilio: z.string().min(1),
      email: z.string().email().optional(),
    }).optional(),
  }),
  aval: z.object({
    nombre: z.string().min(1),
    rut: rutField,
    genero: generoField,
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
    monto_clp: z.number().int().nonnegative(),
    monto_uf: z.number().nonnegative(),
    porcentaje_subarriendo: z.number().min(0).max(100).optional(),
    dia_limite_pago: z.number().int().min(1).max(31),
    mes_primer_reajuste: z.string().min(1),
  }),
  garantia: z.object({
    monto_total_clp: z.number().int().nonnegative(),
    pago_inicial_clp: z.number().int().nonnegative(),
    cuotas: z.array(cuotaSchema).default([]),
  }),
  subarriendo: z.object({
    permitido: z.boolean().optional(),
    propietario_autoriza: z.boolean().optional(),
    notificacion_obligatoria: z.boolean().optional(),
    plazo_notificacion_habiles: z.number().int().min(0).max(365).optional(),
    permite_multiples: z.boolean().optional(),
    periodo_vacancia: z.boolean().optional(),
    referencia_legal: z.string().min(1).optional(),
    autorizacion_texto: z.string().min(1).optional(),
    responsabilidad_principal: z.string().min(1).optional(),
  }).optional(),
  flags: z.object({
    hay_aval: z.boolean(),
    mascota_permitida: z.boolean(),
    depto_amoblado: z.boolean(),
  }),
  declaraciones: z.object({
    fondos_origen_texto: z.string().default(''),
    fondos_origen_fuente: z.string().optional(),
  }),
});

export const IssueContractRequestSchema = z.object({
  templateId: z.string().uuid(),
  payload: ContractPayloadSchema,
});

export type ContractPayload = z.infer<typeof ContractPayloadSchema>;
export type IssueContractRequest = z.infer<typeof IssueContractRequestSchema>;
