import { getPool } from '../pool'

export interface FunnelCounts {
  opportunities: number
  parsed: number
  sourced: number
  ranked: number
  reviewed: number
  submitted: number
}

export async function getFunnelCounts(): Promise<FunnelCounts> {
  const pool = await getPool()
  const { rows } = await pool.query<FunnelCounts>(
    `
    SELECT
      (SELECT COUNT(*)::int FROM opportunities)                              AS opportunities,
      (SELECT COUNT(*)::int FROM opportunities WHERE parsed_at IS NOT NULL)  AS parsed,
      (SELECT COUNT(DISTINCT opportunity_id)::int FROM sourcing_results)     AS sourced,
      (SELECT COUNT(*)::int FROM bid_outcomes WHERE fit_score IS NOT NULL)   AS ranked,
      (SELECT COUNT(*)::int FROM bid_outcomes WHERE decision IS NOT NULL)    AS reviewed,
      (SELECT COUNT(*)::int FROM bid_outcomes WHERE result IS NOT NULL)      AS submitted
    `,
  )
  return rows[0]
}

export interface DashboardKpis {
  active_sources: number
  pending_review: number
  pursued_30d: number
  win_rate_pct: number | null
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const pool = await getPool()
  const { rows } = await pool.query<DashboardKpis>(
    `
    WITH win_loss AS (
      SELECT
        COUNT(*) FILTER (WHERE result = 'won')::float                AS won,
        COUNT(*) FILTER (WHERE result IN ('won', 'lost'))::float     AS resolved
      FROM bid_outcomes
    )
    SELECT
      (SELECT COUNT(DISTINCT source)::int FROM opportunities)
        AS active_sources,
      (SELECT COUNT(*)::int FROM bid_outcomes
         WHERE decision IS NULL AND fit_score IS NOT NULL)
        AS pending_review,
      (SELECT COUNT(*)::int FROM bid_outcomes
         WHERE decision = 'pursue'
           AND decided_at >= NOW() - INTERVAL '30 days')
        AS pursued_30d,
      (SELECT CASE WHEN resolved > 0
              THEN (won / resolved) * 100
              ELSE NULL END FROM win_loss)::float
        AS win_rate_pct
    `,
  )
  return rows[0]
}

export interface RecentBidDecision {
  id: string
  opportunity_id: string
  opp_title: string | null
  agency: string | null
  decision: string | null
  result: string | null
  fit_score: number | null
  decided_at: Date | null
}

export async function listRecentBidDecisions(limit = 10): Promise<RecentBidDecision[]> {
  const pool = await getPool()
  const { rows } = await pool.query<RecentBidDecision>(
    `
    SELECT
      bo.id,
      bo.opportunity_id,
      o.title  AS opp_title,
      o.agency AS agency,
      bo.decision,
      bo.result,
      bo.fit_score,
      bo.decided_at
    FROM bid_outcomes bo
    LEFT JOIN opportunities o ON o.id = bo.opportunity_id
    WHERE bo.decided_at IS NOT NULL
    ORDER BY bo.decided_at DESC
    LIMIT $1
    `,
    [limit],
  )
  return rows
}
