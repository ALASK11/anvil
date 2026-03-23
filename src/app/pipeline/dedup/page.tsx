// Pipeline: Deduplication — identifying and collapsing duplicate RFPs

const MOCK_STATS = {
  totalRaw: 1243,
  uniqueRfps: 987,
  duplicatesFound: 256,
  dedupRate: '20.6%',
}

const MOCK_DUPLICATE_CLUSTERS = [
  { rfpId: 'RFP-0312', title: 'MRE Supply Contract FY2026', sources: ['SAM.gov', 'FBO Archive'], rawCount: 3, contentHash: 'a7f3c2...e91d' },
  { rfpId: 'RFP-0298', title: 'Office Furniture Bulk Order', sources: ['GSA eBuy', 'SAM.gov'], rawCount: 2, contentHash: 'b2e8d1...4f2a' },
  { rfpId: 'RFP-0287', title: 'Vehicle Parts Solicitation #4401', sources: ['SAM.gov', 'Army Single Face', 'DLA Procurement'], rawCount: 4, contentHash: 'c9a1f0...7b3e' },
  { rfpId: 'RFP-0271', title: 'Medical Equipment Restock', sources: ['FBO Archive', 'GSA eBuy'], rawCount: 2, contentHash: 'd4b7e2...1c8f' },
]

const MOCK_RECENT_RFPS = [
  { id: 'RFP-0312', title: 'MRE Supply Contract FY2026', agency: 'US Army', published: '2026-03-18', due: '2026-04-15', status: 'pending_parse', dupes: 3 },
  { id: 'RFP-0311', title: 'Tactical Radio Batteries', agency: 'USMC', published: '2026-03-17', due: '2026-04-10', status: 'parsed', dupes: 1 },
  { id: 'RFP-0310', title: 'Janitorial Supplies Q3', agency: 'GSA', published: '2026-03-17', due: '2026-04-20', status: 'pending_parse', dupes: 1 },
  { id: 'RFP-0309', title: 'IT Infrastructure Refresh', agency: 'DLA', published: '2026-03-16', due: '2026-04-08', status: 'parsed', dupes: 2 },
  { id: 'RFP-0308', title: 'Safety Equipment Bulk', agency: 'OSHA', published: '2026-03-15', due: '2026-04-12', status: 'no_products', dupes: 1 },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending_parse: 'badge-yellow',
    parsing: 'badge-blue',
    parsed: 'badge-green',
    parse_failed: 'badge-red',
    no_products: 'badge-muted',
  }
  return `badge ${map[status] || 'badge-muted'}`
}

export default async function DedupPage() {
  return (
    <>
      <div className="page-header">
        <h1>Deduplication</h1>
        <p>Collapsing duplicate RFPs found across multiple sources</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Raw Documents</div>
          <div className="card-value">{MOCK_STATS.totalRaw.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Unique RFPs</div>
          <div className="card-value">{MOCK_STATS.uniqueRfps.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-label">Duplicates Found</div>
          <div className="card-value">{MOCK_STATS.duplicatesFound}</div>
        </div>
        <div className="card">
          <div className="card-label">Dedup Rate</div>
          <div className="card-value">{MOCK_STATS.dedupRate}</div>
          <div className="card-sub">Percentage of raw docs that were duplicates</div>
        </div>
      </div>

      {/* Duplicate clusters */}
      <div className="table-container">
        <div className="table-header">Duplicate Clusters</div>
        <table>
          <thead>
            <tr>
              <th>RFP</th>
              <th>Title</th>
              <th>Found In</th>
              <th>Raw Copies</th>
              <th>Content Hash</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DUPLICATE_CLUSTERS.map((c) => (
              <tr key={c.rfpId}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.rfpId}</td>
                <td style={{ fontWeight: 500 }}>{c.title}</td>
                <td>{c.sources.join(', ')}</td>
                <td>{c.rawCount}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.contentHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deduplicated RFPs */}
      <div className="table-container">
        <div className="table-header">Deduplicated RFPs</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Agency</th>
              <th>Published</th>
              <th>Due</th>
              <th>Status</th>
              <th>Dupes</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECENT_RFPS.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.id}</td>
                <td style={{ fontWeight: 500 }}>{r.title}</td>
                <td>{r.agency}</td>
                <td>{r.published}</td>
                <td>{r.due}</td>
                <td><span className={statusBadge(r.status)}>{r.status.replace('_', ' ')}</span></td>
                <td>{r.dupes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
