import Link from 'next/link'
import { getSourcingKpis, listSourcingResults } from '@/lib/db/queries/sourcing'

export const dynamic = 'force-dynamic'

function shortId(id: string) {
  return id.slice(0, 8)
}

function formatCents(cents: number | null) {
  if (cents == null) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function confidenceBadge(c: string | null) {
  const map: Record<string, string> = {
    high: 'badge-green',
    medium: 'badge-yellow',
    low: 'badge-red',
  }
  return `badge ${(c && map[c]) || 'badge-muted'}`
}

function isHttpUrl(url: string | null): url is string {
  return !!url && /^https?:\/\//i.test(url)
}

interface PageProps {
  searchParams: Promise<{ opportunity_id?: string | string[] }>
}

export default async function SourcingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawOppId = params.opportunity_id
  const opportunityId = Array.isArray(rawOppId) ? rawOppId[0] : rawOppId

  const [kpis, results] = await Promise.all([
    getSourcingKpis(),
    listSourcingResults({ limit: 50, opportunityId }),
  ])
  const selectedRate =
    kpis.total_results > 0
      ? ((kpis.selected_results / kpis.total_results) * 100).toFixed(0)
      : '0'

  return (
    <>
      <div className="page-header">
        <h1>Sourcing</h1>
        <p>Supplier candidates discovered for opportunities and CLIN items</p>
      </div>

      {opportunityId && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.75rem',
          }}
        >
          <span>
            Filtered to opportunity{' '}
            <code style={{ fontFamily: 'monospace' }}>{shortId(opportunityId)}</code>
          </span>
          <Link href="/pipeline/sourcing" style={{ color: 'var(--accent)' }}>
            clear filter
          </Link>
        </div>
      )}

      <div className="card-grid">
        <div className="card">
          <div className="card-label">CLINs Sourced</div>
          <div className="card-value">{kpis.total_clins_sourced.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Sourcing Results</div>
          <div className="card-value">{kpis.total_results.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Results / CLIN</div>
          <div className="card-value">{kpis.avg_results_per_clin.toFixed(1)}</div>
        </div>
        <div className="card">
          <div className="card-label">Selected Rate</div>
          <div className="card-value">{selectedRate}%</div>
          <div className="card-sub">selected / total (all opps)</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          {opportunityId ? `Sourcing Results — ${shortId(opportunityId)}` : 'Recent Sourcing Results'}
        </div>
        <table>
          <thead>
            <tr>
              <th>Opp</th>
              <th>Opp Title</th>
              <th>Supplier</th>
              <th>Retailer</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit</th>
              <th>Landed</th>
              <th>Bid Reco</th>
              <th>Margin</th>
              <th>Lead</th>
              <th>Conf.</th>
              <th>Selected</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{shortId(r.opportunity_id)}</td>
                <td>{r.opp_title ?? '—'}</td>
                <td style={{ fontWeight: 500 }}>{r.supplier_name ?? '—'}</td>
                <td>{r.retailer_name ?? '—'}</td>
                <td>
                  {isHttpUrl(r.product_url) ? (
                    <a
                      href={r.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent)' }}
                    >
                      {r.product_name ?? 'view'}
                    </a>
                  ) : (
                    r.product_name ?? '—'
                  )}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.sku ?? '—'}</td>
                <td>{formatCents(r.unit_price_cents)}</td>
                <td>{formatCents(r.total_landed_cost_cents)}</td>
                <td>{formatCents(r.bid_price_recommended_cents)}</td>
                <td>{r.margin_pct == null ? '—' : `${r.margin_pct.toFixed(1)}%`}</td>
                <td>{r.lead_time_days == null ? '—' : `${r.lead_time_days}d`}</td>
                <td><span className={confidenceBadge(r.confidence)}>{r.confidence ?? '—'}</span></td>
                <td>{r.is_selected ? <span className="badge badge-green">yes</span> : '—'}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={13} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  {opportunityId
                    ? 'No sourcing results for this opportunity yet.'
                    : 'No sourcing results yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
