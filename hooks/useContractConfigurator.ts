'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContractPayloadSchema } from '@/schemas/contracts';
import type {
  ContractDraftResponse,
  ContractIssueResponse,
  ContractTemplateItem,
  ContractValidationResponse,
  ContractWizardDraft,
} from '@/types/contracts';
import type { AdminRole } from '@/types/admin-ui';
import {
  CONTRACT_WIZARD_STEPS,
  applyAutomaticContractRules,
  computeAutomaticGuaranteeSchedule,
  createContractWizardDefaultDraft,
  formatContractPayloadJson,
  formatRutForDisplay,
  getStepFieldsForContractType,
  getDefaultContractEndDate,
  parseContractPayloadJson,
  prepareContractPayloadForSubmit,
  type UnidadTipo,
} from '@/lib/contracts/form-utils';
import { matchesTemplateToContractType } from '@/lib/contracts/template-type';

type StepState = 'idle' | 'valid' | 'invalid';

interface StoredDraft {
  templateId: string;
  values: ContractWizardDraft;
  currentStep: number;
  isEndDateManual: boolean;
  unidadTipo: UnidadTipo;
  firmaOnline: boolean;
  savedAt: string;
}

interface UseContractConfiguratorOptions {
  adminUserId?: string;
  role?: AdminRole;
}

function isEditorRole(role?: AdminRole): boolean {
  return role === 'admin' || role === 'editor';
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}

function hasValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0;
  }
  if (typeof value === 'boolean') {
    return true;
  }
  return value !== null && value !== undefined;
}

function getPathValue(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, source);
}

function getStorageKey(adminUserId?: string): string | null {
  if (!adminUserId) return null;
  return `contracts:wizard:draft:${adminUserId}`;
}

function detectUnidadTipo(values: ContractWizardDraft): UnidadTipo {
  return values.inmueble.numero_casa?.trim() ? 'casa' : 'departamento';
}

function parseStoredDraft(raw: string): StoredDraft | null {
  try {
    const parsed = JSON.parse(raw) as StoredDraft;
    const validation = ContractPayloadSchema.safeParse(parsed.values);
    if (!validation.success) return null;
    return {
      ...parsed,
      values: validation.data,
    };
  } catch {
    return null;
  }
}

function pickLatestStoredDraft(storage: Storage): StoredDraft | null {
  const prefix = 'contracts:wizard:draft:';
  let best: StoredDraft | null = null;

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(prefix)) continue;
    const raw = storage.getItem(key);
    if (!raw) continue;

    const parsed = parseStoredDraft(raw);
    if (!parsed) continue;

    const bestTime = best?.savedAt ? Date.parse(best.savedAt) : Number.NEGATIVE_INFINITY;
    const nextTime = parsed.savedAt ? Date.parse(parsed.savedAt) : Number.NEGATIVE_INFINITY;
    if (!best || nextTime >= bestTime) {
      best = parsed;
    }
  }

  return best;
}

