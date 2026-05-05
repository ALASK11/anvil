import {
  getFunnelCounts,
  getDashboardKpis,
  listRecentBidDecisions,
} from '@/lib/db/queries/dashboard'

export const dynamic = 'force-dynamic'

function decisionBadge(decision: string | null, result: string | null) {
  if (result === 'won') return 'badge badge-green'
  if (result === 'lost') return 'badge badge-red'
  if (result === 'no_award') return 'badge badge-muted'
  if (decision === 'pursue') return 'badge badge-purple'
  if (decision === 'pass') return 'badge badge-muted'
  return 'badge badge-yellow'
}

function decisionLabel(decision: string | null, result: string | null) {
  if (result) return result.replace(/_/g, ' ')
  if (decision) return decision
  return 'pending'
}

function formatDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toISOString().slice(0, 10)
}

export default async function DashboardPage() {
  const [funnel, kpis, recent] = await Promise.all([
    getFunnelCounts(),
    getDashboardKpis(),
    listRecentBidDecisions(10),
  ])

  const stages = [
    { name: 'Opportunities', count: funnel.opportunities },
    { name: 'Parsed', count: funnel.parsed },
    { name: 'Sourced', count: funnel.sourced },
    { name: 'Ranked', count: funnel.ranked },
    { name: 'Reviewed', count: funnel.reviewed },
    { name: 'Submitted', count: funnel.submitted },
  ]

  return (
    <>
      <div className="page-header">
        <h1>Pipeline Dashboard</h1>
        <p>Real-time overview of the Anvil RFP bidding pipeline</p>
      </div>

      <div className="pipeline-funnel">
        {stages.map((stage, i) => (
          <div key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="funnel-stage">
              <div className="funnel-stage-name">{stage.name}</div>
              <div className="funnel-stage-count">{stage.count.toLocaleString()}</div>
            </div>
            {i < stages.length - 1 && <div className="funnel-arrow">&rarr;</div>}
          </div>
        ))}
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Active Sources</div>
          <div className="card-value">{kpis.active_sources}</div>
          <div className="card-sub">Distinct values in opportunities.source</div>
        </div>
        <div className="card">
          <div className="card-label">Pending Review</div>
          <div className="card-value">{kpis.pending_review.toLocaleString()}</div>
          <div className="card-sub">Scored but not decided</div>
        </div>
        <div className="card">
          <div className="card-label">Pursued (30d)</div>
          <div className="card-value">{kpis.pursued_30d.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Win Rate</div>
          <div className="card-value">
            {kpis.win_rate_pct == null ? '—' : `${kpis.win_rate_pct.toFixed(0)}%`}
          </div>
          <div className="card-sub">won / (won + lost)</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">Recent Bid Decisions</div>
        <table>
          <thead>
            <tr>
              <th>RFP</th>
              <th>Agency</th>
              <th>Fit Score</th>
              <th>Decision</th>
              <th>Decided</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.opp_title ?? '—'}</td>
                <td>{r.agency ?? '—'}</td>
                <td>{r.fit_score ?? '—'}</td>
                <td>
                  <span className={decisionBadge(r.decision, r.result)}>
                    {decisionLabel(r.decision, r.result)}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{formatDate(r.decided_at)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}
                >
                  No bid decisions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
