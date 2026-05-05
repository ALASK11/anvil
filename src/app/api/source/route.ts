import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { GoogleAuth, type IdTokenClient } from 'google-auth-library'

interface SourceRequest {
  opportunity_id: string
}

interface SourcingSummary {
  opportunity_id: string
  status?: string
  sourcing_status?: string | null
  sourcing_margin_pct?: number | null
  fit_score?: number | null
  candidates_persisted?: number
  dry_run?: boolean
}

interface SourceResponse {
  ok: boolean
  message: string
  summary?: SourcingSummary
}

let cachedAuth: GoogleAuth | null = null
const tokenClients = new Map<string, IdTokenClient>()

function extractErrorMessage(e: unknown): string {
  if (e && typeof e === 'object') {
    const err = e as { message?: unknown; response?: { data?: unknown } }
    const data = err.response?.data
    if (data && typeof data === 'object' && 'detail' in data) {
      return String((data as { detail: unknown }).detail)
    }
    if (typeof data === 'string') return data
    if (typeof err.message === 'string') return err.message
  }
  return 'Upstream call failed'
}

async function getIdTokenClient(audience: string): Promise<IdTokenClient> {
  if (!cachedAuth) cachedAuth = new GoogleAuth()
  let client = tokenClients.get(audience)
  if (!client) {
    client = await cachedAuth.getIdTokenClient(audience)
    tokenClients.set(audience, client)
  }
  return client
}

/**
 * POST /api/source — calls the upstream sourcing service for one opportunity.
 *
 * Status: not currently invoked from the Next.js UI. The ranking page links
 * users to /pipeline/sourcing?opportunity_id=... to view existing results
 * rather than triggering sourcing on demand. Kept for:
 *   - programmatic invocation (curl, scripts, scheduled jobs)
 *   - integration testing of the OIDC + envelope auth path
 *   - a future "Re-source this opportunity" button if the workflow needs it
 *
 * Required env var: SOURCING_FUNCTION_URL — base URL of the sourcing service
 *   (e.g. https://anvil-sourcing-169801273048.us-central1.run.app). Set on
 *   the Next.js Cloud Run service. The Cloud Run SA also needs
 *   roles/run.invoker on the upstream sourcing service.
 *
 * Upstream contract (separate repo): POST ${SOURCING_FUNCTION_URL}/source
 *   request:  { opportunity_id: string }
 *   response: orchestrator summary on success (sourcing_status, fit_score,
 *             candidates_persisted, ...) OR { opportunity_id,
 *             status: "not_eligible", dry_run } if the opp fails the
 *             eligibility filter.
 *
 * Sync write semantics: any new sourcing_results rows are committed before
 * the 200, so revalidatePath is enough — no follow-up SELECT needed here.
 */
export async function POST(req: Request): Promise<NextResponse<SourceResponse>> {
  let body: Partial<SourceRequest>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const opportunityId = body.opportunity_id
  if (!opportunityId || typeof opportunityId !== 'string') {
    return NextResponse.json({ ok: false, message: 'opportunity_id required' }, { status: 400 })
  }

  const baseUrl = process.env.SOURCING_FUNCTION_URL
  if (!baseUrl) {
    return NextResponse.json(
      { ok: false, message: 'SOURCING_FUNCTION_URL not configured' },
      { status: 500 },
    )
  }

  const audience = baseUrl.replace(/\/$/, '')
  const targetUrl = `${audience}/source`

  let summary: SourcingSummary
  try {
    const client = await getIdTokenClient(audience)
    const upstream = await client.request<SourcingSummary>({
      url: targetUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { opportunity_id: opportunityId },
    })
    summary = upstream.data
  } catch (e) {
    return NextResponse.json({ ok: false, message: extractErrorMessage(e) }, { status: 502 })
  }

  revalidatePath('/pipeline/ranking')

  if (summary.status === 'not_eligible') {
    return NextResponse.json({
      ok: true,
      message: 'Not eligible (failed sourcing filter)',
      summary,
    })
  }

  const count = summary.candidates_persisted ?? 0
  return NextResponse.json({
    ok: true,
    message: `Sourced ${count} candidate${count === 1 ? '' : 's'}`,
    summary,
  })
}
