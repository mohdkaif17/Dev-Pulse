const fs = require('fs');
const http = require('http');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const metricsData = JSON.parse(fs.readFileSync('data/metrics.json'));
  
  // File Structure Check
  const files = [
    'data/metrics.json',
    'logic/interpret.js',
    'logic/changeStory.js',
    'logic/benchmark.js',
    'logic/insights.js',
    'routes/developers.js',
    'routes/metrics.js',
    'routes/manager.js',
    'routes/explorer.js',
    'routes/insights.js',
    'middleware/errorHandler.js',
    'server.js'
  ];
  
  console.log('FILE STRUCTURE CHECK:');
  console.log(`[${metricsData.length === 16 ? 'x' : ' '}] data/metrics.json exists — 16 records`);
  for (let i = 1; i < files.length; i++) {
    console.log(`[${fs.existsSync(files[i]) ? 'x' : ' '}] ${files[i]} exists`);
  }
  
  // Data Check
  const devs = new Set(metricsData.map(d => d.developer_id));
  const months = new Set(metricsData.map(d => d.month));
  const managers = new Set(metricsData.map(d => d.manager_id));
  const teams = new Set(metricsData.map(d => d.team_name));
  
  console.log('\nDATA CHECK:');
  console.log(`[${devs.size === 8 ? 'x' : ' '}] 8 unique developers in metrics.json`);
  console.log(`[${months.size === 2 && months.has('2026-03') && months.has('2026-04') ? 'x' : ' '}] 2 months present: 2026-03 and 2026-04`);
  console.log(`[${managers.size === 3 ? 'x' : ' '}] 3 unique managers: MGR-01, MGR-02, MGR-03`);
  console.log(`[${teams.size === 3 ? 'x' : ' '}] 3 unique teams: Payments API, Checkout Web, Mobile Growth`);
  
  // Endpoint Check
  const health = await fetchUrl('/api/health');
  const allDevs = await fetchUrl('/api/developers');
  const m2 = await fetchUrl('/api/metrics/DEV-002/2026-04');
  const m1 = await fetchUrl('/api/metrics/DEV-001/2026-04');
  const m5 = await fetchUrl('/api/metrics/DEV-005/2026-04');
  const mgr1 = await fetchUrl('/api/manager/MGR-01/2026-04');
  const exp = await fetchUrl('/api/explorer/bug_rate_pct/2026-04');
  const ins = await fetchUrl('/api/insights/2026-04');
  
  console.log('\nENDPOINT CHECK:');
  console.log(`[${health.data.status === 'ok' ? 'x' : ' '}] /api/health returns status ok`);
  console.log(`[${allDevs.data.length === 8 ? 'x' : ' '}] /api/developers returns 8 developers`);
  console.log(`[${m2.data.interpretation.signal === 'warning' ? 'x' : ' '}] /api/metrics/DEV-002/2026-04 returns signal "warning"`);
  console.log(`[${m1.data.interpretation.signal === 'success' ? 'x' : ' '}] /api/metrics/DEV-001/2026-04 returns signal "success"`);
  console.log(`[${m5.data.interpretation.signal === 'info' ? 'x' : ' '}] /api/metrics/DEV-005/2026-04 returns signal "info"`);
  console.log(`[${mgr1.data.developers.length === 3 ? 'x' : ' '}] /api/manager/MGR-01/2026-04 returns 3 developers`);
  console.log(`[${exp.data.ranked.length === 8 ? 'x' : ' '}] /api/explorer/bug_rate_pct/2026-04 returns 8 ranked developers`);
  console.log(`[${ins.data.total >= 3 ? 'x' : ' '}] /api/insights/2026-04 returns at least 3 insights`);
  
  console.log('\nINTERPRETATION CHECK:');
  const m2story = m2.data.interpretation.story.includes('Noah') && m2.data.interpretation.story.includes('%');
  console.log(`[${m2story ? 'x' : ' '}] DEV-002 April story mentions Noah and bug rate`);
  
  const m1story = m1.data.interpretation.story.includes('strong month');
  console.log(`[${m1story ? 'x' : ' '}] DEV-001 April story mentions strong month`);
  
  const m5story = m5.data.interpretation.story.includes('cycle time');
  console.log(`[${m5story ? 'x' : ' '}] DEV-005 April story mentions cycle time`);
  
  const cs = m2.data.changeStory !== null;
  console.log(`[${cs ? 'x' : ' '}] changeStory is not null for April data`);
  
  const bm = m2.data.benchmark && 'team_size' in m2.data.benchmark && m2.data.benchmark.lead_time.position !== undefined;
  console.log(`[${bm ? 'x' : ' '}] benchmark includes team_size and position values`);

  // Testing fetch from React through proxy
  console.log('\nPROXY TEST:');
  fetch('http://localhost:5173/api/developers')
    .then(r => r.json())
    .then(data => {
      console.log(`[${data.length === 8 ? 'x' : ' '}] fetch('/api/developers') from Vite server successful`);
    }).catch(e => {
      console.log('[ ] fetch(/api/developers) from Vite server failed: ' + e.message);
    });
}
run();
