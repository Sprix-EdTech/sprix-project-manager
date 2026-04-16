const url = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

(async () => {
    let r = await fetch(url, { method: 'POST', headers, body: JSON.stringify({
      name: 'TOFAS Teachers Japan Training Program', portfolio: 'people', status: 'Not Started',
      progress: 0, owner: 'KD Matsumoto', accountable: 'Micky', objective: 'Invite outstanding teachers (including principals) to Japan as a reward to increase field engagement with TOFAS.',
      currentFocus: 'Waiting for the student program plan to clarify. Organizing invitation criteria.', blockers: 'Waiting for student program resolution before full kick-off',
      nextMilestone: 'Start planning in April', approvalFlow: 'Draft'
    })});
    console.log(await r.text());
})();
