'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, FileWarning, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '@/components/ui/accordion/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminRole } from '@/types/admin-ui';
import { CONTRACT_WIZARD_STEPS, formatCLPInput, parseCLPInput } from '@/lib/contracts/form-utils';
import { useContractConfigurator } from '@/hooks/useContractConfigurator';
import { useContractHistory } from '@/hooks/useContractHistory';
import { ContractWizardStepper } from './ContractWizardStepper';
import { ContractTemplateSelector } from './ContractTemplateSelector';
import { ContractReviewPanel } from './ContractReviewPanel';
import { ContractJsonEditor } from './ContractJsonEditor';
import { ContractHistoryTable } from './ContractHistoryTable';

interface ContractsConfiguratorProps {
  role?: AdminRole;
  adminUserId?: string;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

export function ContractsConfigurator({ role = 'viewer', adminUserId }: ContractsConfiguratorProps) {
  const [tab, setTab] = useState<'configurator' | 'json' | 'history'>('configurator');
  const configurator = useContractConfigurator({ role, adminUserId });
  const history = useContractHistory({ enabled: tab === 'history' });

  const { register, control, formState, setValue } = configurator.form;
  const { selectedTemplateId, setSelectedTemplateId } = configurator;
  const garantiaTotal = useWatch({ control, name: 'garantia.monto_total_clp' });
  const garantiaInicial = useWatch({ control, name: 'garantia.pago_inicial_clp' });
  const garantiaCuotas = useWatch({ control, name: 'garantia.cuotas' });
  const contratoTipo = useWatch({ control, name: 'contrato.tipo' });
  const isOwnerSublease = contratoTipo === 'subarriendo_propietario';
  const currentStepKey = CONTRACT_WIZARD_STEPS[configurator.currentStep]?.key;

  const templatesForType = useMemo(() => {
    const templates = configurator.templates;
    if (!isOwnerSublease) {
      return templates.filter((item) => {
        const text = `${item.name} ${item.description ?? ''}`.toLowerCase();
        return !text.includes('subarriendo');
      });
    }

    return templates.filter((item) => {
      const text = `${item.name} ${item.description ?? ''}`.toLowerCase();
      return text.includes('subarriendo');
    });
  }, [configurator.templates, isOwnerSublease]);

  useEffect(() => {
    if (templatesForType.length === 0) {
      setSelectedTemplateId('');
      return;
    }

    const isCurrentValid = templatesForType.some((item) => item.id === selectedTemplateId);
    if (!isCurrentValid) {
      setSelectedTemplateId(templatesForType[0].id);
    }
  }, [selectedTemplateId, setSelectedTemplateId, templatesForType]);

  const guaranteeCoherence = useMemo(() => {
    const cuotas = garantiaCuotas ?? [];
    const cuotasSum = cuotas.reduce((acc, cuota) => acc + Number(cuota?.monto_clp ?? 0), 0);
    const computed = Number(garantiaInicial ?? 0) + cuotasSum;
    const difference = computed - Number(garantiaTotal ?? 0);
    return {
      coherent: Math.abs(difference) <= 1,
      difference,
    };
  }, [garantiaCuotas, garantiaInicial, garantiaTotal]);

  const reviewSections = useMemo(
    () =>
      CONTRACT_WIZARD_STEPS.slice(0, CONTRACT_WIZARD_STEPS.length - 1).map((step, index) => ({
        title: step.title,
        completed: configurator.sectionCompletion[index],
        state: configurator.stepState[index],
      })),
    [configurator.sectionCompletion, configurator.stepState]
  );

  const readOnly = !configurator.canIssue;
  const fechaTerminoRegister = register('contrato.fecha_termino');

  const handleTemplateDownload = async () => {
    const url = await configurator.downloadTemplateSource();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    toast.error('No se pudo descargar el template fuente');
  };

  const handleValidate = async () => {
    const result = await configurator.validateContract();
    if (result?.valid) {
      toast.success('Contrato validado correctamente');
      return;
    }
    toast.warning('Validación con observaciones');
  };

  const handleIssue = async () => {
    const result = await configurator.issueContract();
    if (!result) {
      toast.error('No se pudo emitir el contrato');
      return;
    }
    toast.success(result.idempotentReused ? 'Contrato reutilizado por idempotencia' : 'Contrato emitido');
    void history.reload();
  };

  const handleGenerateDraft = async () => {
    const result = await configurator.generateDraft();
    if (!result) {
      toast.error('No se pudo generar borrador');
      return;
    }
    toast.success('Borrador generado correctamente');
  };

  const handleHistoryDownload = async (contractId: string) => {
    const url = await history.downloadContract(contractId);
    if (!url) {
      toast.error('No se pudo obtener la URL de descarga');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderCurrentStep = () => {
    switch (currentStepKey) {
      case 'tipo':
        return (
          <SectionCard
            title="Tipo de contrato"
            description="Este paso define el proceso, las figuras y los campos habilitados para toda la emisión."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                className={`rounded-xl border p-4 text-left transition ${
                  !isOwnerSublease
                    ? 'border-sky-500/50 bg-sky-500/10'
                    : 'border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)]'
                }`}
                onClick={() =>
                  setValue('contrato.tipo', 'standard', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={readOnly}
              >
                <p className="font-semibold text-[var(--text)]">Contrato estándar</p>
                <p className="mt-1 text-sm text-[var(--subtext)]">
                  Flujo completo de arriendo con campos tradicionales, aval opcional y cláusulas generales.
                </p>
              </button>
              <button
                type="button"
                className={`rounded-xl border p-4 text-left transition ${
                  isOwnerSublease
                    ? 'border-sky-500/50 bg-sky-500/10'
                    : 'border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)]'
                }`}
                onClick={() =>
                  setValue('contrato.tipo', 'subarriendo_propietario', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={readOnly}
              >
                <p className="font-semibold text-[var(--text)]">Propietario con subarriendo</p>
                <p className="mt-1 text-sm text-[var(--subtext)]">
                  Activa flujo de subarriendo, autorización del propietario y campos legales específicos.
                </p>
              </button>
            </div>
            <div className="rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3 text-sm text-[var(--subtext)]">
              Tipo seleccionado: <strong className="text-[var(--text)]">{isOwnerSublease ? 'Propietario con subarriendo' : 'Estándar'}</strong>
            </div>
          </SectionCard>
        );
      case 'template':
        return (
          <ContractTemplateSelector
            templates={templatesForType}
            selectedTemplate={templatesForType.find((item) => item.id === selectedTemplateId) ?? null}
            selectedTemplateId={selectedTemplateId}
            isLoading={configurator.isLoadingTemplates}
            error={templatesForType.length === 0
              ? `No hay plantillas compatibles con "${isOwnerSublease ? 'Propietario con subarriendo' : 'Contrato estándar'}".`
              : configurator.templatesError}
            onSelect={setSelectedTemplateId}
            onReload={configurator.loadTemplates}
            onDownloadSource={handleTemplateDownload}
          />
        );
      case 'partes':
        return (
          <Accordion className="w-full max-w-none space-y-3" defaultValue={['arrendadora']}>
            <AccordionItem value="arrendadora" className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <AccordionHeader>
                <AccordionTrigger className="px-4 py-3 text-left">
                  <span className="font-semibold text-[var(--text)]">{isOwnerSublease ? 'Arrendador/a' : 'Arrendadora'}</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="px-0">
                <SectionCard
                  title={isOwnerSublease ? 'Arrendador/a' : 'Arrendadora'}
                  description="Datos de la sociedad emisora y su cuenta bancaria."
                >
                  <FieldGrid>
                    <div className="space-y-1.5">
                      <Label>Tipo de persona</Label>
                      <Controller
                        control={control}
                        name="arrendadora.tipo_persona"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? 'natural'}
                            onValueChange={(value) => field.onChange(value as 'natural' | 'juridica')}
                          >
                            <SelectTrigger disabled={readOnly}>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="natural">Persona natural</SelectItem>
                              <SelectItem value="juridica">Persona jurídica</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nombre completo / Razón social</Label>
                      <Input {...register('arrendadora.razon_social')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>RUT arrendador/propietario</Label>
                      <Input
                        {...register('arrendadora.rut')}
                        disabled={readOnly}
                        onBlur={() => configurator.formatRutField('arrendadora.rut')}
                      />
                      <p className="text-xs text-[var(--subtext)]">
                        Por defecto usa persona natural; también puede ser empresa.
                      </p>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Domicilio</Label>
                      <Input {...register('arrendadora.domicilio')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" {...register('arrendadora.email')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email pagos</Label>
                      <Input type="email" {...register('arrendadora.cuenta.email_pago')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Banco</Label>
                      <Input {...register('arrendadora.cuenta.banco')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipo cuenta</Label>
                      <Input {...register('arrendadora.cuenta.tipo')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Número cuenta</Label>
                      <Input {...register('arrendadora.cuenta.numero')} disabled={readOnly} />
                    </div>
                  </FieldGrid>
                </SectionCard>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="personeria" className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <AccordionHeader>
                <AccordionTrigger className="px-4 py-3 text-left">
                  <span className="font-semibold text-[var(--text)]">Personería</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="px-0">
                <SectionCard title="Personería">
                  <p className="rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3 text-xs text-[var(--subtext)]">
                    El representante legal usa RUT personal (persona natural), distinto al RUT de la empresa arrendadora.
                  </p>
                  <div className="rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
                    <Controller
                      control={control}
                      name="arrendadora.personeria.notaria"
                      render={() => (
                        <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                          <Checkbox
                            checked={configurator.firmaOnline}
                            onCheckedChange={(checked) => configurator.setFirmaOnline(Boolean(checked))}
                            disabled={readOnly}
                          />
                          Firma online (sin notaría física)
                        </label>
                      )}
                    />
                  </div>
                  <FieldGrid>
                    <div className="space-y-1.5">
                      <Label>Fecha personería</Label>
                      <Input type="date" {...register('arrendadora.personeria.fecha')} disabled={readOnly} />
                    </div>
                    {!configurator.firmaOnline ? (
                      <>
                        <div className="space-y-1.5">
                          <Label>Notaría</Label>
                          <Input {...register('arrendadora.personeria.notaria')} disabled={readOnly} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Ciudad notaría</Label>
                          <Input {...register('arrendadora.personeria.ciudad')} disabled={readOnly} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Nombre notario</Label>
                          <Input {...register('arrendadora.personeria.notario_nombre')} disabled={readOnly} />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Modo firma</Label>
                        <Input value="Firma online (sin notario)" disabled />
                      </div>
                    )}
                  </FieldGrid>
                </SectionCard>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="representante" className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <AccordionHeader>
                <AccordionTrigger className="px-4 py-3 text-left">
                  <span className="font-semibold text-[var(--text)]">Representante legal</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="px-0">
                <SectionCard title="Representante legal">
                  <FieldGrid>
                    <div className="space-y-1.5">
                      <Label>Representante</Label>
                      <Input {...register('arrendadora.representante.nombre')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>RUT representante legal (personal)</Label>
                      <Input
                        {...register('arrendadora.representante.rut')}
                        disabled={readOnly}
                        onBlur={() => configurator.formatRutField('arrendadora.representante.rut')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nacionalidad</Label>
                      <Input {...register('arrendadora.representante.nacionalidad')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Género representante</Label>
                      <Controller
                        control={control}
                        name="arrendadora.representante.genero"
                        render={({ field }) => (
                          <Select value={field.value ?? 'na'} onValueChange={(value) => field.onChange(value === 'na' ? undefined : value)}>
                            <SelectTrigger disabled={readOnly}>
                              <SelectValue placeholder="Selecciona género" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="na">No especificado</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                              <SelectItem value="masculino">Masculino</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estado civil</Label>
                      <Input {...register('arrendadora.representante.estado_civil')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Profesión</Label>
                      <Input {...register('arrendadora.representante.profesion')} disabled={readOnly} />
                    </div>
                  </FieldGrid>
                </SectionCard>
              </AccordionPanel>
            </AccordionItem>

            {!isOwnerSublease ? (
            <AccordionItem value="propietario" className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <AccordionHeader>
                <AccordionTrigger className="px-4 py-3 text-left">
                  <span className="font-semibold text-[var(--text)]">Propietario/a</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="px-0">
                <SectionCard title="Propietario/a">
                  <FieldGrid>
                    <div className="space-y-1.5">
                      <Label>Propietario nombre</Label>
                      <Input {...register('propietario.nombre')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Propietario RUT</Label>
                      <Input
                        {...register('propietario.rut')}
                        disabled={readOnly}
                        onBlur={() => configurator.formatRutField('propietario.rut')}
                      />
                    </div>
                  </FieldGrid>
                </SectionCard>
              </AccordionPanel>
            </AccordionItem>
            ) : null}

            <AccordionItem value="arrendatario" className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <AccordionHeader>
                <AccordionTrigger className="px-4 py-3 text-left">
                  <span className="font-semibold text-[var(--text)]">Arrendatario/a</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="px-0">
                <SectionCard title="Arrendatario/a">
                  <FieldGrid>
                    <div className="space-y-1.5">
                      <Label>Arrendatario nombre</Label>
                      <Input {...register('arrendatario.nombre')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Arrendatario RUT</Label>
                      <Input
                        {...register('arrendatario.rut')}
                        disabled={readOnly}
                        onBlur={() => configurator.formatRutField('arrendatario.rut')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nacionalidad</Label>
                      <Input {...register('arrendatario.nacionalidad')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Género arrendatario</Label>
                      <Controller
                        control={control}
                        name="arrendatario.genero"
                        render={({ field }) => (
                          <Select value={field.value ?? 'na'} onValueChange={(value) => field.onChange(value === 'na' ? undefined : value)}>
                            <SelectTrigger disabled={readOnly}>
                              <SelectValue placeholder="Selecciona género" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="na">No especificado</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                              <SelectItem value="masculino">Masculino</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estado civil</Label>
                      <Input {...register('arrendatario.estado_civil')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" {...register('arrendatario.email')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Teléfono</Label>
                      <Input {...register('arrendatario.telefono')} disabled={readOnly} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Domicilio</Label>
                      <Input {...register('arrendatario.domicilio')} disabled={readOnly} />
                    </div>
                  </FieldGrid>

                  {isOwnerSublease ? (
                    <>
                      <div className="my-4 h-px bg-[var(--admin-border-subtle)]" />
                      <p className="text-sm font-semibold text-[var(--text)]">Representante legal del arrendatario</p>
                      <FieldGrid>
                        <div className="space-y-1.5">
                          <Label>Nombre representante legal</Label>
                          <Input {...register('arrendatario.representante_legal.nombre')} disabled={readOnly} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>RUT representante legal</Label>
                          <Input
                            {...register('arrendatario.representante_legal.rut')}
                            disabled={readOnly}
                            onBlur={() => configurator.formatRutField('arrendatario.representante_legal.rut')}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Nacionalidad</Label>
                          <Input {...register('arrendatario.representante_legal.nacionalidad')} disabled={readOnly} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Género representante legal</Label>
                          <Controller
                            control={control}
                            name="arrendatario.representante_legal.genero"
                            render={({ field }) => (
                              <Select value={field.value ?? 'na'} onValueChange={(value) => field.onChange(value === 'na' ? undefined : value)}>
                                <SelectTrigger disabled={readOnly}>
                                  <SelectValue placeholder="Selecciona género" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="na">No especificado</SelectItem>
                                  <SelectItem value="femenino">Femenino</SelectItem>
                                  <SelectItem value="masculino">Masculino</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Estado civil</Label>
                          <Input {...register('arrendatario.representante_legal.estado_civil')} disabled={readOnly} />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label>Profesión</Label>
                          <Input {...register('arrendatario.representante_legal.profesion')} disabled={readOnly} />
                        </div>
                      </FieldGrid>
                    </>
                  ) : null}
                </SectionCard>
              </AccordionPanel>
            </AccordionItem>

            {!isOwnerSublease ? (
            <AccordionItem value="aval" className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <AccordionHeader>
                <AccordionTrigger className="px-4 py-3 text-left">
                  <span className="font-semibold text-[var(--text)]">Aval</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="px-0">
                <SectionCard title="Aval">
                  <Controller
                    control={control}
                    name="flags.hay_aval"
                    render={({ field }) => (
                      <label className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text)]">
                        <Checkbox
                          checked={Boolean(field.value)}
                          onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                          disabled={readOnly}
                        />
                        Incluir aval en el contrato
                      </label>
                    )}
                  />

                  {configurator.hayAval ? (
                    <FieldGrid>
                      <div className="space-y-1.5">
                        <Label>Nombre aval</Label>
                        <Input {...register('aval.nombre')} disabled={readOnly} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>RUT aval</Label>
                        <Input
                          {...register('aval.rut')}
                          disabled={readOnly}
                          onBlur={() => configurator.formatRutField('aval.rut')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Nacionalidad</Label>
                        <Input {...register('aval.nacionalidad')} disabled={readOnly} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Género aval</Label>
                        <Controller
                          control={control}
                          name="aval.genero"
                          render={({ field }) => (
                            <Select value={field.value ?? 'na'} onValueChange={(value) => field.onChange(value === 'na' ? undefined : value)}>
                              <SelectTrigger disabled={readOnly}>
                                <SelectValue placeholder="Selecciona género" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="na">No especificado</SelectItem>
                                <SelectItem value="femenino">Femenino</SelectItem>
                                <SelectItem value="masculino">Masculino</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Estado civil</Label>
                        <Input {...register('aval.estado_civil')} disabled={readOnly} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Profesión</Label>
                        <Input {...register('aval.profesion')} disabled={readOnly} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input type="email" {...register('aval.email')} disabled={readOnly} />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Domicilio</Label>
                        <Input {...register('aval.domicilio')} disabled={readOnly} />
                      </div>
                    </FieldGrid>
                  ) : (
                    <p className="text-sm text-[var(--subtext)]">Con `hay_aval=false`, el bloque aval se excluye del payload final.</p>
                  )}
                </SectionCard>
              </AccordionPanel>
            </AccordionItem>
            ) : (
              <SectionCard title="Aval" description="No aplica para el flujo de subarriendo de propietario.">
                <p className="text-sm text-[var(--subtext)]">
                  Este tipo de contrato deshabilita automáticamente la figura de aval.
                </p>
              </SectionCard>
            )}
          </Accordion>
        );
      case 'inmueble':
        return (
          <div className="space-y-4">
            <SectionCard title="Inmueble">
              <FieldGrid>
                <div className="space-y-1.5">
                  <Label>Condominio</Label>
                  <Input {...register('inmueble.condominio')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Dirección</Label>
                  <Input {...register('inmueble.direccion')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Comuna</Label>
                  <Input {...register('inmueble.comuna')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ciudad</Label>
                  <Input {...register('inmueble.ciudad')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo unidad</Label>
                  <Select
                    value={configurator.unidadTipo}
                    onValueChange={(value) => configurator.setUnidadTipo(value as 'departamento' | 'casa')}
                  >
                    <SelectTrigger disabled={readOnly}>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{configurator.unidadTipo === 'departamento' ? 'Número depto' : 'Número casa'}</Label>
                  {configurator.unidadTipo === 'departamento' ? (
                    <Input {...register('inmueble.numero_depto')} disabled={readOnly} />
                  ) : (
                    <Input {...register('inmueble.numero_casa')} disabled={readOnly} />
                  )}
                </div>
              </FieldGrid>
            </SectionCard>

            <SectionCard title="Fechas contrato" description="Fecha término se autocompleta (+1 año) hasta que la edites manualmente.">
              <FieldGrid>
                <div className="space-y-1.5">
                  <Label>Ciudad firma</Label>
                  <Input {...register('contrato.ciudad_firma')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha inicio</Label>
                  <Input type="date" {...register('contrato.fecha_inicio')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha firma</Label>
                  <Input type="date" {...register('contrato.fecha_firma')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha término</Label>
                  <Input
                    type="date"
                    {...fechaTerminoRegister}
                    onChange={(event) => {
                      configurator.setIsEndDateManual(true);
                      fechaTerminoRegister.onChange(event);
                    }}
                    disabled={readOnly}
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant={configurator.isEndDateManual ? 'warning' : 'neutral'}>
                      {configurator.isEndDateManual ? 'Editada manualmente' : 'Autocalculada'}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={readOnly}
                      onClick={() => {
                        configurator.setIsEndDateManual(false);
                        setValue('contrato.fecha_termino', '', { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      Recalcular automático
                    </Button>
                  </div>
                </div>
              </FieldGrid>
            </SectionCard>
          </div>
        );
      case 'finanzas':
        return (
          <div className="space-y-4">
            <SectionCard title="Renta">
              <FieldGrid>
                <div className="space-y-1.5">
                  <Label>Monto CLP</Label>
                  <Controller
                    control={control}
                    name="renta.monto_clp"
                    render={({ field }) => (
                      <Input
                        inputMode="numeric"
                        value={formatCLPInput(Number(field.value ?? 0))}
                        onChange={(event) => field.onChange(parseCLPInput(event.target.value))}
                        disabled={readOnly}
                        placeholder="650.000"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Monto UF</Label>
                  <Input type="number" step="0.01" {...register('renta.monto_uf', { valueAsNumber: true })} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Día límite pago</Label>
                  <Input type="number" {...register('renta.dia_limite_pago', { valueAsNumber: true })} disabled={readOnly} />
                </div>
                <div className="space-y-1.5">
                  <Label>Mes primer reajuste</Label>
                  <Input {...register('renta.mes_primer_reajuste')} disabled={readOnly} />
                </div>
              </FieldGrid>
            </SectionCard>

            <SectionCard title="Garantía" description="Regla dura: pago inicial + cuotas debe igualar total (tolerancia 1 CLP).">
              <FieldGrid>
                <div className="space-y-1.5">
                  <Label>Garantía total CLP</Label>
                  <Controller
                    control={control}
                    name="garantia.monto_total_clp"
                    render={() => (
                      <Input
                        inputMode="numeric"
                        value={formatCLPInput(Number(garantiaTotal ?? 0))}
                        onChange={() => undefined}
                        disabled
                        placeholder="Auto = renta"
                      />
                    )}
                  />
                  <p className="text-xs text-[var(--subtext)]">Se define automáticamente igual al valor del arriendo.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Pago inicial CLP</Label>
                  <Controller
                    control={control}
                    name="garantia.pago_inicial_clp"
                    render={({ field }) => (
                      <Input
                        inputMode="numeric"
                        value={formatCLPInput(Number(field.value ?? 0))}
                        onChange={(event) => field.onChange(parseCLPInput(event.target.value))}
                        disabled={readOnly}
                        placeholder="109.500"
                      />
                    )}
                  />
                </div>
              </FieldGrid>

              <div className="space-y-3 rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text)]">Cuotas garantía automáticas</p>
                  <Badge variant="info">2 meses desde inicio</Badge>
                </div>

                {(garantiaCuotas ?? []).length === 0 ? (
                  <p className="text-xs text-[var(--subtext)]">Sin cuotas. El total se asume como pago inicial.</p>
                ) : (
                  <div className="space-y-2">
                    {(garantiaCuotas ?? []).map((cuota, index) => (
                      <div key={`${cuota.n}-${index}`} className="grid gap-2 rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-2 md:grid-cols-3">
                        <div className="text-sm">
                          <p className="text-xs text-[var(--subtext)]">Cuota</p>
                          <p className="font-medium text-[var(--text)]">#{cuota.n}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-xs text-[var(--subtext)]">Monto</p>
                          <p className="font-medium text-[var(--text)]">${formatCLPInput(Number(cuota.monto_clp ?? 0))}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-xs text-[var(--subtext)]">Fecha pago</p>
                          <p className="font-medium text-[var(--text)]">{cuota.fecha || '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`rounded-md border p-3 text-sm ${
                  guaranteeCoherence.coherent
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}
              >
                {guaranteeCoherence.coherent
                  ? 'Coherencia OK entre total y desglose de garantía.'
                  : `Diferencia actual: ${guaranteeCoherence.difference.toLocaleString('es-CL')} CLP`}
              </div>
            </SectionCard>
          </div>
        );
      case 'condiciones':
        return (
          <div className="space-y-4">
            <SectionCard title="Condiciones contrato">
              <div className="grid gap-3 md:grid-cols-2">
                <Controller
                  control={control}
                  name="flags.mascota_permitida"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly}
                      />
                      Mascota permitida
                    </label>
                  )}
                />
                <Controller
                  control={control}
                  name="flags.depto_amoblado"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly}
                      />
                      Depto amoblado
                    </label>
                  )}
                />
              </div>
              {isOwnerSublease ? (
                <p className="text-xs text-[var(--subtext)]">
                  En tipo subarriendo, estas banderas se mantienen para compatibilidad de plantilla, pero el flujo principal lo determina la cláusula de subarriendo.
                </p>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Subarriendo"
              description="Reglas contractuales para subarriendo y autorización del propietario."
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Controller
                  control={control}
                  name="subarriendo.permitido"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly || contratoTipo === 'subarriendo_propietario'}
                      />
                      Subarriendo permitido
                    </label>
                  )}
                />
                <Controller
                  control={control}
                  name="subarriendo.propietario_autoriza"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly || contratoTipo === 'subarriendo_propietario'}
                      />
                      Propietario autoriza subarriendo
                    </label>
                  )}
                />
                <Controller
                  control={control}
                  name="subarriendo.notificacion_obligatoria"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly}
                      />
                      Notificación obligatoria
                    </label>
                  )}
                />
                <Controller
                  control={control}
                  name="subarriendo.permite_multiples"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly}
                      />
                      Permite múltiples terceros ocupantes
                    </label>
                  )}
                />
                <Controller
                  control={control}
                  name="subarriendo.periodo_vacancia"
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] p-3 text-sm md:col-span-2">
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={readOnly}
                      />
                      Permite período de vacancia entre terceros ocupantes
                    </label>
                  )}
                />
              </div>

              <FieldGrid>
                <div className="space-y-1.5">
                  <Label>Plazo notificación (días hábiles)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    {...register('subarriendo.plazo_notificacion_habiles', { valueAsNumber: true })}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Referencia legal</Label>
                  <Input {...register('subarriendo.referencia_legal')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Texto de autorización</Label>
                  <Textarea rows={3} {...register('subarriendo.autorizacion_texto')} disabled={readOnly} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Responsabilidad principal</Label>
                  <Textarea rows={3} {...register('subarriendo.responsabilidad_principal')} disabled={readOnly} />
                </div>
              </FieldGrid>
            </SectionCard>

            <SectionCard title="Declaración de origen de fondos">
              <div className="space-y-1.5">
                <Label>Origen de fondos</Label>
                <Input
                  {...register('declaraciones.fondos_origen_fuente')}
                  disabled={readOnly}
                  placeholder="Remuneraciones por trabajo dependiente"
                />
                <p className="text-xs text-[var(--subtext)]">
                  Esta fuente se usa para construir automáticamente la declaración completa.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Texto declaración (autogenerado)</Label>
                <Textarea rows={12} {...register('declaraciones.fondos_origen_texto')} disabled />
              </div>
            </SectionCard>
          </div>
        );
      case 'review':
        return (
          <ContractReviewPanel
            sections={reviewSections}
            validation={configurator.validationResult}
            draftResult={configurator.draftResult}
            issueResult={configurator.issueResult}
            apiError={configurator.apiError}
            canIssue={configurator.canIssue}
            isValidating={configurator.isValidatingContract}
            isGeneratingDraft={configurator.isGeneratingDraft}
            isIssuing={configurator.isIssuingContract}
            onValidate={handleValidate}
            onGenerateDraft={handleGenerateDraft}
            onIssue={handleIssue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="space-y-4">
      <TabsList className="h-10 bg-[var(--admin-surface-2)]">
        <TabsTrigger value="configurator">Configurador</TabsTrigger>
        <TabsTrigger value="json">JSON avanzado</TabsTrigger>
        <TabsTrigger value="history">Historial</TabsTrigger>
      </TabsList>

      <TabsContent value="configurator" className="space-y-4">
        {configurator.restoredDraft ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-sm">
            <div className="inline-flex items-center gap-2 text-sky-200">
              <Info className="h-4 w-4" />
              Se restauró un borrador local para este usuario.
            </div>
            <Button type="button" size="sm" variant="outline" onClick={configurator.discardDraft}>
              Descartar borrador
            </Button>
          </div>
        ) : null}

        <ContractWizardStepper
          steps={CONTRACT_WIZARD_STEPS}
          currentStep={configurator.currentStep}
          stepState={configurator.stepState}
          sectionCompletion={configurator.sectionCompletion}
          onStepClick={(step) => {
            void configurator.goToStep(step);
          }}
          readOnly={readOnly}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">{renderCurrentStep()}</div>

          <aside className="space-y-4">
            <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estado del flujo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Paso actual</p>
                  <p className="font-semibold text-[var(--text)]">
                    {configurator.currentStep + 1}. {CONTRACT_WIZARD_STEPS[configurator.currentStep]?.title}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Plantilla</p>
                  <p className="text-[var(--text)]">
                    {configurator.selectedTemplate
                      ? `${configurator.selectedTemplate.name} · ${configurator.selectedTemplate.version}`
                      : 'Sin selección'}
                  </p>
                </div>
                {Object.keys(formState.errors).length > 0 ? (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
                      <FileWarning className="h-4 w-4" />
                      Campos pendientes
                    </p>
                    <p className="text-xs text-amber-200">Corrige errores del paso actual antes de avanzar.</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]/95 p-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={configurator.prevStep}
              disabled={configurator.currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {configurator.currentStep < CONTRACT_WIZARD_STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  void configurator.nextStep();
                }}
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleIssue} disabled={!configurator.canIssue || !configurator.validationResult?.valid}>
                Emitir contrato
              </Button>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="json">
        <ContractJsonEditor
          jsonText={configurator.jsonText}
          onChangeJson={configurator.setJsonText}
          onSyncFromForm={configurator.syncJsonFromForm}
          onApplyToForm={configurator.applyJsonToForm}
          onFormat={configurator.formatJson}
          jsonError={configurator.jsonError}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="history">
        <ContractHistoryTable
          contracts={history.contracts}
          templates={configurator.templates}
          filters={history.filters}
          pagination={history.pagination}
          loading={history.loading}
          downloading={history.isDownloading}
          error={history.error}
          onFiltersChange={history.setFilters}
          onPageChange={history.setPage}
          onRefresh={history.reload}
          onDownload={handleHistoryDownload}
        />
      </TabsContent>
    </Tabs>
  );
}
