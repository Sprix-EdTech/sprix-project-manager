const url = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function run() {
  const r = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'AI Coding Teacher Training',
      portfolio: 'national',  // Fixed from 'national-assessments'
      status: 'On Track',
      objective: 'Conduct teacher training sessions on AI coding curriculum ahead of the first student lessons (week of March 15). Training delivered in Japanese by Taison-san with live Arabic translation by Dr. Hanem.',
      owner: 'Taison / Dr. Hanem',
      progress: 10,
      currentfocus: 'Awaiting MoE confirmation of training date (expected next week). Planning session format and content division between presenters.',
      nextmilestone: 'MoE confirms training schedule',
      targetdate: '2026-03-14',
      startdate: '2026-03-06',
      approvalflow: 'Review',
      lastupdated: '2026-03-06'
    })
  });
  console.log("Insert AI Training:", r.status, await r.text());
}
run();
