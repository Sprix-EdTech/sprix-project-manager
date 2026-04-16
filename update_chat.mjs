const url = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function run() {
  const r = await fetch(`${url}?name=eq.TOFAS%20Award%20Ceremony%20%26%20Internship%20Sponsorship`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      progress: 15,
      currentfocus: 'Finalizing request letter for the Embassy of Japan in Egypt. Workflow: MoE Approval -> Embassy Backing -> JETRO Backing & Seminar Presentation for Corporate Sponsors.',
      nextmilestone: 'Send official letter to Embassy',
      owner: 'K. Matsumoto / S. Sayu',
      lastupdated: new Date().toISOString().split('T')[0]
    })
  });
  console.log("Update via Chat:", r.status, await r.text());
}
run();
