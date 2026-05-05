import { getPool } from '../pool'

export interface SourcingKpis {
  total_results: number
  selected_results: number
  total_clins_sourced: number
  avg_results_per_clin: number
}

export async function getSourcingKpis(): Promise<SourcingKpis> {
  const pool = await getPool()
  const { rows } = await pool.query<SourcingKpis>(
    `
    SELECT
      (SELECT COUNT(*)::int FROM sourcing_results)                                                              AS total_results,
      (SELECT COUNT(*)::int FROM sourcing_results WHERE is_selected)                                            AS selected_results,
      (SELECT COUNT(DISTINCT clin_item_id)::int FROM sourcing_results WHERE clin_item_id IS NOT NULL)           AS total_clins_sourced,
      COALESCE(
        (SELECT COUNT(*)::float / NULLIF(COUNT(DISTINCT clin_item_id), 0)
         FROM sourcing_results
         WHERE clin_item_id IS NOT NULL),
        0
      )::float AS avg_results_per_clin
    `,
  )
  return rows[0]
}

export interface SourcingResultRow {
  id: string
  opportunity_id: string
  opp_title: string | null
  supplier_name: string | null
  retailer_name: string | null
  product_name: string | null
  product_url: string | null
  sku: string | null
  unit_price_cents: number | null
  total_landed_cost_cents: number | null
  bid_price_recommended_cents: number | null
  margin_pct: number | null
  lead_time_days: number | null
  confidence: string | null
  is_selected: boolean | null
  taa_compliant: boolean | null
  buy_american_compliant: boolean | null
  sourced_at: Date | null
}

const SOURCING_RESULTS_SELECT = `
  SELECT
    sr.id,
    sr.opportunity_id,
    o.title AS opp_title,
    s.name  AS supplier_name,
    sr.retailer_name,
    sr.product_name,
    sr.product_url,
    sr.sku,
    sr.unit_price_cents,
    sr.total_landed_cost_cents,
    sr.bid_price_recommended_cents,
    sr.margin_pct,
    sr.lead_time_days,
    sr.confidence,
    sr.is_selected,
    sr.taa_compliant,
    sr.buy_american_compliant,
    sr.sourced_at
  FROM sourcing_results sr
  LEFT JOIN opportunities o ON o.id = sr.opportunity_id
  LEFT JOIN suppliers     s ON s.id = sr.supplier_id
`

export interface ListSourcingResultsOptions {
  limit?: number
  opportunityId?: string
}

export async function listSourcingResults(
  options: ListSourcingResultsOptions = {},
): Promise<SourcingResultRow[]> {
  const { limit = 50, opportunityId } = options
  const pool = await getPool()

  if (opportunityId) {
    const { rows } = await pool.query<SourcingResultRow>(
      `${SOURCING_RESULTS_SELECT}
       WHERE sr.opportunity_id = $1
       ORDER BY sr.sourced_at DESC NULLS LAST`,
      [opportunityId],
    )
    return rows
  }

  const { rows } = await pool.query<SourcingResultRow>(
    `${SOURCING_RESULTS_SELECT}
     ORDER BY sr.sourced_at DESC NULLS LAST
     LIMIT $1`,
    [limit],
  )
  return rows
}

