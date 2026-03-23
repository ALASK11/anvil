// Pipeline: Parsing — extracting structured product descriptions from raw RFPs

const MOCK_STATS = {
  rfpsParsed: 842,
  productsExtracted: 3217,
  avgProductsPerRfp: 3.8,
  parseFailures: 14,
}

const MOCK_PARSED = [
  {
    id: 'PROD-8401',
    rfpId: 'RFP-0312',
    rfpTitle: 'MRE Supply Contract FY2026',
    lineItem: 1,
    description: 'Meal, Ready-to-Eat, Menu A, Case of 12',
    quantity: 50000,
    unit: 'case',
    nsn: '8970-00-149-1094',
    status: 'pending_sourcing',
  },
  {
    id: 'PROD-8402',
    rfpId: 'RFP-0312',
    rfpTitle: 'MRE Supply Contract FY2026',
    lineItem: 2,
    description: 'Meal, Ready-to-Eat, Menu B, Case of 12',
    quantity: 50000,
    unit: 'case',
    nsn: '8970-00-149-1095',
    status: 'pending_sourcing',
  },
  {
    id: 'PROD-8400',
    rfpId: 'RFP-0309',
    rfpTitle: 'IT Infrastructure Refresh',
    lineItem: 1,
    description: 'Server Rack, 42U, Standard 19-inch',
    quantity: 24,
    unit: 'each',
    nsn: null,
    status: 'sourced',
  },
  {
    id: 'PROD-8399',
    rfpId: 'RFP-0309',
    rfpTitle: 'IT Infrastructure Refresh',
    lineItem: 2,
    description: 'UPS Battery Backup, 3000VA, Rack Mount',
    quantity: 24,
    unit: 'each',
    nsn: null,
    status: 'sourcing',
  },
  {
    id: 'PROD-8398',
    rfpId: 'RFP-0307',
    rfpTitle: 'Safety Equipment Procurement',
    lineItem: 1,
    description: 'Hard Hat, Type II, Class E, Hi-Vis Yellow',
    quantity: 500,
    unit: 'each',
    nsn: '8415-01-497-0802',
    status: 'no_match',
  },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending_sourcing: 'badge-yellow',
    sourcing: 'badge-blue',
    sourced: 'badge-green',
    no_match: 'badge-red',
    sourcing_failed: 'badge-red',
  }
  return `badge ${map[status] || 'badge-muted'}`
}

export default async function ParsingPage() {
  return (
    <>
      <div className="page-header">
        <h1>Parsing</h1>
        <p>Extracting structured product descriptions from RFP documents</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">RFPs Parsed</div>
          <div className="card-value">{MOCK_STATS.rfpsParsed.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Products Extracted</div>
          <div className="card-value">{MOCK_STATS.productsExtracted.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Products / RFP</div>
          <div className="card-value">{MOCK_STATS.avgProductsPerRfp}</div>
        </div>
        <div className="card">
          <div className="card-label">Parse Failures</div>
          <div className="card-value" style={{ color: 'var(--red)' }}>{MOCK_STATS.parseFailures}</div>
          <div className="card-sub">Requires manual review</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">Extracted Products</div>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>RFP</th>
              <th>Line #</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>NSN</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PARSED.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.rfpId}</td>
                <td>{p.lineItem}</td>
                <td style={{ fontWeight: 500, maxWidth: '300px' }}>{p.description}</td>
                <td>{p.quantity?.toLocaleString()}</td>
                <td>{p.unit}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.nsn || '—'}</td>
                <td><span className={statusBadge(p.status)}>{p.status.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
