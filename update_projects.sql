-- ============================================================
-- Sprix Project Manager — Real Project Data Update
-- Run this in Supabase SQL Editor to replace demo data
-- ============================================================

-- Step 1: Delete all existing demo projects
DELETE FROM public.projects;

-- Step 2: Insert real projects
INSERT INTO public.projects (
    name, portfolio, status, progress, owner,
    objective, currentFocus, nextMilestone,
    lastUpdated, approvalFlow
) VALUES

-- === National Assessments ===
(
    'TOFAS Math (Egypt Public Schools - K12)',
    'national', 'On Track', 60, '',
    'Deliver Term 2 math assessments across Egypt K-12 public schools.',
    '', '', '2026-03-01', 'Draft'
),
(
    'TOFAS Programming (Egypt Public Schools - Grade 10)',
    'national', 'On Track', 55, '',
    'Conduct programming assessments for Grade 10 in Egyptian public schools.',
    '', '', '2026-03-01', 'Draft'
),
(
    'TOFAS Programming & Math (Alhussan KSA)',
    'national', 'On Track', 40, '',
    'Deliver combined programming and math assessments for Alhussan KSA.',
    '', '', '2026-03-01', 'Draft'
),
(
    'TOFAS Certificate Sales (EGP 250 Model - Grade 10 Programming)',
    'monetization', 'On Track', 50, '',
    'Drive certificate sales at EGP 250 per certificate for Grade 10 programming graduates.',
    '', '', '2026-03-01', 'Draft'
),
(
    'TOFAS Retake Management',
    'national', 'Not Started', 0, '',
    'Manage and coordinate retake assessments for failed students.',
    '', '', '2026-03-01', 'Draft'
),
(
    'TOFAS Ceremony Planning',
    'national', 'Not Started', 0, '',
    'Plan and execute award ceremonies for TOFAS certificate holders.',
    '', '', '2026-03-01', 'Draft'
),

-- === Platform & Engineering ===
(
    'MoE Portal Development (Dashboard / Analytics System) with EYouth',
    'platform', 'On Track', 45, '',
    'Build the national Ministry of Education portal and analytics dashboard in partnership with EYouth.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Qureo Visual Programming Deployment for EJS',
    'platform', 'On Track', 35, '',
    'Deploy Qureo visual programming platform across EJS school network.',
    '', '', '2026-03-01', 'Draft'
),
(
    'SPL Development for EJS',
    'platform', 'On Track', 40, '',
    'Develop and customize the Sprix Platform for the EJS school network.',
    '', '', '2026-03-01', 'Draft'
),

-- === Content & Publishing ===
(
    'Math Textbook Development (for Grades 1 to 3)',
    'content', 'On Track', 70, '',
    'Author and publish localized math textbooks for Grades 1, 2, and 3.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Programming Textbook Development',
    'content', 'On Track', 55, '',
    'Develop programming curriculum textbooks for K-12.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Science Textbook Development (Baccalaureate)',
    'content', 'Not Started', 0, '',
    'Author science textbooks aligned to the baccalaureate curriculum.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Financial Literacy Textbook Development',
    'content', 'Not Started', 0, '',
    'Develop financial literacy educational materials for schools.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Supplementary Books for Monetization',
    'content', 'On Track', 30, '',
    'Create supplementary learning books available for purchase.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Weekly Assessment Test Development (Grades 1-3)',
    'content', 'On Track', 50, '',
    'Design and publish weekly assessment item banks for Grades 1 through 3.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Advanced Materials for Certificate Buyers',
    'content', 'Not Started', 0, '',
    'Create premium learning resources available exclusively for certificate purchasers.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Students / Parents / Teachers Survey (EJS)',
    'content', 'Not Started', 0, '',
    'Design and deploy surveys targeting students, parents, and teachers in EJS network.',
    '', '', '2026-03-01', 'Draft'
),

-- === People & Org ===
(
    'Japanese Company Internship Program',
    'people', 'On Track', 25, '',
    'Establish a structured internship program for Japanese company collaboration.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Recruiting – IT Senior Specialist / Operations / Accounting',
    'people', 'On Track', 40, '',
    'Hire key staff across IT, Operations, and Accounting functions.',
    '', '', '2026-03-01', 'Draft'
),

-- === Operations & Governance ===
(
    'Data Integration',
    'operations', 'On Track', 30, '',
    'Establish unified data pipelines across assessment, LMS, and analytics systems.',
    '', '', '2026-03-01', 'Draft'
),
(
    'Payment System Integration (Paymob / Instapay)',
    'operations', 'Not Started', 0, '',
    'Integrate Paymob and Instapay payment gateways for certificate and book sales.',
    '', '', '2026-03-01', 'Draft'
);
