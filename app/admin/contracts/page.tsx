'use client';

import { PageHeader } from '@components/admin/ui/PageHeader';
import { useAdminAuth } from '@hooks/useAdminAuth';
import { ContractsConfigurator } from '@/components/admin/contracts/ContractsConfigurator';

export default function AdminContractsPage() {
  const { user, isLoadingSession } = useAdminAuth();
  const role = user?.role ?? 'viewer';

  if (isLoadingSession) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-[var(--admin-surface-2)]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Configurador de contratos"
        description="Flujo guiado para validar y emitir contratos PDF desde plantillas versionadas."
        role={role}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Contratos' },
        ]}
      />

      <ContractsConfigurator role={role} adminUserId={user?.id} />
    </div>
  );
}
