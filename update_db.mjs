const url = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function run() {
  let r = await fetch(`${url}?name=eq.Japanese%20Company%20Internship%20Program`, {
    method: 'PATCH', headers,
    body: JSON.stringify({
      name: 'TOFAS Students Japan Training Program', portfolio: 'people', status: 'On Track',
      progress: 15, owner: 'Nakajima', accountable: 'KD Matsumoto',
      objective: 'Invite top TOFAS Programming students (approx 10 Grade 11s) to Japan to boost motivation and create role models.',
      currentfocus: 'Discussing estimates and refining itinerary with travel agencies (e.g., HIS).',
      nextmilestone: 'Finalize plan and align with MoE', targetdate: '2026-08-15',
      blockers: null, approvalflow: 'Draft'
    })
  });
  console.log("Update Students:", r.status, await r.text());

  r = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({
      name: 'TOFAS Teachers Japan Training Program', portfolio: 'people', status: 'Not Started',
      progress: 0, owner: 'KD Matsumoto', accountable: 'Micky',
      objective: 'Invite outstanding teachers (including principals) to Japan as a reward to increase field engagement with TOFAS.',
      currentfocus: 'Waiting for the student program plan to clarify. Organizing invitation criteria.',
      blockers: 'Waiting for student program resolution before full kick-off',
      nextmilestone: 'Start planning in April', approvalflow: 'Draft'
    })
  });
  console.log("Insert Teachers:", r.status, await r.text());
}
run();
