const urlProjects = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const urlPortfolios = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/portfolios';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

const projects = [
  { name: 'Kyrgyzstan Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'しげしゅん', progress: 0, currentfocus: 'Schedule adjustment (Around May)', targetdate: '2026-05-31', lastupdated: '2026-03-10' },
  { name: 'Indonesia Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'わたるん', progress: 0, currentfocus: 'Schedule adjustment (Around May)', targetdate: '2026-05-31', lastupdated: '2026-03-10' },
  { name: 'Vietnam Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'ぽんさん', progress: 0, currentfocus: 'Scheduled for March 29', targetdate: '2026-03-29', lastupdated: '2026-03-10' },
  { name: 'Philippines Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'つづさん', progress: 0, currentfocus: 'Around June (along with new semester TOFAS implementation). ⓪ Sharing questionnaires with local partners.', targetdate: '2026-06-30', lastupdated: '2026-03-10' },
  { name: 'Egypt Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'みきおさん', progress: 0, currentfocus: 'Scheduled at EJS in April. Negotiating target grades with Head.', targetdate: '2026-04-30', lastupdated: '2026-03-10' },
  { name: 'Latin America Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation (Brazil/Peru)', owner: 'のむさん', progress: 0, currentfocus: '', targetdate: null, lastupdated: '2026-03-10' },
  { name: 'Morocco Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'わたるん', progress: 0, currentfocus: '', targetdate: null, lastupdated: '2026-03-10' },
  { name: 'Saudi Arabia Survey', portfolio: 'foundation', status: 'Not Started', objective: 'Foundation survey implementation', owner: 'わたるん', progress: 0, currentfocus: '', targetdate: null, lastupdated: '2026-03-10' }
];

async function run() {
  const pResponse = await fetch(urlPortfolios, {
      method: 'POST', headers, body: JSON.stringify({
          id: 'foundation', name: 'Foundation Survey', icon: '📊', color: '#8b5cf6'
      })
  });
  console.log("Insert Portfolio:", pResponse.status, await pResponse.text());

  for (const p of projects) {
    const r = await fetch(urlProjects, { method: 'POST', headers, body: JSON.stringify(p) });
    console.log(`Insert ${p.name}:`, r.status, await r.text());
  }
}
run();
