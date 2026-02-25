import { createAdminListMeta, type AdminListMeta } from "@lib/admin/contracts";
import { getAdminDbClient } from "@lib/admin/repositories/client";

type VisitStatus = "pending" | "confirmed" | "in_progress" | "completed" | "canceled" | "no_show";

export type AdminVisitRecord = {
  id: string;
  listingId: string;
  slotId: string;
  userId: string;
  status: VisitStatus;
  agentId: string;
  channel: "web" | "whatsapp" | null;
  createdAt: string;
  slot: {
    startTime: string | null;
    endTime: string | null;
  };
};

export type AdminVisitsQuery = {
  page: number;
  page_size: number;
  status?: VisitStatus;
  agent_id?: string;
  listing_id?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
};

function mapVisitRow(
  row: Record<string, unknown> & {
    visit_slots?: { start_time?: string; end_time?: string } | Array<{ start_time?: string; end_time?: string }> | null;
  }
): AdminVisitRecord {
  const slotInfo = Array.isArray(row.visit_slots) ? row.visit_slots[0] : row.visit_slots;

  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    slotId: String(row.slot_id),
    userId: String(row.user_id),
    status: String(row.status) as VisitStatus,
    agentId: String(row.agent_id),
    channel: row.channel === "web" || row.channel === "whatsapp" ? row.channel : null,
    createdAt: String(row.created_at),
    slot: {
      startTime: slotInfo?.start_time ?? null,
      endTime: slotInfo?.end_time ?? null,
    },
  };
}

export async function listAdminVisits(query: AdminVisitsQuery): Promise<{
  items: AdminVisitRecord[];
  meta: AdminListMeta;
}> {
  const client = getAdminDbClient();
  const page = query.page;
  const pageSize = query.page_size;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let slotIdsByDate: string[] | null = null;
  if (query.date_from || query.date_to) {
    let slotsQuery = client.from("visit_slots").select("id").limit(5000);
    if (query.date_from) slotsQuery = slotsQuery.gte("start_time", query.date_from);
    if (query.date_to) slotsQuery = slotsQuery.lte("start_time", query.date_to);

    const { data: slotRows, error: slotError } = await slotsQuery;
    if (slotError) {
      throw new Error(`database_error: ${slotError.message}`);
    }

    slotIdsByDate = (slotRows ?? [])
      .map((row) => String((row as { id?: string }).id || ""))
      .filter(Boolean);
  }

  let visitsQuery = client
    .from("visits")
    .select(
      "id, listing_id, slot_id, user_id, status, agent_id, channel, created_at, visit_slots(start_time,end_time)",
      { count: "exact" }
    );

  if (query.status) visitsQuery = visitsQuery.eq("status", query.status);
  if (query.agent_id) visitsQuery = visitsQuery.eq("agent_id", query.agent_id);
  if (query.listing_id) visitsQuery = visitsQuery.eq("listing_id", query.listing_id);
  if (query.user_id) visitsQuery = visitsQuery.eq("user_id", query.user_id);

  if (query.search) {
    visitsQuery = visitsQuery.or(
      `id.ilike.%${query.search}%,user_id.ilike.%${query.search}%,listing_id.ilike.%${query.search}%`
    );
  }

  if (slotIdsByDate) {
    if (slotIdsByDate.length === 0) {
      return {
        items: [],
        meta: createAdminListMeta({ page, pageSize, total: 0 }),
      };
    }
    visitsQuery = visitsQuery.in("slot_id", slotIdsByDate);
  }

  const { data, error, count } = await visitsQuery
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  return {
    items: ((data ?? []) as Array<Record<string, unknown>>).map((row) => mapVisitRow(row)),
    meta: createAdminListMeta({
      page,
      pageSize,
      total: count ?? 0,
    }),
  };
}

