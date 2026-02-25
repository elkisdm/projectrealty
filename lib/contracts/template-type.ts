import type { ContractPayload } from '@/schemas/contracts';

interface TemplateLike {
  name: string;
  description: string | null;
}

export function isSubleaseTemplate(template: TemplateLike): boolean {
  const haystack = `${template.name} ${template.description ?? ''}`.toLowerCase();
  return haystack.includes('subarriendo');
}

export function matchesTemplateToContractType(
  template: TemplateLike,
  contractType: ContractPayload['contrato']['tipo']
): boolean {
  const sublease = isSubleaseTemplate(template);
  if (contractType === 'subarriendo_propietario') return sublease;
  return !sublease;
}

