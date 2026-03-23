// Pipeline: Scraping — visibility into raw RFP document ingestion

const MOCK_SOURCES = [
  { id: 1, name: 'SAM.gov', type: 'api', status: 'active', lastRun: '3 min ago', docsScraped: 412, errorRate: '0.2%' },
  { id: 2, name: 'FBO Archive', type: 'html', status: 'active', lastRun: '15 min ago', docsScraped: 287, errorRate: '1.1%' },
  { id: 3, name: 'Army Single Face', type: 'wordpress', status: 'active', lastRun: '1 hr ago', docsScraped: 156, errorRate: '0.5%' },
  { id: 4, name: 'DLA Procurement', type: 'pdf_index', status: 'failing', lastRun: '2 hr ago', docsScraped: 0, errorRate: '100%' },
  { id: 5, name: 'GSA eBuy', type: 'api', status: 'active', lastRun: '5 min ago', docsScraped: 388, errorRate: '0.8%' },
]

const MOCK_RECENT_DOCS = [
  { id: 'RAW-4821', source: 'SAM.gov', title: 'MRE Supply Contract FY2026', contentType: 'application/pdf', size: '2.4 MB', scrapedAt: '3 min ago' },
  { id: 'RAW-4820', source: 'GSA eBuy', title: 'Office Furniture Procurement', contentType: 'text/html', size: '145 KB', scrapedAt: '5 min ago' },
  { id: 'RAW-4819', source: 'SAM.gov', title: 'Vehicle Parts Solicitation', contentType: 'application/pdf', size: '8.1 MB', scrapedAt: '6 min ago' },
  { id: 'RAW-4818', source: 'Army Single Face', title: 'Medical Supplies Q3', contentType: 'image/png', size: '1.2 MB', scrapedAt: '12 min ago' },
  { id: 'RAW-4817', source: 'FBO Archive', title: 'IT Equipment Refresh', contentType: 'text/html', size: '89 KB', scrapedAt: '15 min ago' },
]

export default async function ScrapingPage() {
  return (
    <>
      <div className="page-header">
        <h1>Scraping</h1>
        <p>Raw RFP document ingestion from configured sources</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Active Sources</div>
          <div className="card-value">24</div>
          <div className="card-sub">1 currently failing</div>
        </div>
        <div className="card">
          <div className="card-label">Docs Scraped (24h)</div>
          <div className="card-value">1,243</div>
          <div className="card-sub">Across all sources</div>
        </div>
        <div className="card">
          <div className="card-label">Storage Used</div>
          <div className="card-value">4.2 GB</div>
          <div className="card-sub">GCS raw-rfp-docs bucket</div>
        </div>
      </div>

      {/* Sources table */}
      <div className="table-container">
        <div className="table-header">Scrape Sources</div>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Run</th>
              <th>Docs (24h)</th>
              <th>Error Rate</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SOURCES.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td><span className="badge badge-muted">{s.type}</span></td>
                <td>
                  <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {s.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{s.lastRun}</td>
                <td>{s.docsScraped}</td>
                <td>{s.errorRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent documents */}
      <div className="table-container">
        <div className="table-header">Recently Scraped Documents</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Source</th>
              <th>Title</th>
              <th>Type</th>
              <th>Size</th>
              <th>Scraped</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECENT_DOCS.map((d) => (
              <tr key={d.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.id}</td>
                <td>{d.source}</td>
                <td style={{ fontWeight: 500 }}>{d.title}</td>
                <td><span className="badge badge-muted">{d.contentType}</span></td>
                <td>{d.size}</td>
                <td style={{ color: 'var(--text-muted)' }}>{d.scrapedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
