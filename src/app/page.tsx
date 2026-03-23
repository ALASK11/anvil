// Dashboard — Pipeline overview

const MOCK_STAGES = [
  { name: 'Scraped', count: 1243 },
  { name: 'Deduped', count: 987 },
  { name: 'Parsed', count: 842 },
  { name: 'Sourced', count: 531 },
  { name: 'Ranked', count: 312 },
  { name: 'Reviewed', count: 87 },
  { name: 'Submitted', count: 42 },
]

const MOCK_RECENT_RUNS = [
  { id: 1, stage: 'scraping', status: 'completed', input: 150, output: 148, time: '2 min ago' },
  { id: 2, stage: 'dedup', status: 'completed', input: 148, output: 132, time: '5 min ago' },
  { id: 3, stage: 'parsing', status: 'running', input: 132, output: 89, time: '8 min ago' },
  { id: 4, stage: 'sourcing', status: 'failed', input: 50, output: 0, time: '12 min ago' },
  { id: 5, stage: 'ranking', status: 'completed', input: 200, output: 200, time: '1 hr ago' },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: 'badge-green',
    running: 'badge-blue',
    failed: 'badge-red',
    partial: 'badge-yellow',
  }
  return `badge ${map[status] || 'badge-muted'}`
}

export default function DashboardPage() {
  return (
    <>
      <div className="page-header">
        <h1>Pipeline Dashboard</h1>
        <p>Real-time overview of the Anvil RFP bidding pipeline</p>
      </div>

      {/* Funnel */}
      <div className="pipeline-funnel">
        {MOCK_STAGES.map((stage, i) => (
          <div key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="funnel-stage">
              <div className="funnel-stage-name">{stage.name}</div>
              <div className="funnel-stage-count">{stage.count.toLocaleString()}</div>
            </div>
            {i < MOCK_STAGES.length - 1 && <div className="funnel-arrow">&rarr;</div>}
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="card-grid">
        <div className="card">
          <div className="card-label">Active Sources</div>
          <div className="card-value">24</div>
          <div className="card-sub">3 failing</div>
        </div>
        <div className="card">
          <div className="card-label">Pending Review</div>
          <div className="card-value">45</div>
          <div className="card-sub">12 high-margin</div>
        </div>
        <div className="card">
          <div className="card-label">Bids Submitted (30d)</div>
          <div className="card-value">312</div>
          <div className="card-sub">$2.4M total value</div>
        </div>
        <div className="card">
          <div className="card-label">Win Rate</div>
          <div className="card-value">34%</div>
          <div className="card-sub">Up 2% from last month</div>
        </div>
      </div>

      {/* Recent pipeline runs */}
      <div className="table-container">
        <div className="table-header">Recent Pipeline Runs</div>
        <table>
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Input</th>
              <th>Output</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECENT_RUNS.map((run) => (
              <tr key={run.id}>
                <td>#{run.id}</td>
                <td>{run.stage}</td>
                <td><span className={statusBadge(run.status)}>{run.status}</span></td>
                <td>{run.input}</td>
                <td>{run.output}</td>
                <td style={{ color: 'var(--text-muted)' }}>{run.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
