// RFPs — browse all deduplicated RFPs and their pipeline status

const MOCK_RFPS = [
  { id: 'RFP-0312', title: 'MRE Supply Contract FY2026', agency: 'US Army', published: '2026-03-18', due: '2026-04-15', products: 4, bids: 6, stage: 'review', value: '$4.7M' },
  { id: 'RFP-0311', title: 'Tactical Radio Batteries', agency: 'USMC', published: '2026-03-17', due: '2026-04-10', products: 2, bids: 3, stage: 'ranking', value: '$890K' },
  { id: 'RFP-0310', title: 'Janitorial Supplies Q3', agency: 'GSA', published: '2026-03-17', due: '2026-04-20', products: 12, bids: 0, stage: 'parsing', value: 'TBD' },
  { id: 'RFP-0309', title: 'IT Infrastructure Refresh', agency: 'DLA', published: '2026-03-16', due: '2026-04-08', products: 5, bids: 8, stage: 'submitted', value: '$1.2M' },
  { id: 'RFP-0308', title: 'Safety Equipment Bulk', agency: 'OSHA', published: '2026-03-15', due: '2026-04-12', products: 3, bids: 0, stage: 'sourcing', value: 'TBD' },
  { id: 'RFP-0307', title: 'Safety Equipment Procurement', agency: 'VA', published: '2026-03-14', due: '2026-04-05', products: 1, bids: 0, stage: 'no_match', value: '—' },
  { id: 'RFP-0306', title: 'Uniforms Winter Issue', agency: 'US Navy', published: '2026-03-13', due: '2026-04-18', products: 8, bids: 12, stage: 'review', value: '$2.1M' },
]

function stageBadge(stage: string) {
  const map: Record<string, string> = {
    scraping: 'badge-muted',
    dedup: 'badge-muted',
    parsing: 'badge-blue',
    sourcing: 'badge-blue',
    ranking: 'badge-yellow',
    review: 'badge-purple',
    submitted: 'badge-green',
    no_match: 'badge-red',
  }
  return `badge ${map[stage] || 'badge-muted'}`
}

export default async function RFPPage() {
  return (
    <>
      <div className="page-header">
        <h1>RFPs</h1>
        <p>All deduplicated RFPs and their current pipeline stage</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Total RFPs</div>
          <div className="card-value">987</div>
        </div>
        <div className="card">
          <div className="card-label">Active (In Pipeline)</div>
          <div className="card-value">142</div>
        </div>
        <div className="card">
          <div className="card-label">Submitted</div>
          <div className="card-value">42</div>
        </div>
        <div className="card">
          <div className="card-label">No Match</div>
          <div className="card-value">203</div>
          <div className="card-sub">No available merchant for any line item</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">RFP List</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Agency</th>
              <th>Published</th>
              <th>Due</th>
              <th>Products</th>
              <th>Bids</th>
              <th>Est. Value</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RFPS.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.id}</td>
                <td style={{ fontWeight: 500 }}>{r.title}</td>
                <td>{r.agency}</td>
                <td>{r.published}</td>
                <td>{r.due}</td>
                <td>{r.products}</td>
                <td>{r.bids}</td>
                <td>{r.value}</td>
                <td><span className={stageBadge(r.stage)}>{r.stage.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
