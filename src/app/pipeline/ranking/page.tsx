// Pipeline: Ranking — scoring and stack-ranking bids

const MOCK_STATS = {
  totalBids: 312,
  avgScore: 0.72,
  avgMargin: '18.4%',
  readyForReview: 45,
}

const MOCK_BIDS = [
  {
    id: 'BID-0501',
    rfpId: 'RFP-0312',
    product: 'MRE Menu A, Case of 12',
    merchant: 'Wornick Company',
    rank: 1,
    overall: 0.94,
    margin: 0.91,
    timeliness: 0.95,
    geography: 0.88,
    reliability: 0.98,
    price: 94.50,
    estMargin: '22.1%',
    status: 'pending_review',
  },
  {
    id: 'BID-0502',
    rfpId: 'RFP-0312',
    product: 'MRE Menu A, Case of 12',
    merchant: 'Ameriqual Group',
    rank: 2,
    overall: 0.87,
    margin: 0.82,
    timeliness: 0.78,
    geography: 0.92,
    reliability: 0.95,
    price: 97.00,
    estMargin: '18.3%',
    status: 'pending_review',
  },
  {
    id: 'BID-0498',
    rfpId: 'RFP-0309',
    product: 'Server Rack, 42U',
    merchant: 'APC by Schneider',
    rank: 1,
    overall: 0.91,
    margin: 0.88,
    timeliness: 0.96,
    geography: 0.85,
    reliability: 0.93,
    price: 1399.99,
    estMargin: '15.2%',
    status: 'approved',
  },
  {
    id: 'BID-0499',
    rfpId: 'RFP-0309',
    product: 'Server Rack, 42U',
    merchant: 'CyberPower',
    rank: 2,
    overall: 0.71,
    margin: 0.85,
    timeliness: 0.45,
    geography: 0.80,
    reliability: 0.74,
    price: 1249.00,
    estMargin: '19.8%',
    status: 'rejected',
  },
  {
    id: 'BID-0497',
    rfpId: 'RFP-0309',
    product: 'UPS 3000VA Rack Mount',
    merchant: 'Eaton',
    rank: 1,
    overall: 0.89,
    margin: 0.84,
    timeliness: 0.98,
    geography: 0.82,
    reliability: 0.91,
    price: 2450.00,
    estMargin: '14.0%',
    status: 'submitted',
  },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ranked: 'badge-muted',
    pending_review: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
    submitted: 'badge-purple',
  }
  return `badge ${map[status] || 'badge-muted'}`
}

function scoreColor(score: number): string {
  if (score >= 0.85) return 'var(--green)'
  if (score >= 0.7) return 'var(--yellow)'
  return 'var(--red)'
}

export default async function RankingPage() {
  return (
    <>
      <div className="page-header">
        <h1>Ranking</h1>
        <p>Stack-ranked bids scored by margin, timeliness, geography, and reliability</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Total Bids Ranked</div>
          <div className="card-value">{MOCK_STATS.totalBids}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Overall Score</div>
          <div className="card-value">{(MOCK_STATS.avgScore * 100).toFixed(0)}%</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Est. Margin</div>
          <div className="card-value">{MOCK_STATS.avgMargin}</div>
        </div>
        <div className="card">
          <div className="card-label">Ready for Review</div>
          <div className="card-value">{MOCK_STATS.readyForReview}</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">Ranked Bids</div>
        <table>
          <thead>
            <tr>
              <th>Bid</th>
              <th>RFP</th>
              <th>Product</th>
              <th>Merchant</th>
              <th>Rank</th>
              <th>Overall</th>
              <th>Margin</th>
              <th>Time</th>
              <th>Geo</th>
              <th>Reliability</th>
              <th>Price</th>
              <th>Est. Margin</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_BIDS.map((b) => (
              <tr key={b.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.id}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.rfpId}</td>
                <td style={{ fontWeight: 500 }}>{b.product}</td>
                <td>{b.merchant}</td>
                <td style={{ fontWeight: 700 }}>#{b.rank}</td>
                <td style={{ color: scoreColor(b.overall), fontWeight: 600 }}>{(b.overall * 100).toFixed(0)}%</td>
                <td style={{ color: scoreColor(b.margin) }}>{(b.margin * 100).toFixed(0)}%</td>
                <td style={{ color: scoreColor(b.timeliness) }}>{(b.timeliness * 100).toFixed(0)}%</td>
                <td style={{ color: scoreColor(b.geography) }}>{(b.geography * 100).toFixed(0)}%</td>
                <td style={{ color: scoreColor(b.reliability) }}>{(b.reliability * 100).toFixed(0)}%</td>
                <td>${b.price.toFixed(2)}</td>
                <td>{b.estMargin}</td>
                <td><span className={statusBadge(b.status)}>{b.status.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
