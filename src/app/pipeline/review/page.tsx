// Pipeline: Review — human-in-the-loop approval before bid submission

const MOCK_STATS = {
  pendingReview: 45,
  approvedToday: 12,
  rejectedToday: 3,
  submittedToday: 8,
}

const MOCK_QUEUE = [
  {
    id: 'REV-0201',
    bidId: 'BID-0501',
    rfpId: 'RFP-0312',
    rfpTitle: 'MRE Supply Contract FY2026',
    product: 'MRE Menu A, Case of 12',
    merchant: 'Wornick Company',
    rank: 1,
    proposedPrice: 94.50,
    estMargin: '22.1%',
    overallScore: 0.94,
    dueDate: '2026-04-15',
    decision: 'pending',
  },
  {
    id: 'REV-0202',
    bidId: 'BID-0502',
    rfpId: 'RFP-0312',
    rfpTitle: 'MRE Supply Contract FY2026',
    product: 'MRE Menu B, Case of 12',
    merchant: 'Ameriqual Group',
    rank: 2,
    proposedPrice: 97.00,
    estMargin: '18.3%',
    overallScore: 0.87,
    dueDate: '2026-04-15',
    decision: 'pending',
  },
  {
    id: 'REV-0198',
    bidId: 'BID-0498',
    rfpId: 'RFP-0309',
    rfpTitle: 'IT Infrastructure Refresh',
    product: 'Server Rack, 42U',
    merchant: 'APC by Schneider',
    rank: 1,
    proposedPrice: 1399.99,
    estMargin: '15.2%',
    overallScore: 0.91,
    dueDate: '2026-04-08',
    decision: 'approved',
    reviewer: 'alaski10@gmail.com',
    reviewedAt: '2026-03-20',
  },
  {
    id: 'REV-0199',
    bidId: 'BID-0499',
    rfpId: 'RFP-0309',
    rfpTitle: 'IT Infrastructure Refresh',
    product: 'Server Rack, 42U',
    merchant: 'CyberPower',
    rank: 2,
    proposedPrice: 1249.00,
    estMargin: '19.8%',
    overallScore: 0.71,
    dueDate: '2026-04-08',
    decision: 'rejected',
    reviewer: 'alaski10@gmail.com',
    reviewedAt: '2026-03-20',
    notes: 'Backorder lead time exceeds RFP deadline',
  },
  {
    id: 'REV-0197',
    bidId: 'BID-0497',
    rfpId: 'RFP-0309',
    rfpTitle: 'IT Infrastructure Refresh',
    product: 'UPS 3000VA Rack Mount',
    merchant: 'Eaton',
    rank: 1,
    proposedPrice: 2450.00,
    estMargin: '14.0%',
    overallScore: 0.89,
    dueDate: '2026-04-08',
    decision: 'approved',
    reviewer: 'alaski10@gmail.com',
    reviewedAt: '2026-03-19',
    submittedAt: '2026-03-20',
  },
]

function decisionBadge(d: string) {
  const map: Record<string, string> = {
    pending: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
    needs_revision: 'badge-purple',
  }
  return `badge ${map[d] || 'badge-muted'}`
}

function daysUntil(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'OVERDUE'
  if (diff <= 3) return `${diff}d (urgent)`
  return `${diff}d`
}

function urgencyColor(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'var(--red)'
  if (diff <= 3) return 'var(--orange)'
  if (diff <= 7) return 'var(--yellow)'
  return 'var(--text-muted)'
}

export default async function ReviewPage() {
  return (
    <>
      <div className="page-header">
        <h1>Review &amp; Submit</h1>
        <p>Human review queue — approve or reject ranked bids before formal submission</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Pending Review</div>
          <div className="card-value" style={{ color: 'var(--yellow)' }}>{MOCK_STATS.pendingReview}</div>
        </div>
        <div className="card">
          <div className="card-label">Approved Today</div>
          <div className="card-value" style={{ color: 'var(--green)' }}>{MOCK_STATS.approvedToday}</div>
        </div>
        <div className="card">
          <div className="card-label">Rejected Today</div>
          <div className="card-value" style={{ color: 'var(--red)' }}>{MOCK_STATS.rejectedToday}</div>
        </div>
        <div className="card">
          <div className="card-label">Submitted Today</div>
          <div className="card-value" style={{ color: 'var(--purple)' }}>{MOCK_STATS.submittedToday}</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">Review Queue</div>
        <table>
          <thead>
            <tr>
              <th>Review</th>
              <th>RFP</th>
              <th>Product</th>
              <th>Merchant</th>
              <th>Rank</th>
              <th>Price</th>
              <th>Margin</th>
              <th>Score</th>
              <th>Due In</th>
              <th>Decision</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_QUEUE.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.id}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.rfpId}</td>
                <td style={{ fontWeight: 500 }}>{r.product}</td>
                <td>{r.merchant}</td>
                <td style={{ fontWeight: 700 }}>#{r.rank}</td>
                <td>${r.proposedPrice.toFixed(2)}</td>
                <td>{r.estMargin}</td>
                <td>{(r.overallScore * 100).toFixed(0)}%</td>
                <td style={{ color: urgencyColor(r.dueDate), fontWeight: 500 }}>{daysUntil(r.dueDate)}</td>
                <td><span className={decisionBadge(r.decision)}>{r.decision}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.reviewer || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