export function useContractConfigurator(options: UseContractConfiguratorOptions = {}) {
  const { adminUserId, role } = options;
  const canIssue = isEditorRole(role);
  const storageKey = getStorageKey(adminUserId);

  const form = useForm<ContractWizardDraft>({
    resolver: zodResolver(ContractPayloadSchema) as Resolver<ContractWizardDraft>,
    mode: 'onBlur',
    defaultValues: createContractWizardDefaultDraft(),
  });
  const cuotasArray = useFieldArray({
    control: form.control,
    name: 'garantia.cuotas',
  });

  const [templates, setTemplates] = useState<ContractTemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepState, setStepState] = useState<StepState[]>(
    CONTRACT_WIZARD_STEPS.map(() => 'idle')
  );
  const [isEndDateManual, setIsEndDateManual] = useState(false);
  const [unidadTipo, setUnidadTipo] = useState<UnidadTipo>('departamento');
  const [firmaOnline, setFirmaOnline] = useState(false);
  const [validationResult, setValidationResult] = useState<ContractValidationResponse | null>(null);
  const [issueResult, setIssueResult] = useState<ContractIssueResponse | null>(null);
  const [draftResult, setDraftResult] = useState<ContractDraftResponse | null>(null);
  const [isValidatingContract, setIsValidatingContract] = useState(false);
  const [isIssuingContract, setIsIssuingContract] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState(formatContractPayloadJson(form.getValues()));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const hayAval = useWatch({ control: form.control, name: 'flags.hay_aval' });
  const contratoTipo = useWatch({ control: form.control, name: 'contrato.tipo' });
  const fechaInicio = useWatch({ control: form.control, name: 'contrato.fecha_inicio' });
  const rentaMonto = useWatch({ control: form.control, name: 'renta.monto_clp' });
  const garantiaPagoInicial = useWatch({ control: form.control, name: 'garantia.pago_inicial_clp' });
  const garantiaCuotas = useWatch({ control: form.control, name: 'garantia.cuotas' });
  const values = useWatch({ control: form.control });

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      setTemplatesError(null);

      const response = await fetch('/api/templates', { credentials: 'include' });
      const data = (await response.json()) as {
        templates?: ContractTemplateItem[];
        message?: string;
      };

      if (!response.ok) {
        setTemplatesError(extractErrorMessage(data, 'No se pudieron cargar templates'));
        setTemplates([]);
        return;
      }

      const incoming = data.templates ?? [];
      const activeOnly = incoming.filter((item) => item.isActive);
      const visibleTemplates = activeOnly.length > 0 ? activeOnly : incoming;
      setTemplates(visibleTemplates);

      setSelectedTemplateId((prev) => {
        if (prev && visibleTemplates.some((item) => item.id === prev)) return prev;
        const active = visibleTemplates.find((item) => item.isActive);
        return active?.id ?? visibleTemplates[0]?.id ?? prev;
      });
    } catch (error) {
      setTemplatesError(error instanceof Error ? error.message : 'Error al cargar templates');
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!templates.length) return;
    const type = contratoTipo ?? 'standard';
    const current = templates.find((item) => item.id === selectedTemplateId);
    if (current && matchesTemplateToContractType(current, type)) return;

    const fallback = templates.find((item) => matchesTemplateToContractType(item, type));
    setSelectedTemplateId(fallback?.id ?? '');
  }, [contratoTipo, selectedTemplateId, templates]);

  useEffect(() => {
    if (!storageKey) {
      setDraftHydrated(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      let parsed = raw ? parseStoredDraft(raw) : null;

      if (!parsed) {
        parsed = pickLatestStoredDraft(window.localStorage);
      }

      if (!parsed) {
        setDraftHydrated(true);
        return;
      }

      form.reset(parsed.values);
      setSelectedTemplateId(parsed.templateId || '');
      setCurrentStep(
        Number.isFinite(parsed.currentStep)
          ? Math.max(0, Math.min(CONTRACT_WIZARD_STEPS.length - 1, parsed.currentStep))
          : 0
      );
      setIsEndDateManual(Boolean(parsed.isEndDateManual));
      setUnidadTipo(parsed.unidadTipo ?? detectUnidadTipo(parsed.values));
      setFirmaOnline(Boolean(parsed.firmaOnline));
      setJsonText(formatContractPayloadJson(parsed.values));
      setRestoredDraft(true);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setDraftHydrated(true);
    }
  }, [form, storageKey]);

  useEffect(() => {
    if (!draftHydrated || !storageKey) return;

    const timeoutId = window.setTimeout(() => {
      const draft: StoredDraft = {
        templateId: selectedTemplateId,
        values: form.getValues(),
        currentStep,
        isEndDateManual,
        unidadTipo,
        firmaOnline,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [
    currentStep,
    draftHydrated,
    firmaOnline,
    form,
    isEndDateManual,
    selectedTemplateId,
    storageKey,
    unidadTipo,
    values,
  ]);

  useEffect(() => {
    if (isEndDateManual) return;
    if (!fechaInicio) return;
    const suggestedEndDate = getDefaultContractEndDate(fechaInicio);
    if (!suggestedEndDate) return;
    form.setValue('contrato.fecha_termino', suggestedEndDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [fechaInicio, form, isEndDateManual]);

  useEffect(() => {
    const renta = Number(rentaMonto ?? 0);
    const currentTotal = Number(form.getValues('garantia.monto_total_clp') ?? 0);
    if (renta > 0 && currentTotal !== renta) {
      form.setValue('garantia.monto_total_clp', renta, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, rentaMonto]);

  useEffect(() => {
    const total = Number(rentaMonto ?? 0);
    if (total <= 0) return;

    const pagoInicial = Number(garantiaPagoInicial ?? 0);
    if (pagoInicial > total) {
      form.setValue('garantia.pago_inicial_clp', total, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    const schedule = computeAutomaticGuaranteeSchedule({
      montoTotalClp: total,
      pagoInicialClp: Math.min(pagoInicial, total),
      fechaInicio: fechaInicio || '',
    });

    const currentSerialized = JSON.stringify(garantiaCuotas ?? []);
    const nextSerialized = JSON.stringify(schedule.cuotas);
    if (currentSerialized !== nextSerialized) {
      form.setValue('garantia.cuotas', schedule.cuotas, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [fechaInicio, form, garantiaCuotas, garantiaPagoInicial, rentaMonto]);

  useEffect(() => {
    if (!values) return;
    const withRules = applyAutomaticContractRules(values as ContractWizardDraft, {
      unidadTipo,
      firmaOnline,
      autoDeclaration: true,
    });

    if (withRules.declaraciones.fondos_origen_texto !== form.getValues('declaraciones.fondos_origen_texto')) {
      form.setValue('declaraciones.fondos_origen_texto', withRules.declaraciones.fondos_origen_texto, {
        shouldDirty: true,
      });
    }

    if (firmaOnline) {
      const personeria = form.getValues('arrendadora.personeria');
      if (personeria.notaria !== 'No aplica (firma online)') {
        form.setValue('arrendadora.personeria.notaria', 'No aplica (firma online)', {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue(
          'arrendadora.personeria.ciudad',
          form.getValues('contrato.ciudad_firma') || 'Santiago',
          {
            shouldDirty: true,
            shouldValidate: true,
          }
        );
        form.setValue('arrendadora.personeria.notario_nombre', 'No aplica (firma online)', {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [firmaOnline, form, unidadTipo, values]);

  useEffect(() => {
    if (unidadTipo === 'departamento') {
      if (form.getValues('inmueble.numero_casa')) {
        form.setValue('inmueble.numero_casa', '', { shouldDirty: true });
      }
      return;
    }

    if (form.getValues('inmueble.numero_depto')) {
      form.setValue('inmueble.numero_depto', '', { shouldDirty: true });
    }
  }, [form, unidadTipo]);

  useEffect(() => {
    if (contratoTipo !== 'subarriendo_propietario') return;

    form.setValue('flags.hay_aval', false, { shouldDirty: true, shouldValidate: true });
    form.setValue('arrendadora.tipo_persona', 'natural', { shouldDirty: true, shouldValidate: true });
    form.setValue('arrendatario.tipo_persona', 'juridica', { shouldDirty: true, shouldValidate: true });
  }, [contratoTipo, form]);

  const formatRutField = useCallback(
    (
      fieldPath:
        | 'arrendadora.rut'
        | 'arrendadora.representante.rut'
        | 'propietario.rut'
        | 'arrendatario.rut'
        | 'arrendatario.representante_legal.rut'
        | 'aval.rut'
    ) => {
      const current = form.getValues(fieldPath);
      if (typeof current !== 'string') return;
      const formatted = formatRutForDisplay(current);
      if (formatted !== current) {
        form.setValue(fieldPath, formatted as never, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [form]
  );

  const runStepValidation = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      const step = CONTRACT_WIZARD_STEPS[stepIndex];
      if (!step) return false;

      if (step.key === 'template') {
        const validTemplate = Boolean(
          selectedTemplateId
          && selectedTemplate
          && matchesTemplateToContractType(selectedTemplate, contratoTipo ?? 'standard')
        );
        setStepState((prev) => {
          const next = [...prev];
          next[stepIndex] = validTemplate ? 'valid' : 'invalid';
          return next;
        });
        if (!validTemplate) {
          setApiError('Debes seleccionar una plantilla activa compatible con el tipo de contrato.');
        } else {
          setApiError(null);
        }
        return validTemplate;
      }

      const fields = getStepFieldsForContractType(step.key, contratoTipo ?? 'standard', {
        hayAval,
        firmaOnline,
      });

      const valid = fields.length === 0 ? true : await form.trigger(fields as never, { shouldFocus: true });
      setStepState((prev) => {
        const next = [...prev];
        next[stepIndex] = valid ? 'valid' : 'invalid';
        return next;
      });
      return valid;
    },
    [contratoTipo, firmaOnline, form, hayAval, selectedTemplate, selectedTemplateId]
  );

  const nextStep = useCallback(async () => {
    const valid = await runStepValidation(currentStep);
    if (!valid) return false;
    setCurrentStep((prev) => Math.min(prev + 1, CONTRACT_WIZARD_STEPS.length - 1));
    return true;
  }, [currentStep, runStepValidation]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    async (targetStep: number) => {
      const boundedTarget = Math.max(0, Math.min(CONTRACT_WIZARD_STEPS.length - 1, targetStep));
      if (boundedTarget <= currentStep) {
        setCurrentStep(boundedTarget);
        return true;
      }

      for (let step = currentStep; step < boundedTarget; step += 1) {
        const valid = await runStepValidation(step);
        if (!valid) {
          setCurrentStep(step);
          return false;
        }
      }

      setCurrentStep(boundedTarget);
      return true;
    },
    [currentStep, runStepValidation]
  );

  const normalizeAndBuildPayload = useCallback(() => {
    return prepareContractPayloadForSubmit(form.getValues(), {
      unidadTipo,
      firmaOnline,
      autoDeclaration: true,
    });
  }, [firmaOnline, form, unidadTipo]);

  const validateContract = useCallback(async () => {
    if (!selectedTemplateId) {
      setApiError('Selecciona una plantilla antes de validar.');
      return null;
    }

    try {
      setApiError(null);
      setIsValidatingContract(true);
      setIssueResult(null);

      const payload = normalizeAndBuildPayload();
      const response = await fetch('/api/contracts/validate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          payload,
        }),
      });

      const data = (await response.json()) as ContractValidationResponse & {
        code?: string;
        message?: string;
      };

      if ('valid' in data) {
        setValidationResult(data);
        if (!response.ok) {
          setApiError(extractErrorMessage(data, 'Validación con errores'));
        }
        return data;
      }

      setValidationResult(null);
      setApiError(extractErrorMessage(data, 'No se pudo validar contrato'));
      return null;
    } catch (error) {
      setValidationResult(null);
      setApiError(error instanceof Error ? error.message : 'Error validando contrato');
      return null;
    } finally {
      setIsValidatingContract(false);
    }
  }, [normalizeAndBuildPayload, selectedTemplateId]);

  const generateDraft = useCallback(async () => {
    if (!canIssue) return null;
    if (!selectedTemplateId) {
      setApiError('Selecciona una plantilla antes de generar borrador.');
      return null;
    }

    const validSchema = await form.trigger(undefined, { shouldFocus: true });
    if (!validSchema) {
      setApiError('Hay campos pendientes o inválidos en el formulario.');
      return null;
    }

    try {
      setApiError(null);
      setIsGeneratingDraft(true);
      const payload = normalizeAndBuildPayload();

      const response = await fetch('/api/contracts/draft', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          payload,
        }),
      });

      const data = (await response.json()) as ContractDraftResponse & {
        code?: string;
        message?: string;
      };

      if (!response.ok || data.status !== 'draft') {
        setApiError(extractErrorMessage(data, 'No se pudo generar borrador'));
        return null;
      }

      setDraftResult(data);
      return data;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Error generando borrador');
      return null;
    } finally {
      setIsGeneratingDraft(false);
    }
  }, [canIssue, form, normalizeAndBuildPayload, selectedTemplateId]);

  const issueContract = useCallback(async () => {
    if (!canIssue) return null;
    if (!selectedTemplateId) {
      setApiError('Selecciona una plantilla antes de emitir.');
      return null;
    }

    const validSchema = await form.trigger(undefined, { shouldFocus: true });
    if (!validSchema) {
      setApiError('Hay campos pendientes o inválidos en el formulario.');
      return null;
    }

    const validation = validationResult?.valid ? validationResult : await validateContract();
    if (!validation?.valid) {
      setApiError('El contrato no pasó validación. Revisa errores por sección.');
      return null;
    }

    try {
      setApiError(null);
      setIsIssuingContract(true);
      const payload = normalizeAndBuildPayload();

      const response = await fetch('/api/contracts/issue', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          payload,
        }),
      });
      const data = (await response.json()) as ContractIssueResponse & {
        code?: string;
        message?: string;
      };

      if (!response.ok || !data.contractId) {
        setApiError(extractErrorMessage(data, 'No se pudo emitir contrato'));
        return null;
      }

      setIssueResult(data);
      return data;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Error emitiendo contrato');
      return null;
    } finally {
      setIsIssuingContract(false);
    }
  }, [
    canIssue,
    form,
    normalizeAndBuildPayload,
    selectedTemplateId,
    validateContract,
    validationResult,
  ]);

  const downloadTemplateSource = useCallback(async () => {
    if (!selectedTemplateId) return null;

    try {
      const response = await fetch(`/api/templates/${selectedTemplateId}/source`, {
        credentials: 'include',
      });
      const data = (await response.json()) as { sourceUrl?: string; message?: string };
      if (!response.ok || !data.sourceUrl) {
        setApiError(data.message ?? 'No se pudo obtener template fuente');
        return null;
      }
      return data.sourceUrl;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Error descargando template');
      return null;
    }
  }, [selectedTemplateId]);

  const syncJsonFromForm = useCallback(() => {
    setJsonError(null);
    setJsonText(formatContractPayloadJson(normalizeAndBuildPayload()));
  }, [normalizeAndBuildPayload]);

  const applyJsonToForm = useCallback(() => {
    const parsed = parseContractPayloadJson(jsonText);
    if (!parsed.ok) {
      setJsonError(parsed.message);
      return false;
    }

    setJsonError(null);
    form.reset(parsed.payload);
    setValidationResult(null);
    setIssueResult(null);
    setDraftResult(null);
    setUnidadTipo(detectUnidadTipo(parsed.payload));
    return true;
  }, [form, jsonText]);

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'JSON inválido');
    }
  }, [jsonText]);

  const discardDraft = useCallback(() => {
    if (storageKey) {
      window.localStorage.removeItem(storageKey);
    }
    setRestoredDraft(false);
    setCurrentStep(0);
    setIsEndDateManual(false);
    setUnidadTipo('departamento');
    setFirmaOnline(false);
    const defaults = createContractWizardDefaultDraft();
    form.reset(defaults);
    setValidationResult(null);
    setIssueResult(null);
    setDraftResult(null);
    setJsonText(formatContractPayloadJson(defaults));
  }, [form, storageKey]);

  const sectionCompletion = useMemo(() => {
    const currentValues = (values ?? form.getValues()) as unknown as Record<string, unknown>;
    return CONTRACT_WIZARD_STEPS.map((step) => {
      const fields = getStepFieldsForContractType(step.key, contratoTipo ?? 'standard', {
        hayAval,
        firmaOnline,
      });

      if (step.key === 'template') {
        return Boolean(selectedTemplateId);
      }

      if (fields.length === 0) return true;
      return fields.every((path) => hasValue(getPathValue(currentValues, path)));
    });
  }, [contratoTipo, firmaOnline, form, hayAval, selectedTemplateId, values]);

  return {
    form,
    cuotasArray,
    templates,
    isLoadingTemplates,
    templatesError,
    selectedTemplate,
    selectedTemplateId,
    setSelectedTemplateId,
    currentStep,
    stepState,
    sectionCompletion,
    canIssue,
    hayAval,
    unidadTipo,
    setUnidadTipo,
    firmaOnline,
    setFirmaOnline,
    isEndDateManual,
    setIsEndDateManual,
    validationResult,
    issueResult,
    draftResult,
    isValidatingContract,
    isIssuingContract,
    isGeneratingDraft,
    apiError,
    jsonText,
    setJsonText,
    jsonError,
    restoredDraft,
    loadTemplates,
    nextStep,
    prevStep,
    goToStep,
    validateContract,
    generateDraft,
    issueContract,
    downloadTemplateSource,
    syncJsonFromForm,
    applyJsonToForm,
    formatJson,
    discardDraft,
    formatRutField,
  };
}
