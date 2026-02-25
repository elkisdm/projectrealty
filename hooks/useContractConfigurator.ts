'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContractPayloadSchema } from '@/schemas/contracts';
import type {
  ContractIssueResponse,
  ContractTemplateItem,
  ContractValidationResponse,
  ContractWizardDraft,
} from '@/types/contracts';
import type { AdminRole } from '@/types/admin-ui';
import {
  CONTRACT_WIZARD_STEPS,
  WIZARD_STEP_FIELDS,
  formatContractPayloadJson,
  getDefaultContractEndDate,
  parseContractPayloadJson,
  prepareContractPayloadForSubmit,
  createContractWizardDefaultDraft,
} from '@/lib/contracts/form-utils';

type StepState = 'idle' | 'valid' | 'invalid';

interface StoredDraft {
  templateId: string;
  values: ContractWizardDraft;
  currentStep: number;
  isEndDateManual: boolean;
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
  const [validationResult, setValidationResult] = useState<ContractValidationResponse | null>(null);
  const [issueResult, setIssueResult] = useState<ContractIssueResponse | null>(null);
  const [isValidatingContract, setIsValidatingContract] = useState(false);
  const [isIssuingContract, setIsIssuingContract] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState(formatContractPayloadJson(form.getValues()));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const hayAval = useWatch({ control: form.control, name: 'flags.hay_aval' });
  const fechaInicio = useWatch({ control: form.control, name: 'contrato.fecha_inicio' });
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
      setTemplates(incoming);

      setSelectedTemplateId((prev) => {
        if (prev) return prev;
        const active = incoming.find((item) => item.isActive);
        return active?.id ?? prev;
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
    if (!storageKey) {
      setDraftHydrated(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setDraftHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as StoredDraft;
      const validation = ContractPayloadSchema.safeParse(parsed.values);
      if (validation.success) {
        form.reset(validation.data);
        setSelectedTemplateId(parsed.templateId || '');
        setCurrentStep(
          Number.isFinite(parsed.currentStep)
            ? Math.max(0, Math.min(CONTRACT_WIZARD_STEPS.length - 1, parsed.currentStep))
            : 0
        );
        setIsEndDateManual(Boolean(parsed.isEndDateManual));
        setJsonText(formatContractPayloadJson(validation.data));
        setRestoredDraft(true);
      }
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
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep, draftHydrated, form, isEndDateManual, selectedTemplateId, storageKey, values]);

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

  const runStepValidation = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      const step = CONTRACT_WIZARD_STEPS[stepIndex];
      if (!step) return false;

      if (step.key === 'template') {
        const validTemplate = Boolean(selectedTemplateId);
        setStepState((prev) => {
          const next = [...prev];
          next[stepIndex] = validTemplate ? 'valid' : 'invalid';
          return next;
        });
        if (!validTemplate) {
          setApiError('Debes seleccionar una plantilla activa para continuar.');
        } else {
          setApiError(null);
        }
        return validTemplate;
      }

      const fields = [...WIZARD_STEP_FIELDS[step.key]];
      if (step.key === 'partes' && hayAval) {
        fields.push(
          'aval.nombre',
          'aval.rut',
          'aval.nacionalidad',
          'aval.estado_civil',
          'aval.profesion',
          'aval.domicilio'
        );
      }

      const valid = fields.length === 0 ? true : await form.trigger(fields as never, { shouldFocus: true });
      setStepState((prev) => {
        const next = [...prev];
        next[stepIndex] = valid ? 'valid' : 'invalid';
        return next;
      });
      return valid;
    },
    [form, hayAval, selectedTemplateId]
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
    return prepareContractPayloadForSubmit(form.getValues());
  }, [form]);

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
    form.reset(createContractWizardDefaultDraft());
    setValidationResult(null);
    setIssueResult(null);
    setJsonText(formatContractPayloadJson(createContractWizardDefaultDraft()));
  }, [form, storageKey]);

  const sectionCompletion = useMemo(() => {
    const currentValues = (values ?? form.getValues()) as unknown as Record<string, unknown>;
    return CONTRACT_WIZARD_STEPS.map((step) => {
      const baseFields = WIZARD_STEP_FIELDS[step.key];
      const fields = [...baseFields];

      if (step.key === 'template') {
        return Boolean(selectedTemplateId);
      }

      if (step.key === 'partes' && hayAval) {
        fields.push(
          'aval.nombre',
          'aval.rut',
          'aval.nacionalidad',
          'aval.estado_civil',
          'aval.profesion',
          'aval.domicilio'
        );
      }

      if (fields.length === 0) return true;
      return fields.every((path) => hasValue(getPathValue(currentValues, path)));
    });
  }, [form, hayAval, selectedTemplateId, values]);

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
    isEndDateManual,
    setIsEndDateManual,
    validationResult,
    issueResult,
    isValidatingContract,
    isIssuingContract,
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
    issueContract,
    downloadTemplateSource,
    syncJsonFromForm,
    applyJsonToForm,
    formatJson,
    discardDraft,
  };
}
