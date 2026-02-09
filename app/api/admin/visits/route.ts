import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import { requireAdminSession } from "@lib/admin/guards";
import { listAdminVisits } from "@lib/admin/repositories/visits.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const optionalString = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}, z.string().optional());

const positiveIntWithDefault = (
  defaultValue: number,
  { min = 1, max = 500 }: { min?: number; max?: number } = {}
) =>
  z.preprocess((value) => {
    if (value === null || value === undefined || value === "") return defaultValue;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }, z.number().int().min(min).max(max));

const QuerySchema = z.object({
  page: positiveIntWithDefault(1),
  page_size: positiveIntWithDefault(50),
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "canceled", "no_show"]).optional(),
  agent_id: optionalString,
  listing_id: optionalString,
  user_id: optionalString,
  date_from: optionalString,
  date_to: optionalString,
  search: optionalString,
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request, "viewer");
    if (auth.response) {
      return auth.response;
    }

    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return adminError("rate_limited", "Demasiadas solicitudes", {
        status: 429,
        details: { retryAfter: rateLimitResult.retryAfter ?? 60 },
      });
    }

    const parsedQuery = QuerySchema.safeParse({
      page: request.nextUrl.searchParams.get("page"),
      page_size: request.nextUrl.searchParams.get("page_size"),
      status: request.nextUrl.searchParams.get("status"),
      agent_id: request.nextUrl.searchParams.get("agent_id"),
      listing_id: request.nextUrl.searchParams.get("listing_id"),
      user_id: request.nextUrl.searchParams.get("user_id"),
      date_from: request.nextUrl.searchParams.get("date_from"),
      date_to: request.nextUrl.searchParams.get("date_to"),
      search: request.nextUrl.searchParams.get("search"),
    });

    if (!parsedQuery.success) {
      return adminError("invalid_query", "Query inválida", {
        status: 400,
        details: parsedQuery.error.errors,
      });
    }

    const result = await listAdminVisits(parsedQuery.data);
    return adminOk(result.items, { meta: result.meta });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (message.startsWith("server_misconfigured:")) {
      return adminError("server_misconfigured", message.replace("server_misconfigured:", "").trim(), {
        status: 500,
      });
    }

    if (message.startsWith("database_error:")) {
      return adminError("database_error", message.replace("database_error:", "").trim(), {
        status: 500,
      });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}

