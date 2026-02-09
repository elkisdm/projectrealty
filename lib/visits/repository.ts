import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';
import type { CreateVisitRequest, Visit, VisitSlot } from '@/types/visit';

type VisitChannel = 'web' | 'whatsapp';

type VisitRow = {
  id: string;
  listing_id: string;
  slot_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'canceled' | 'no_show' | 'completed';
  idempotency_key: string;
  agent_id: string;
  created_at: string;
};

type VisitSlotRow = {
  id: string;
  listing_id: string;
  start_time: string;
  end_time: string;
  status: 'open' | 'blocked' | 'reserved' | 'confirmed';
  source: 'owner' | 'system';
  created_at: string;
};

type VisitCreateInput = CreateVisitRequest & {
  channel: VisitChannel;
};

type VisitCreateResult = {
  visit: Visit;
  slot: VisitSlot;
  idempotent: boolean;
};

type VisitCancelResult = {
  visit: Visit;
};

type VisitStatusUpdateResult = {
  visit: Visit;
};

type VisitRescheduleResult = {
  visit: Visit;
  previousSlot: VisitSlot;
  nextSlot: VisitSlot;
};

type UserVisitsResult = {
  upcoming: Visit[];
  past: Visit[];
  canceled: Visit[];
};

class SlotUnavailableError extends Error {
  constructor(message = 'Slot no disponible o ya reservado') {
    super(message);
    this.name = 'SlotUnavailableError';
  }
}

class MissingSchemaError extends Error {
  constructor(message = 'Schema de visitas no disponible en base de datos') {
    super(message);
    this.name = 'MissingSchemaError';
  }
}

class VisitNotFoundError extends Error {
  constructor(message = 'Visita no encontrada') {
    super(message);
    this.name = 'VisitNotFoundError';
  }
}

class InvalidVisitTransitionError extends Error {
  constructor(message = 'Transición de estado inválida para la visita') {
    super(message);
    this.name = 'InvalidVisitTransitionError';
  }
}

class CancelWindowExpiredError extends Error {
  constructor(message = 'La visita ya está fuera de la ventana de cancelación/reprogramación') {
    super(message);
    this.name = 'CancelWindowExpiredError';
  }
}

