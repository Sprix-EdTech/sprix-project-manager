const url = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function run() {
  const progress = Math.round((3184950 / 15000000) * 100); // 21%
  const r = await fetch(`${url}?name=eq.TOFAS%20Certificate%20Sales%20(EGP%20250%20Model%20-%20Grade%2010%20Programming)`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      progress: progress,
      currentfocus: `Current Revenue: 3,184,950 EGP / Target: 15,000,000 EGP. Sales Achievement Rate: 21.2%. Total test takers: 839,247.`,
      lastupdated: new Date().toISOString().split('T')[0]
    })
  });
  console.log("Update Sales Project:", r.status, await r.text());
}
run();
