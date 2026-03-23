// Pipeline: Sourcing — finding merchants that sell requested products

const MOCK_STATS = {
  productsSearched: 531,
  matchesFound: 1847,
  avgMatchesPerProduct: 3.5,
  confirmationRate: '72%',
}

const MOCK_RESULTS = [
  {
    id: 'SRC-2201',
    productId: 'PROD-8401',
    description: 'Meal, Ready-to-Eat, Menu A, Case of 12',
    merchant: 'Wornick Company',
    sku: 'MRE-A-12',
    unitPrice: 89.50,
    availability: 'in_stock',
    leadTime: 14,
    confidence: 0.97,
    status: 'confirmed',
    apiSource: 'defense_logistics',
  },
  {
    id: 'SRC-2202',
    productId: 'PROD-8401',
    description: 'Meal, Ready-to-Eat, Menu A, Case of 12',
    merchant: 'Ameriqual Group',
    sku: 'AQ-MRE-A12',
    unitPrice: 92.00,
    availability: 'in_stock',
    leadTime: 21,
    confidence: 0.94,
    status: 'confirmed',
    apiSource: 'defense_logistics',
  },
  {
    id: 'SRC-2203',
    productId: 'PROD-8400',
    description: 'Server Rack, 42U, Standard 19-inch',
    merchant: 'APC by Schneider',
    sku: 'AR3100',
    unitPrice: 1249.99,
    availability: 'in_stock',
    leadTime: 7,
    confidence: 0.91,
    status: 'confirmed',
    apiSource: 'it_distributors',
  },
  {
    id: 'SRC-2204',
    productId: 'PROD-8400',
    description: 'Server Rack, 42U, Standard 19-inch',
    merchant: 'CyberPower',
    sku: 'CR42U11001',
    unitPrice: 1099.00,
    availability: 'backorder',
    leadTime: 30,
    confidence: 0.85,
    status: 'potential',
    apiSource: 'it_distributors',
  },
  {
    id: 'SRC-2205',
    productId: 'PROD-8399',
    description: 'UPS Battery Backup, 3000VA, Rack Mount',
    merchant: 'Eaton',
    sku: '5PX3000RT2U',
    unitPrice: 2150.00,
    availability: 'in_stock',
    leadTime: 5,
    confidence: 0.88,
    status: 'confirmed',
    apiSource: 'it_distributors',
  },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: 'badge-green',
    potential: 'badge-yellow',
    rejected: 'badge-red',
    unavailable: 'badge-muted',
  }
  return `badge ${map[status] || 'badge-muted'}`
}

function availBadge(a: string) {
  const map: Record<string, string> = {
    in_stock: 'badge-green',
    backorder: 'badge-yellow',
    limited: 'badge-orange',
    unavailable: 'badge-red',
  }
  return `badge ${map[a] || 'badge-muted'}`
}

export default async function SourcingPage() {
  return (
    <>
      <div className="page-header">
        <h1>Sourcing</h1>
        <p>Merchant discovery and product matching via sourcing APIs</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Products Searched</div>
          <div className="card-value">{MOCK_STATS.productsSearched}</div>
        </div>
        <div className="card">
          <div className="card-label">Matches Found</div>
          <div className="card-value">{MOCK_STATS.matchesFound.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Matches / Product</div>
          <div className="card-value">{MOCK_STATS.avgMatchesPerProduct}</div>
        </div>
        <div className="card">
          <div className="card-label">Confirmation Rate</div>
          <div className="card-value">{MOCK_STATS.confirmationRate}</div>
          <div className="card-sub">Potential matches verified as available</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">Sourcing Results</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Merchant</th>
              <th>SKU</th>
              <th>Unit Price</th>
              <th>Availability</th>
              <th>Lead Time</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RESULTS.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.id}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.productId}</td>
                <td style={{ fontWeight: 500 }}>{r.merchant}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.sku}</td>
                <td>${r.unitPrice.toFixed(2)}</td>
                <td><span className={availBadge(r.availability)}>{r.availability.replace('_', ' ')}</span></td>
                <td>{r.leadTime}d</td>
                <td>{(r.confidence * 100).toFixed(0)}%</td>
                <td><span className={statusBadge(r.status)}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
