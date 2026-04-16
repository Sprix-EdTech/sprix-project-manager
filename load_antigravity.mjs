const url = 'https://kpkvtyijcoyhozmpxzoj.supabase.co/rest/v1/projects';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

async function run() {
  const projects = [
    {
      name: 'Financial Literacy Curriculum (Grade 10)',
      portfolio: 'content',
      status: 'On Track',
      progress: 5,
      owner: 'Shinya Sayu',
      accountable: 'MoE',
      objective: 'Nationwide provision of a 22-session financial literacy curriculum and assessment via SPRIX Learning platform. Target September 2026.',
      currentfocus: 'MOU signing and curriculum finalization.',
      blockers: null,
      nextmilestone: 'Sign Implementation Agreement',
      targetdate: '2026-09-01',
      approvalflow: 'Draft'
    },
    {
      name: 'Grade 11-12 Textbooks (Egyptian Baccalaureate)',
      portfolio: 'content',
      status: 'Not Started',
      progress: 5,
      owner: 'Sprix',
      accountable: 'MoE',
      objective: 'Develop textbooks and final exams aligned with the Egyptian Baccalaureate, incorporating mandatory TOFAS Mathematics.',
      currentfocus: 'Proposal submission and consultation with MOETE.',
      blockers: null,
      nextmilestone: 'Agree on implementation timeline',
      targetdate: null,
      approvalflow: 'Draft'
    },
    {
      name: 'TOFAS Award Ceremony & Internship Sponsorship',
      portfolio: 'people',
      status: 'On Track',
      progress: 5,
      owner: 'Kodai Matsumoto',
      accountable: 'Miki Sakata',
      objective: 'Secure corporate sponsorships to fund the TOFAS Award Ceremony and provide internship placements for top-performing students.',
      currentfocus: 'Outreach to potential Japanese and local corporate sponsors.',
      blockers: null,
      nextmilestone: 'Finalize sponsor list',
      targetdate: '2026-06-01',
      approvalflow: 'Draft'
    }
  ];

  for (let p of projects) {
    let r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(p) });
    console.log(`Inserted ${p.name}:`, r.status);
  }
}
run();