interface VisitRepository {
  createVisit(input: VisitCreateInput): Promise<VisitCreateResult>;
  getVisitsByUser(userId: string): Promise<UserVisitsResult>;
  cancelVisit(input: { visitId: string; reason?: string; actorType?: 'user' | 'admin' | 'system'; actorId?: string }): Promise<VisitCancelResult>;
  updateVisitStatus(input: {
    visitId: string;
    status: VisitRow['status'];
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitStatusUpdateResult>;
  rescheduleVisit(input: {
    visitId: string;
    slotId: string;
    listingId?: string;
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitRescheduleResult>;
}

const FALLBACK_AGENT_ID = 'agent_001';

type MemoryVisit = Visit & {
  channel: VisitChannel;
};

type MemoryStore = {
  visits: Map<string, MemoryVisit>;
  slots: Map<string, VisitSlot>;
  idempotency: Map<string, string>;
};

const memoryStore: MemoryStore = {
  visits: new Map(),
  slots: new Map(),
  idempotency: new Map(),
};

function nowIso(): string {
  return new Date().toISOString();
}

function buildVisitId(): string {
  return `visit_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function mapVisitRow(row: VisitRow): Visit {
  return {
    id: row.id,
    listingId: row.listing_id,
    slotId: row.slot_id,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at,
    idempotencyKey: row.idempotency_key,
    agentId: row.agent_id,
  };
}

function mapSlotRow(row: VisitSlotRow): VisitSlot {
  return {
    id: row.id,
    listingId: row.listing_id,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  };
}

function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  return code === '42P01';
}

function parseSyntheticSlot(slotId: string, listingId: string): VisitSlot | null {
  const mockMatch = slotId.match(/^mock-slot-(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2})$/);
  if (mockMatch) {
    const start = new Date(`${mockMatch[1]}T${mockMatch[2]}:00-03:00`);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return {
      id: slotId,
      listingId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'open',
      source: 'system',
      createdAt: nowIso(),
    };
  }

  const legacyMatch = slotId.match(/^slot_(.+)_(\d{13})$/);
  if (legacyMatch) {
    const timestamp = Number(legacyMatch[2]);
    if (!Number.isNaN(timestamp)) {
      const start = new Date(timestamp);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return {
        id: slotId,
        listingId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'open',
        source: 'system',
        createdAt: nowIso(),
      };
    }
  }

  return null;
}

function getCancelWindowHours(): number {
  const parsed = Number(process.env.VISIT_CANCEL_WINDOW_HOURS ?? '2');
  if (Number.isNaN(parsed) || parsed < 0) return 2;
  return parsed;
}

function ensureInsideCancelWindow(slotStartIso: string): void {
  const slotStart = new Date(slotStartIso);
  const now = new Date();
  const threshold = new Date(slotStart.getTime() - getCancelWindowHours() * 60 * 60 * 1000);
  if (now > threshold) {
    throw new CancelWindowExpiredError();
  }
}

const VISIT_STATUS_TRANSITIONS: Record<VisitRow['status'], VisitRow['status'][]> = {
  pending: ['confirmed', 'canceled'],
  confirmed: ['in_progress', 'completed', 'canceled', 'no_show'],
  in_progress: ['completed', 'no_show', 'canceled'],
  completed: [],
  canceled: [],
  no_show: [],
};

function canTransitionVisitStatus(from: VisitRow['status'], to: VisitRow['status']): boolean {
  return VISIT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

function canRescheduleVisit(status: VisitRow['status']): boolean {
  return status === 'pending' || status === 'confirmed';
}

class InMemoryVisitRepository implements VisitRepository {
  async createVisit(input: VisitCreateInput): Promise<VisitCreateResult> {
    const existingVisitId = memoryStore.idempotency.get(input.idempotencyKey);
    if (existingVisitId) {
      const existingVisit = memoryStore.visits.get(existingVisitId);
      if (existingVisit) {
        const existingSlot = memoryStore.slots.get(existingVisit.slotId);
        if (!existingSlot) {
          throw new SlotUnavailableError('Slot asociado no encontrado');
        }
        return { visit: existingVisit, slot: existingSlot, idempotent: true };
      }
    }

    let slot = memoryStore.slots.get(input.slotId);
    if (!slot) {
      const syntheticSlot = parseSyntheticSlot(input.slotId, input.listingId);
      if (syntheticSlot) {
        slot = syntheticSlot;
        memoryStore.slots.set(slot.id, slot);
      }
    }

    if (!slot || slot.status !== 'open') {
      throw new SlotUnavailableError();
    }

    const updatedSlot: VisitSlot = { ...slot, status: 'confirmed' };
    memoryStore.slots.set(slot.id, updatedSlot);

    const visit: MemoryVisit = {
      id: buildVisitId(),
      listingId: input.listingId,
      slotId: input.slotId,
      userId: input.userId,
      status: 'confirmed',
      createdAt: nowIso(),
      idempotencyKey: input.idempotencyKey,
      agentId: FALLBACK_AGENT_ID,
      channel: input.channel,
    };

    memoryStore.visits.set(visit.id, visit);
    memoryStore.idempotency.set(input.idempotencyKey, visit.id);

    return {
      visit,
      slot: updatedSlot,
      idempotent: false,
    };
  }

  async getVisitsByUser(userId: string): Promise<UserVisitsResult> {
    const userVisits = Array.from(memoryStore.visits.values()).filter((visit) => visit.userId === userId);

    const upcoming: Visit[] = [];
    const past: Visit[] = [];
    const canceled: Visit[] = [];

    for (const visit of userVisits) {
      const slot = memoryStore.slots.get(visit.slotId);
      const slotStart = slot ? new Date(slot.startTime) : null;

      if (visit.status === 'canceled') {
        canceled.push(visit);
        continue;
      }

      if (visit.status === 'completed' || visit.status === 'no_show') {
        past.push(visit);
        continue;
      }

      if (slotStart && slotStart > new Date()) {
        upcoming.push(visit);
      } else {
        past.push(visit);
      }
    }

    return { upcoming, past, canceled };
  }

  async cancelVisit(input: {
    visitId: string;
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitCancelResult> {
    const visit = memoryStore.visits.get(input.visitId);
    if (!visit) {
      throw new VisitNotFoundError();
    }

    if (!canTransitionVisitStatus(visit.status, 'canceled')) {
      throw new InvalidVisitTransitionError();
    }

    const slot = memoryStore.slots.get(visit.slotId);
    if (!slot) {
      throw new SlotUnavailableError('Slot asociado no encontrado');
    }

    ensureInsideCancelWindow(slot.startTime);

    const updatedVisit: MemoryVisit = { ...visit, status: 'canceled' };
    memoryStore.visits.set(visit.id, updatedVisit);
    memoryStore.slots.set(slot.id, { ...slot, status: 'open' });

    return { visit: updatedVisit };
  }

  async updateVisitStatus(input: {
    visitId: string;
    status: VisitRow['status'];
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitStatusUpdateResult> {
    const visit = memoryStore.visits.get(input.visitId);
    if (!visit) {
      throw new VisitNotFoundError();
    }

    if (!canTransitionVisitStatus(visit.status, input.status)) {
      throw new InvalidVisitTransitionError();
    }

    if (input.status === 'canceled') {
      const slot = memoryStore.slots.get(visit.slotId);
      if (slot) {
        memoryStore.slots.set(slot.id, { ...slot, status: 'open' });
      }
    }

    const updatedVisit: MemoryVisit = {
      ...visit,
      status: input.status,
    };
    memoryStore.visits.set(updatedVisit.id, updatedVisit);

    return { visit: updatedVisit };
  }

  async rescheduleVisit(input: {
    visitId: string;
    slotId: string;
    listingId?: string;
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitRescheduleResult> {
    const visit = memoryStore.visits.get(input.visitId);
    if (!visit) {
      throw new VisitNotFoundError();
    }

    if (!canRescheduleVisit(visit.status)) {
      throw new InvalidVisitTransitionError();
    }

    const currentSlot = memoryStore.slots.get(visit.slotId);
    if (!currentSlot) {
      throw new SlotUnavailableError('Slot actual no encontrado');
    }

    ensureInsideCancelWindow(currentSlot.startTime);

    let nextSlot = memoryStore.slots.get(input.slotId);
    if (!nextSlot) {
      const synthetic = parseSyntheticSlot(input.slotId, input.listingId || visit.listingId);
      if (synthetic) {
        nextSlot = synthetic;
        memoryStore.slots.set(synthetic.id, synthetic);
      }
    }

    if (!nextSlot || nextSlot.status !== 'open') {
      throw new SlotUnavailableError();
    }

    memoryStore.slots.set(currentSlot.id, { ...currentSlot, status: 'open' });
    const confirmedNextSlot: VisitSlot = { ...nextSlot, status: 'confirmed' };
    memoryStore.slots.set(confirmedNextSlot.id, confirmedNextSlot);

    const updatedVisit: MemoryVisit = {
      ...visit,
      slotId: confirmedNextSlot.id,
      listingId: input.listingId || visit.listingId,
      status: 'confirmed',
    };
    memoryStore.visits.set(updatedVisit.id, updatedVisit);

    return {
      visit: updatedVisit,
      previousSlot: currentSlot,
      nextSlot: confirmedNextSlot,
    };
  }
}

class SupabaseVisitRepository implements VisitRepository {
  private fallbackRepo = new InMemoryVisitRepository();

  private async findVisitByIdempotency(idempotencyKey: string): Promise<VisitRow | null> {
    const { data, error } = await supabaseAdmin
      .from('visits')
      .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at')
      .eq('idempotency_key', idempotencyKey)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        throw new MissingSchemaError();
      }
      throw error;
    }

    return (data as VisitRow | null) ?? null;
  }

  private async findVisitById(visitId: string): Promise<VisitRow | null> {
    const { data, error } = await supabaseAdmin
      .from('visits')
      .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at')
      .eq('id', visitId)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        throw new MissingSchemaError();
      }
      throw error;
    }

    return (data as VisitRow | null) ?? null;
  }

  private async getSlotById(slotId: string): Promise<VisitSlotRow | null> {
    const { data, error } = await supabaseAdmin
      .from('visit_slots')
      .select('id, listing_id, start_time, end_time, status, source, created_at')
      .eq('id', slotId)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        throw new MissingSchemaError();
      }
      throw error;
    }

    return (data as VisitSlotRow | null) ?? null;
  }

  private async createSyntheticSlot(slotId: string, listingId: string): Promise<VisitSlotRow | null> {
    const parsed = parseSyntheticSlot(slotId, listingId);
    if (!parsed) return null;

    const payload = {
      id: parsed.id,
      listing_id: parsed.listingId,
      start_time: parsed.startTime,
      end_time: parsed.endTime,
      status: 'open',
      source: 'system',
      created_at: parsed.createdAt,
      updated_at: nowIso(),
    };

    const { data, error } = await supabaseAdmin
      .from('visit_slots')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: false })
      .select('id, listing_id, start_time, end_time, status, source, created_at')
      .single();

    if (error) {
      if (isMissingRelationError(error)) {
        throw new MissingSchemaError();
      }
      throw error;
    }

    return data as VisitSlotRow;
  }

  private async reserveSlot(slotId: string): Promise<VisitSlotRow | null> {
    const { data, error } = await supabaseAdmin
      .from('visit_slots')
      .update({ status: 'confirmed', updated_at: nowIso() })
      .eq('id', slotId)
      .eq('status', 'open')
      .select('id, listing_id, start_time, end_time, status, source, created_at')
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        throw new MissingSchemaError();
      }
      throw error;
    }

    return (data as VisitSlotRow | null) ?? null;
  }

  private async logStatusHistory(input: {
    visitId: string;
    eventType: 'created' | 'status_changed' | 'rescheduled';
    fromStatus?: VisitRow['status'] | null;
    toStatus?: VisitRow['status'] | null;
    fromSlotId?: string | null;
    toSlotId?: string | null;
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const payload = {
      visit_id: input.visitId,
      event_type: input.eventType,
      from_status: input.fromStatus ?? null,
      to_status: input.toStatus ?? null,
      from_slot_id: input.fromSlotId ?? null,
      to_slot_id: input.toSlotId ?? null,
      reason: input.reason ?? null,
      actor_type: input.actorType ?? 'system',
      actor_id: input.actorId ?? null,
      metadata: input.metadata ?? {},
      created_at: nowIso(),
    };

    const { error } = await supabaseAdmin.from('visit_status_history').insert(payload);
    if (error) {
      if (isMissingRelationError(error) && process.env.NODE_ENV !== 'production') {
        logger.warn('visit_status_history no disponible en entorno actual, se omite logging');
        return;
      }
      throw error;
    }
  }

  async createVisit(input: VisitCreateInput): Promise<VisitCreateResult> {
    try {
      const existingVisit = await this.findVisitByIdempotency(input.idempotencyKey);
      if (existingVisit) {
        const existingSlot = await this.getSlotById(existingVisit.slot_id);
        if (!existingSlot) throw new SlotUnavailableError('Slot asociado no encontrado');
        return {
          visit: mapVisitRow(existingVisit),
          slot: mapSlotRow(existingSlot),
          idempotent: true,
        };
      }

      let slot = await this.getSlotById(input.slotId);
      if (!slot) {
        slot = await this.createSyntheticSlot(input.slotId, input.listingId);
      }

      if (!slot) {
        throw new SlotUnavailableError();
      }

      const reservedSlot = await this.reserveSlot(input.slotId);
      if (!reservedSlot) {
        throw new SlotUnavailableError();
      }

      const visitPayload = {
        id: buildVisitId(),
        listing_id: input.listingId,
        slot_id: input.slotId,
        user_id: input.userId,
        status: 'confirmed',
        idempotency_key: input.idempotencyKey,
        agent_id: FALLBACK_AGENT_ID,
        channel: input.channel,
        created_at: nowIso(),
        updated_at: nowIso(),
      };

      const { data, error } = await supabaseAdmin
        .from('visits')
        .insert(visitPayload)
        .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at')
        .single();

      if (error) {
        const duplicateKey = error.code === '23505';
        if (duplicateKey) {
          const duplicatedVisit = await this.findVisitByIdempotency(input.idempotencyKey);
          if (duplicatedVisit) {
            const duplicatedSlot = await this.getSlotById(duplicatedVisit.slot_id);
            if (duplicatedSlot) {
              return {
                visit: mapVisitRow(duplicatedVisit),
                slot: mapSlotRow(duplicatedSlot),
                idempotent: true,
              };
            }
          }
        }

        // Rollback best-effort si falló insert de visita luego de reservar slot.
        await supabaseAdmin
          .from('visit_slots')
          .update({ status: 'open', updated_at: nowIso() })
          .eq('id', input.slotId)
          .eq('status', 'confirmed');

        if (isMissingRelationError(error)) {
          throw new MissingSchemaError();
        }
        throw error;
      }

      if (input.contactData?.name && input.contactData?.phone) {
        const { error: contactError } = await supabaseAdmin.from('visit_contacts').upsert(
          {
            visit_id: (data as VisitRow).id,
            name: input.contactData.name,
            phone: input.contactData.phone,
            email: input.contactData.email ?? null,
          },
          { onConflict: 'visit_id', ignoreDuplicates: false }
        );

        if (contactError && !isMissingRelationError(contactError)) {
          logger.warn('No se pudo persistir visit_contacts', contactError);
        }
      }

      await this.logStatusHistory({
        visitId: (data as VisitRow).id,
        eventType: 'created',
        fromStatus: null,
        toStatus: 'confirmed',
        fromSlotId: null,
        toSlotId: input.slotId,
        actorType: 'system',
      });

      return {
        visit: mapVisitRow(data as VisitRow),
        slot: mapSlotRow(reservedSlot),
        idempotent: false,
      };
    } catch (error) {
      if (error instanceof MissingSchemaError && process.env.NODE_ENV !== 'production') {
        logger.warn('Schema de visitas no disponible; usando fallback en memoria');
        return this.fallbackRepo.createVisit(input);
      }
      throw error;
    }
  }

  async getVisitsByUser(userId: string): Promise<UserVisitsResult> {
    try {
      const { data, error } = await supabaseAdmin
        .from('visits')
        .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at, visit_slots(start_time)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (isMissingRelationError(error)) {
          throw new MissingSchemaError();
        }
        throw error;
      }

      const now = new Date();
      const upcoming: Visit[] = [];
      const past: Visit[] = [];
      const canceled: Visit[] = [];

      for (const row of (data ?? []) as Array<
        VisitRow & { visit_slots?: { start_time?: string } | Array<{ start_time?: string }> | null }
      >) {
        const visit = mapVisitRow(row);
        const slotInfo = Array.isArray(row.visit_slots) ? row.visit_slots[0] : row.visit_slots;
        const slotStart = slotInfo?.start_time ? new Date(slotInfo.start_time) : null;

        if (visit.status === 'canceled') {
          canceled.push(visit);
        } else if (visit.status === 'completed' || visit.status === 'no_show' || (slotStart && slotStart <= now)) {
          past.push(visit);
        } else {
          upcoming.push(visit);
        }
      }

      return { upcoming, past, canceled };
    } catch (error) {
      if (error instanceof MissingSchemaError && process.env.NODE_ENV !== 'production') {
        return this.fallbackRepo.getVisitsByUser(userId);
      }
      throw error;
    }
  }

  async cancelVisit(input: {
    visitId: string;
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitCancelResult> {
    try {
      const visit = await this.findVisitById(input.visitId);
      if (!visit) {
        throw new VisitNotFoundError();
      }

      if (!canTransitionVisitStatus(visit.status, 'canceled')) {
        throw new InvalidVisitTransitionError();
      }

      const slot = await this.getSlotById(visit.slot_id);
      if (!slot) {
        throw new SlotUnavailableError('Slot asociado no encontrado');
      }

      ensureInsideCancelWindow(slot.start_time);

      const { data: updatedVisit, error: updateVisitError } = await supabaseAdmin
        .from('visits')
        .update({ status: 'canceled', updated_at: nowIso() })
        .eq('id', visit.id)
        .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at')
        .single();

      if (updateVisitError) {
        if (isMissingRelationError(updateVisitError)) throw new MissingSchemaError();
        throw updateVisitError;
      }

      const { error: openSlotError } = await supabaseAdmin
        .from('visit_slots')
        .update({ status: 'open', updated_at: nowIso() })
        .eq('id', visit.slot_id)
        .eq('status', 'confirmed');
      if (openSlotError && !isMissingRelationError(openSlotError)) {
        throw openSlotError;
      }

      await this.logStatusHistory({
        visitId: visit.id,
        eventType: 'status_changed',
        fromStatus: visit.status,
        toStatus: 'canceled',
        fromSlotId: visit.slot_id,
        toSlotId: visit.slot_id,
        reason: input.reason,
        actorType: input.actorType ?? 'user',
        actorId: input.actorId,
      });

      return { visit: mapVisitRow(updatedVisit as VisitRow) };
    } catch (error) {
      if (error instanceof MissingSchemaError && process.env.NODE_ENV !== 'production') {
        return this.fallbackRepo.cancelVisit(input);
      }
      throw error;
    }
  }

  async updateVisitStatus(input: {
    visitId: string;
    status: VisitRow['status'];
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitStatusUpdateResult> {
    try {
      const visit = await this.findVisitById(input.visitId);
      if (!visit) {
        throw new VisitNotFoundError();
      }

      if (!canTransitionVisitStatus(visit.status, input.status)) {
        throw new InvalidVisitTransitionError();
      }

      const { data: updatedVisit, error: updateVisitError } = await supabaseAdmin
        .from('visits')
        .update({ status: input.status, updated_at: nowIso() })
        .eq('id', visit.id)
        .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at')
        .single();

      if (updateVisitError) {
        if (isMissingRelationError(updateVisitError)) throw new MissingSchemaError();
        throw updateVisitError;
      }

      if (input.status === 'canceled') {
        const { error: openSlotError } = await supabaseAdmin
          .from('visit_slots')
          .update({ status: 'open', updated_at: nowIso() })
          .eq('id', visit.slot_id)
          .eq('status', 'confirmed');
        if (openSlotError && !isMissingRelationError(openSlotError)) {
          throw openSlotError;
        }
      }

      await this.logStatusHistory({
        visitId: visit.id,
        eventType: 'status_changed',
        fromStatus: visit.status,
        toStatus: input.status,
        fromSlotId: visit.slot_id,
        toSlotId: visit.slot_id,
        reason: input.reason,
        actorType: input.actorType ?? 'admin',
        actorId: input.actorId,
      });

      return { visit: mapVisitRow(updatedVisit as VisitRow) };
    } catch (error) {
      if (error instanceof MissingSchemaError && process.env.NODE_ENV !== 'production') {
        return this.fallbackRepo.updateVisitStatus(input);
      }
      throw error;
    }
  }

  async rescheduleVisit(input: {
    visitId: string;
    slotId: string;
    listingId?: string;
    reason?: string;
    actorType?: 'user' | 'admin' | 'system';
    actorId?: string;
  }): Promise<VisitRescheduleResult> {
    try {
      const visit = await this.findVisitById(input.visitId);
      if (!visit) {
        throw new VisitNotFoundError();
      }

      if (!canRescheduleVisit(visit.status)) {
        throw new InvalidVisitTransitionError();
      }

      const currentSlot = await this.getSlotById(visit.slot_id);
      if (!currentSlot) {
        throw new SlotUnavailableError('Slot actual no encontrado');
      }

      ensureInsideCancelWindow(currentSlot.start_time);

      let nextSlot = await this.getSlotById(input.slotId);
      if (!nextSlot) {
        nextSlot = await this.createSyntheticSlot(input.slotId, input.listingId || visit.listing_id);
      }
      if (!nextSlot) {
        throw new SlotUnavailableError();
      }

      const reservedNextSlot = await this.reserveSlot(input.slotId);
      if (!reservedNextSlot) {
        throw new SlotUnavailableError();
      }

      const { data: updatedVisit, error: updateVisitError } = await supabaseAdmin
        .from('visits')
        .update({
          slot_id: input.slotId,
          listing_id: input.listingId || visit.listing_id,
          status: 'confirmed',
          updated_at: nowIso(),
        })
        .eq('id', visit.id)
        .select('id, listing_id, slot_id, user_id, status, idempotency_key, agent_id, created_at')
        .single();

      if (updateVisitError) {
        await supabaseAdmin
          .from('visit_slots')
          .update({ status: 'open', updated_at: nowIso() })
          .eq('id', input.slotId)
          .eq('status', 'confirmed');
        if (isMissingRelationError(updateVisitError)) throw new MissingSchemaError();
        throw updateVisitError;
      }

      const { error: releaseCurrentSlotError } = await supabaseAdmin
        .from('visit_slots')
        .update({ status: 'open', updated_at: nowIso() })
        .eq('id', currentSlot.id)
        .eq('status', 'confirmed');
      if (releaseCurrentSlotError && !isMissingRelationError(releaseCurrentSlotError)) {
        throw releaseCurrentSlotError;
      }

      await this.logStatusHistory({
        visitId: visit.id,
        eventType: 'rescheduled',
        fromStatus: visit.status,
        toStatus: 'confirmed',
        fromSlotId: currentSlot.id,
        toSlotId: input.slotId,
        reason: input.reason,
        actorType: input.actorType ?? 'user',
        actorId: input.actorId,
        metadata: {
          previous_slot_start: currentSlot.start_time,
          next_slot_start: reservedNextSlot.start_time,
        },
      });

      return {
        visit: mapVisitRow(updatedVisit as VisitRow),
        previousSlot: mapSlotRow(currentSlot),
        nextSlot: mapSlotRow(reservedNextSlot),
      };
    } catch (error) {
      if (error instanceof MissingSchemaError && process.env.NODE_ENV !== 'production') {
        return this.fallbackRepo.rescheduleVisit(input);
      }
      throw error;
    }
  }
}

let repoInstance: VisitRepository | null = null;

export function getVisitRepository(): VisitRepository {
  if (repoInstance) return repoInstance;

  const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const forceMemory = process.env.NODE_ENV === 'test' || !hasSupabaseConfig;

  repoInstance = forceMemory ? new InMemoryVisitRepository() : new SupabaseVisitRepository();
  return repoInstance;
}

export { CancelWindowExpiredError, InvalidVisitTransitionError, SlotUnavailableError, VisitNotFoundError };
