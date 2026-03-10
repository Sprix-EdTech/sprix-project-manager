// ============================================
// Sprix EdTech — App Logic (Enhanced v2)
// ============================================
(function () {
    'use strict';

    // --- Auth ---
    const AUTH_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'; // sha256('1234')

    async function sha256(str) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function checkAuth() {
        if (sessionStorage.getItem('sprix-pm-auth') === 'true') { showApp(); return; }
        document.getElementById('authOverlay').classList.remove('hidden');
    }

    function showApp() {
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('appLayout').style.display = 'flex';
        init();
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadLanguage();
        setLanguage(currentLang);
        const btn = document.getElementById('btnAuth');
        const inp = document.getElementById('authPassword');
        btn.addEventListener('click', doAuth);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); });
        checkAuth();
    });

    async function doAuth() {
        const pw = document.getElementById('authPassword').value;
        const hash = await sha256(pw);
        if (hash === AUTH_HASH) {
            sessionStorage.setItem('sprix-pm-auth', 'true');
            showApp();
        } else {
            document.getElementById('authError').classList.add('show');
            document.getElementById('authPassword').value = '';
            setTimeout(() => document.getElementById('authError').classList.remove('show'), 3000);
        }
    }

    // --- State ---
    let currentView = 'hub';
    let currentPortfolio = null;
    let activeFilters = { status: [], owner: [] };
    let searchQuery = '';
    let sortColumn = null;
    let sortDirection = 'asc';
    let isDark = false;
    let projects = [];
    let fontSizeLevel = 0;
    const FONT_SIZES = [14, 16, 18];

    // --- Supabase Config ---
    const SUPABASE_URL = 'https://kpkvtyijcoyhozmpxzoj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwa3Z0eWlqY295aG96bXB4em9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTI1NDYsImV4cCI6MjA4Nzk4ODU0Nn0.mvuDdctcDzR8_RbO92fELGJdQfgLOmzAXZGfdlcPsQ0';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const $ = id => document.getElementById(id);

    async function init() {
        await loadPortfolios();
        await loadProjects();
        setupSidebar();
        setupTheme();
        setupSearch();
        setupFilters();
        setupViewTabs();
        setupModal();
        setupCrud();
        setupPortfolioCrud();
        setupSettings();
        renderSidebarPortfolios();
        renderHub();
        updateBlockerCount();
        updateBadges();
        startClocks();
        loadFontSize();
        setupRipple();
        setupMagnetic();
    }

    // --- Data Persistence (Supabase) ---
    async function loadPortfolios() {
        const { data, error } = await supabase.from('portfolios').select('*');
        if (!error && data) PORTFOLIOS = data;
    }

    async function loadProjects() {
        const { data, error } = await supabase.from('projects').select('*');
        if (!error && data) projects = data;
    }

    // --- Refresh ---
    window.refreshCurrentView = function () {
        updateBadges();
        updateBlockerCount();
        renderSidebarPortfolios();
        if (currentView === 'hub') renderHub();
        else if (currentView === 'table') renderTable();
        else if (currentView === 'kanban') renderKanban();
        else if (currentView === 'timeline') renderTimeline();
    };

    // ========== SIDEBAR ==========
    function setupSidebar() {
        $('hamburgerBtn').addEventListener('click', () => toggleSidebar(true));
        $('sidebarClose').addEventListener('click', () => toggleSidebar(false));
        $('sidebarOverlay').addEventListener('click', () => toggleSidebar(false));
        // Non-portfolio nav items
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            if (!item.dataset.portfolio) {
                item.addEventListener('click', e => {
                    e.preventDefault();
                    navigateTo(item.dataset.view, null);
                    toggleSidebar(false);
                });
            }
        });
    }

    function toggleSidebar(open) {
        $('sidebar').classList.toggle('open', open);
        $('sidebarOverlay').classList.toggle('show', open);
    }

    function renderSidebarPortfolios() {
        const container = $('portfolioNavItems');
        container.innerHTML = PORTFOLIOS.map(pf => {
            const count = projects.filter(p => p.portfolio === pf.id).length;
            const isActive = currentView === 'table' && currentPortfolio === pf.id;
            return `<a href="#" class="nav-item${isActive ? ' active' : ''}" data-view="portfolio" data-portfolio="${pf.id}">
            <span class="nav-icon">${pf.icon}</span>
            <span>${t('pf.' + pf.id) || pf.name}</span>
            <span class="nav-badge">${count}</span>
            <div class="nav-actions">
                <button class="nav-item-edit" onclick="event.preventDefault();event.stopPropagation();window._openPfCrudModal('${pf.id}')" title="Edit">✏️</button>
                <button class="nav-item-delete" onclick="event.preventDefault();event.stopPropagation();window._deletePortfolio('${pf.id}')" title="Delete">✕</button>
            </div>
        </a>`;
        }).join('');
        container.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                if (e.target.closest('.nav-actions')) return;
                navigateTo('portfolio', item.dataset.portfolio);
                toggleSidebar(false);
            });
        });
    }

    function navigateTo(view, portfolio) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        if (view === 'portfolio' && portfolio) {
            const el = document.querySelector(`#portfolioNavItems .nav-item[data-portfolio="${portfolio}"]`);
            if (el) el.classList.add('active');
        } else {
            const el = document.querySelector(`.nav-item[data-view="${view}"]:not([data-portfolio])`);
            if (el) el.classList.add('active');
        }

        if (view === 'hub') {
            currentView = 'hub'; currentPortfolio = null;
            $('pageTitle').textContent = t('nav.hub');
            showView('viewHub'); renderHub();
        } else if (view === 'portfolio') {
            currentView = 'table'; currentPortfolio = portfolio;
            const pf = PORTFOLIOS.find(p => p.id === portfolio);
            $('pageTitle').textContent = pf ? (t('pf.' + pf.id) || pf.name) : 'Projects';
            showView('viewTable'); renderTable(); syncTabs('table');
        } else if (view === 'all-table') {
            currentView = 'table'; currentPortfolio = null;
            $('pageTitle').textContent = t('nav.allTable');
            showView('viewTable'); renderTable(); syncTabs('table');
        } else if (view === 'all-kanban') {
            currentView = 'kanban'; currentPortfolio = null;
            $('pageTitle').textContent = t('nav.kanban');
            showView('viewKanban'); renderKanban(); syncTabs('kanban');
        } else if (view === 'all-timeline') {
            currentView = 'timeline'; currentPortfolio = null;
            $('pageTitle').textContent = t('nav.timeline');
            showView('viewTimeline'); renderTimeline(); syncTabs('timeline');
        } else if (view === 'settings') {
            currentView = 'settings'; currentPortfolio = null;
            $('pageTitle').textContent = t('settings.title');
            showView('viewSettings');
        }
    }

    function syncTabs(activeTab) {
        document.querySelectorAll('#sharedViewTabs .view-tab').forEach(vt => vt.classList.toggle('active', vt.dataset.tab === activeTab));
    }

    function showView(id) {
        document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
        $(id).style.display = 'block';
        const tabViews = ['viewTable', 'viewKanban', 'viewTimeline'];
        const tabs = $('sharedViewTabs');
        if (tabs) tabs.style.display = tabViews.includes(id) ? 'flex' : 'none';
    }

    // ========== THEME ==========
    function setupTheme() {
        const saved = localStorage.getItem('sprix-pm-theme');
        if (saved === 'dark') { isDark = true; applyTheme(); }
    }

    window._changeTheme = function () {
        isDark = $('themeSelect').value === 'dark';
        applyTheme();
        localStorage.setItem('sprix-pm-theme', isDark ? 'dark' : 'light');
    };

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if ($('themeSelect')) $('themeSelect').value = isDark ? 'dark' : 'light';
        if (currentView === 'hub') { drawStatusChart(); drawProgressChart(); }
        if (currentView === 'timeline') renderTimeline();
    }

    // ========== SEARCH ==========
    function setupSearch() {
        $('searchInput').addEventListener('input', e => {
            searchQuery = e.target.value.toLowerCase();
            if (currentView === 'hub') renderHub();
            else if (currentView === 'table') renderTable();
            else if (currentView === 'kanban') renderKanban();
        });
    }

    // ========== FILTERS ==========
    function setupFilters() {
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', e => {
                e.stopPropagation();
                toggleFilterDropdown(pill.dataset.filter, pill);
            });
        });
        document.addEventListener('click', () => { $('filterDropdown').style.display = 'none'; });
        $('filterClear').addEventListener('click', () => {
            const type = $('filterDropdownTitle').textContent.toLowerCase();
            if (activeFilters[type]) activeFilters[type] = [];
            renderFilterDropdown(type); applyFilters();
        });
    }

    function toggleFilterDropdown(type, pill) {
        const dd = $('filterDropdown');
        const isVisible = dd.style.display !== 'none' && $('filterDropdownTitle').textContent.toLowerCase() === type;
        if (isVisible) { dd.style.display = 'none'; return; }
        $('filterDropdownTitle').textContent = type.charAt(0).toUpperCase() + type.slice(1);
        renderFilterDropdown(type);
        const rect = pill.getBoundingClientRect();
        dd.style.top = rect.bottom + 4 + 'px';
        dd.style.right = (window.innerWidth - rect.right) + 'px';
        dd.style.left = 'auto';
        dd.style.display = 'block';
    }

    function renderFilterDropdown(type) {
        const body = $('filterDropdownBody');
        let options = [];
        if (type === 'status') options = STATUS_LIST;
        else if (type === 'owner') options = [...new Set(projects.map(p => p.owner))].sort();
        body.innerHTML = options.map(opt => {
            const sel = (activeFilters[type] || []).includes(opt) ? ' selected' : '';
            return `<div class="filter-option${sel}" data-value="${opt}" onclick="window._toggleFilter('${type}','${opt.replace(/'/g, "\\'")}')">
            <span class="filter-check">${sel ? '✓' : ''}</span><span>${opt}</span></div>`;
        }).join('');
    }

    window._toggleFilter = function (type, value) {
        if (!activeFilters[type]) activeFilters[type] = [];
        const idx = activeFilters[type].indexOf(value);
        if (idx >= 0) activeFilters[type].splice(idx, 1);
        else activeFilters[type].push(value);
        renderFilterDropdown(type);
        applyFilters();
        document.querySelectorAll('.filter-pill').forEach(p => {
            const t2 = p.dataset.filter;
            p.classList.toggle('active', activeFilters[t2] && activeFilters[t2].length > 0);
        });
    };

    function applyFilters() {
        if (currentView === 'table') renderTable();
        else if (currentView === 'kanban') renderKanban();
        else if (currentView === 'hub') renderHub();
    }

    function getFilteredProjects() {
        let list = projects;
        if (currentPortfolio) list = list.filter(p => p.portfolio === currentPortfolio);
        if (searchQuery) {
            list = list.filter(p =>
                (p.name && p.name.toLowerCase().includes(searchQuery)) ||
                (p.objective && p.objective.toLowerCase().includes(searchQuery)) ||
                (p.owner && p.owner.toLowerCase().includes(searchQuery))
            );
        }
        if (activeFilters.status && activeFilters.status.length) list = list.filter(p => activeFilters.status.includes(p.status));
        if (activeFilters.owner && activeFilters.owner.length) list = list.filter(p => activeFilters.owner.includes(p.owner));
        return list;
    }

    // ========== VIEW TABS ==========
    function setupViewTabs() {
        document.querySelectorAll('#sharedViewTabs .view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const t2 = tab.dataset.tab;
                if (t2 === 'table') { showView('viewTable'); currentView = 'table'; renderTable(); }
                else if (t2 === 'kanban') { showView('viewKanban'); currentView = 'kanban'; renderKanban(); }
                else if (t2 === 'timeline') { showView('viewTimeline'); currentView = 'timeline'; renderTimeline(); }
                syncTabs(t2);
            });
        });
    }

    // ========== BADGES ==========
    function updateBadges() {
        PORTFOLIOS.forEach(pf => {
            const badges = document.querySelectorAll(`#portfolioNavItems .nav-item[data-portfolio="${pf.id}"] .nav-badge`);
            badges.forEach(b => b.textContent = projects.filter(p => p.portfolio === pf.id).length);
        });
    }
    function updateBlockerCount() {
        const c = getFilteredProjects().filter(p => p.blockers && p.blockers.trim()).length;
        $('blockerCount').textContent = c;
    }

    // ========== LIVE CLOCKS ==========
    function startClocks() {
        updateClocks();
        setInterval(updateClocks, 1000);
    }

    function updateClocks() {
        const now = new Date();
        const optTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const optDate = { month: 'short', day: 'numeric' };

        const jp = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
        $('clockJP').textContent = jp.toLocaleTimeString('en-GB', optTime);
        $('clockJPDate').textContent = jp.toLocaleDateString('en-US', optDate);

        const eg = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
        $('clockEG').textContent = eg.toLocaleTimeString('en-GB', optTime);
        $('clockEGDate').textContent = eg.toLocaleDateString('en-US', optDate);
    }

    // ========== FONT SIZE ==========
    window._toggleFontSize = function () {
        fontSizeLevel = (fontSizeLevel + 1) % 3;
        const scale = fontSizeLevel === 0 ? 1 : (fontSizeLevel === 1 ? 1.08 : 1.16);
        document.documentElement.style.setProperty('--font-scale', scale);
        const btn = $('fontSizeBtn');
        btn.classList.toggle('active', fontSizeLevel > 0);
        localStorage.setItem('sprix-pm-fontsize', fontSizeLevel);
    };
    function loadFontSize() {
        const s = localStorage.getItem('sprix-pm-fontsize');
        if (s) {
            fontSizeLevel = parseInt(s) || 0;
            const scale = fontSizeLevel === 0 ? 1 : (fontSizeLevel === 1 ? 1.08 : 1.16);
            document.documentElement.style.setProperty('--font-scale', scale);
            if (fontSizeLevel > 0) $('fontSizeBtn')?.classList.add('active');
        }
    }

    // ========== STAT CLICK ==========
    window._statClick = function (stat) {
        if (stat === 'total') {
            activeFilters.status = [];
        } else {
            activeFilters.status = [stat];
        }
        navigateTo('all-table', null);
        document.querySelectorAll('.filter-pill').forEach(p => {
            p.classList.toggle('active', activeFilters[p.dataset.filter] && activeFilters[p.dataset.filter].length > 0);
        });
    };

    // ========== HUB ==========
    function renderHub() {
        const all = getFilteredProjects();
        const tot = all.length;
        const ot = all.filter(p => p.status === 'On Track').length;
        const ar = all.filter(p => p.status === 'At Risk').length;
        const of2 = all.filter(p => p.status === 'Off Track').length;
        const dn = all.filter(p => p.status === 'Done').length;

        // Re-animate the values without destroying the DOM structure by resetting to '0'
        observeAndAnimate('statsBar', () => {
            animateCount($('statTotalVal'), tot);
            animateCount($('statOnTrackVal'), ot);
            animateCount($('statAtRiskVal'), ar);
            animateCount($('statOffTrackVal'), of2);
            animateCount($('statDoneVal'), dn);
        });

        renderPortfolioCards();

        const sCtx = $('chartStatus')?.getContext('2d');
        if (sCtx) sCtx.clearRect(0, 0, 300, 300);
        const pCtx = $('chartProgress')?.getContext('2d');
        if (pCtx) pCtx.clearRect(0, 0, 500, 300);

        observeAndAnimate('chartStatus', animateStatusChart);
        observeAndAnimate('chartProgress', animateProgressChart);

        renderBlockers();
        renderMilestones();
    }
    function animateCount(el, target) {
        const targetStr = String(target);
        if (el.dataset.val === targetStr) return;
        el.dataset.val = targetStr;

        // Try to reuse existing DOM structure to avoid flickering and overlapping animations
        const existingInners = el.querySelectorAll('.odometer-digit-inner');
        const numDigits = targetStr.replace(/[^0-9]/g, '').length;
        if (existingInners.length === numDigits && existingInners.length > 0 && targetStr !== '0') {
            let digitIndex = 0;
            for (let i = 0; i < targetStr.length; i++) {
                const digitStr = targetStr[i];
                if (!isNaN(parseInt(digitStr))) {
                    const inner = existingInners[digitIndex++];
                    const digit = parseInt(digitStr);
                    const delay = (targetStr.length - i - 1) * 0.1;
                    inner.style.transition = `transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
                    inner.style.transform = `translateY(-${digit * 1.1}em)`;
                }
            }
            return;
        }

        let html = '';
        for (let i = 0; i < targetStr.length; i++) {
            const digitStr = targetStr[i];
            if (isNaN(parseInt(digitStr))) {
                html += `<span class="odometer-digit">${digitStr}</span>`;
                continue;
            }
            let col = '';
            for (let j = 0; j <= 9; j++) col += `<span class="odometer-digit-num">${j}</span>`;
            html += `<span class="odometer-digit"><span class="odometer-digit-inner" style="transform:translateY(0em)">${col}</span></span>`;
        }
        el.innerHTML = html;

        // Trigger reflow
        void el.offsetWidth;

        const inners = el.querySelectorAll('.odometer-digit-inner');
        inners.forEach((inner, i) => {
            const digitStr = targetStr[i];
            if (!isNaN(parseInt(digitStr))) {
                const digit = parseInt(digitStr);
                const delay = (targetStr.length - i - 1) * 0.1;
                inner.style.transition = `transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
                inner.style.transform = `translateY(-${digit * 1.1}em)`;
            }
        });
    }

    function renderPortfolioCards() {
        const allFiltered = getFilteredProjects();
        $('portfolioCards').innerHTML = PORTFOLIOS.map(pf => {
            const ps = allFiltered.filter(p => p.portfolio === pf.id);
            const avg = ps.length ? Math.round(ps.reduce((s, p) => s + p.progress, 0) / ps.length) : 0;
            const sc = {}; STATUS_LIST.forEach(s => sc[s] = 0); ps.forEach(p => sc[p.status]++);
            return `<div class="portfolio-card" data-portfolio="${pf.id}" onclick="window._navPortfolio('${pf.id}')">
            <div class="pcard-header"><span class="pcard-icon" style="font-size:28px">${pf.icon}</span><span class="pcard-count">${ps.length} ${t('hub.projects')}</span></div>
            <div class="pcard-title">${t('pf.' + pf.id) || pf.name}</div>
            <div class="pcard-progress"><div class="pcard-progress-header"><span class="pcard-progress-label">${t('hub.avgProgress')}</span><span class="pcard-progress-value">${avg}%</span></div><div class="pcard-progress-bar"><div class="pcard-progress-fill" style="width:0%" data-target="${avg}"></div></div></div>
            <div class="pcard-status-bar">${STATUS_LIST.map(s => `<div class="pcard-status-segment" style="flex:${sc[s]};background:${STATUS_COLORS[s]}"></div>`).join('')}</div>
            <div class="pcard-stats">${STATUS_LIST.filter(s => sc[s] > 0).map(s => `<div class="pcard-stat"><span class="pcard-stat-dot" style="background:${STATUS_COLORS[s]}"></span>${sc[s]} ${s}</div>`).join('')}</div>
        </div>`;
        }).join('');
        // Animate progress bars
        observeAndAnimate('portfolioCards', () => {
            setTimeout(() => {
                document.querySelectorAll('.pcard-progress-fill[data-target]').forEach(el => {
                    el.style.transition = 'width 0.8s cubic-bezier(0.22,1,0.36,1)';
                    el.style.width = el.dataset.target + '%';
                });
            }, 50);
        });
    }

    window._navPortfolio = function (id) { navigateTo('portfolio', id); };

    function renderBlockers() {
        const bs = getFilteredProjects().filter(p => p.blockers && p.blockers.trim());
        $('blockerList').innerHTML = bs.length ? bs.map(p => `<div class="blocker-item" onclick="window._openModal(${p.id})"><span class="blocker-project">${p.name}</span><span class="blocker-text">${p.blockers}</span><span class="blocker-owner">${p.owner}</span></div>`).join('') :
            `<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">${t('hub.noBlockers')}</div></div>`;
    }

    function renderMilestones() {
        const now = new Date(), in30 = new Date(now.getTime() + 30 * 86400000);
        const ms = getFilteredProjects().filter(p => { if (!p.targetdate) return false; const d = new Date(p.targetdate); return d >= now && d <= in30; }).sort((a, b) => new Date(a.targetdate) - new Date(b.targetdate));
        $('milestoneList').innerHTML = ms.length ? ms.map(p => `<div class="milestone-item" onclick="window._openModal(${p.id})"><span class="milestone-date">${formatDate(p.targetdate)}</span><span class="milestone-project">${p.name}</span><span class="milestone-text">${p.nextmilestone}</span></div>`).join('') :
            `<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">${t('hub.noMilestones')}</div></div>`;
    }

    // ========== ANIMATED CHARTS ==========
    function animateStatusChart() {
        const canvas = $('chartStatus'); if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 300 * dpr; canvas.height = 300 * dpr;
        canvas.style.width = '300px'; canvas.style.height = '300px';
        ctx.scale(dpr, dpr);
        const allFiltered = getFilteredProjects();
        const counts = STATUS_LIST.map(s => allFiltered.filter(p => p.status === s).length);
        const total = counts.reduce((a, b) => a + b, 0) || 1;
        const colors = STATUS_LIST.map(s => STATUS_COLORS[s]);
        const cx = 150, cy = 140, r = 100, ir = 60;
        const dur = 900; let startT = null;
        function draw(now) {
            if (!startT) startT = now;
            const p = Math.min((now - startT) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            ctx.clearRect(0, 0, 300, 300);
            let start = -Math.PI / 2;
            const sweep = ease * 2 * Math.PI;
            counts.forEach((c, i) => { if (c === 0) return; const angle = (c / total) * sweep; ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle); ctx.arc(cx, cy, ir, start + angle, start, true); ctx.closePath(); ctx.fillStyle = colors[i]; ctx.fill(); start += angle; });
            ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a'; ctx.font = '700 28px Inter'; ctx.textAlign = 'center'; ctx.fillText(Math.round(total * ease), cx, cy + 2);
            ctx.font = '500 10px Inter'; ctx.fillStyle = '#94a3b8'; ctx.fillText('PROJECTS', cx, cy + 16);
            if (p >= 1) { let ly = 270, lx = 20; ctx.font = '500 10px Inter'; STATUS_LIST.forEach((s, i) => { if (counts[i] === 0) return; ctx.fillStyle = colors[i]; ctx.beginPath(); ctx.arc(lx, ly, 4, 0, 2 * Math.PI); ctx.fill(); ctx.fillStyle = isDark ? '#94a3b8' : '#475569'; ctx.textAlign = 'left'; ctx.fillText(`${s} (${counts[i]})`, lx + 8, ly + 3); lx += ctx.measureText(`${s} (${counts[i]})`).width + 20; }); }
            if (p < 1) requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }
    function drawStatusChart() { animateStatusChart(); }

    function animateProgressChart() {
        const canvas = $('chartProgress'); if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 500, h = 300;
        canvas.width = w * dpr; canvas.height = h * dpr;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        const allFiltered = getFilteredProjects();
        const data = PORTFOLIOS.map(pf => { const ps = allFiltered.filter(p => p.portfolio === pf.id); return { name: (t('pf.' + pf.id) || pf.name).slice(0, 12), avg: ps.length ? Math.round(ps.reduce((s, p) => s + p.progress, 0) / ps.length) : 0, color: pf.color }; });
        const margin = { top: 20, right: 20, bottom: 50, left: 40 };
        const chartW = w - margin.left - margin.right, chartH = h - margin.top - margin.bottom;
        const gap = chartW / data.length, barW = gap * 0.6;
        const dur = 800; let startT = null;
        function draw(now) {
            if (!startT) startT = now;
            const p = Math.min((now - startT) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0'; ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) { const y = margin.top + chartH - (chartH * i / 4); ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(w - margin.right, y); ctx.stroke(); ctx.fillStyle = isDark ? '#64748b' : '#94a3b8'; ctx.font = '500 10px Inter'; ctx.textAlign = 'right'; ctx.fillText((i * 25) + '%', margin.left - 6, y + 3); }
            data.forEach((d, i) => { const x = margin.left + i * gap + (gap - barW) / 2; const barH = (d.avg / 100) * chartH * ease; const y = margin.top + chartH - barH; const grad = ctx.createLinearGradient(x, y, x, margin.top + chartH); grad.addColorStop(0, d.color); grad.addColorStop(1, d.color + '60'); ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(x, y, barW, Math.max(barH, 0), [4, 4, 0, 0]); ctx.fill(); if (p > 0.5) { ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a'; ctx.font = '700 10px Inter'; ctx.textAlign = 'center'; ctx.globalAlpha = (p - 0.5) * 2; ctx.fillText(d.avg + '%', x + barW / 2, y - 5); ctx.globalAlpha = 1; } ctx.fillStyle = isDark ? '#94a3b8' : '#475569'; ctx.font = '500 9px Inter'; ctx.save(); ctx.translate(x + barW / 2, margin.top + chartH + 12); ctx.rotate(-0.3); ctx.fillText(d.name, 0, 0); ctx.restore(); });
            if (p < 1) requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }
    function drawProgressChart() { animateProgressChart(); }

    // ========== TABLE ==========
    function renderTable() {
        const ps = getFilteredProjects();
        if (sortColumn) ps.sort((a, b) => { let va = a[sortColumn], vb = b[sortColumn]; if (typeof va === 'number') return sortDirection === 'asc' ? va - vb : vb - va; va = (va || '').toString(); vb = (vb || '').toString(); return sortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va); });
        const cols = [
            { key: 'name', label: t('col.project'), w: '180px' }, { key: 'status', label: t('col.status'), w: '110px' },
            { key: 'progress', label: t('col.progress'), w: '130px' },
            { key: 'owner', label: t('col.owner'), w: '90px' }, { key: 'currentfocus', label: t('col.currentfocus'), w: '160px' },
            { key: 'blockers', label: t('col.blockers'), w: '160px' }, { key: 'nextmilestone', label: t('col.nextmilestone'), w: '140px' },
            { key: 'targetdate', label: t('col.targetdate'), w: '90px' }, { key: 'actions', label: t('col.actions'), w: '70px' }
        ];
        $('projectTableHead').innerHTML = '<tr>' + cols.map(c => `<th style="min-width:${c.w}" data-col="${c.key}" onclick="${c.key !== 'actions' ? `window._sortBy('${c.key}')` : ''}" class="${sortColumn === c.key ? 'sort-' + sortDirection : ''}">${c.label}</th>`).join('') + '</tr>';
        $('projectTableBody').innerHTML = ps.map(p => {
            const sc = STATUS_CLASSES[p.status];
            return `<tr class="${p.blockers ? 'has-blocker' : ''}">
            <td><span class="cell-project-name" onclick="window._openModal(${p.id})">${p.name}</span></td>
            <td><span class="status-badge ${sc}"><span class="status-dot ${sc}"></span>${p.status}</span></td>
            <td><div class="progress-cell"><div class="progress-bar-mini"><div class="progress-bar-fill" style="width:${p.progress}%;background:${progressColor(p.progress)}"></div></div><span class="progress-value">${p.progress}%</span></div></td>
            <td>${p.owner}</td>
            <td class="text-truncate" style="max-width:160px" title="${p.currentfocus}">${p.currentfocus}</td>
            <td style="color:${p.blockers ? 'var(--status-off-track)' : 'inherit'};font-weight:${p.blockers ? '600' : '400'}">${p.blockers || '—'}</td>
            <td>${p.nextmilestone}</td>
            <td>${formatDate(p.targetdate)}</td>
            <td><div class="row-actions"><button class="row-action-btn" onclick="event.stopPropagation();window._openCrudModal(${p.id})" title="Edit">✏️</button><button class="row-action-btn" onclick="event.stopPropagation();window._deleteProject(${p.id})" title="Delete">🗑️</button></div></td>
        </tr>`;
        }).join('');
    }

    window._sortBy = function (col) { if (sortColumn === col) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; else { sortColumn = col; sortDirection = 'asc'; } renderTable(); };

    function progressColor(v) { if (v >= 70) return 'var(--status-on-track)'; if (v >= 40) return 'var(--status-at-risk)'; return 'var(--status-off-track)'; }

    // ========== KANBAN ==========
    function renderKanban() {
        const ps = getFilteredProjects();
        $('kanbanBoard').innerHTML = STATUS_LIST.map(status => {
            const sc = STATUS_CLASSES[status]; const items = ps.filter(p => p.status === status);
            return `<div class="kanban-column" data-status="${sc}"><div class="kanban-column-header"><span class="kanban-column-title"><span class="status-dot ${sc}"></span>${status}</span><span class="kanban-column-count">${items.length}</span></div>
            ${items.map(p => { const pf = PORTFOLIOS.find(x => x.id === p.portfolio); return `<div class="kanban-card" onclick="window._openModal(${p.id})"><div class="kanban-card-portfolio">${pf ? pf.icon + ' ' + (t('pf.' + pf.id) || pf.name) : ''}</div><div class="kanban-card-title">${p.name}</div><div class="kanban-card-footer"><span class="kanban-card-owner">${p.owner}</span><span class="kanban-card-progress" style="color:${progressColor(p.progress)}">${p.progress}%</span></div>${p.nextmilestone ? `<div class="kanban-card-milestone">🏁 ${p.nextmilestone}</div>` : ''}</div>`; }).join('')}
        </div>`;
        }).join('');
    }

    // ========== TIMELINE ==========
    function renderTimeline() {
        const canvas = $('timelineCanvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const ps = getFilteredProjects().filter(p => p.startdate && p.targetdate);
        const dpr = window.devicePixelRatio || 1;
        const rowH = 34, labelW = 170, marginTop = 50, marginRight = 20;
        const h = marginTop + ps.length * rowH + 40;
        const w = Math.max(1100, canvas.parentElement.clientWidth - 48);
        canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
        if (!ps.length) { ctx.fillStyle = '#94a3b8'; ctx.font = '500 14px Inter'; ctx.textAlign = 'center'; ctx.fillText('No projects', w / 2, h / 2); return; }
        const dates = ps.flatMap(p => [new Date(p.startdate), new Date(p.targetdate)]);
        const minD = new Date(Math.min(...dates)); const maxD = new Date(Math.max(...dates));
        minD.setDate(1); maxD.setMonth(maxD.getMonth() + 1); maxD.setDate(0);
        const totalMs = maxD - minD || 1, chartW = w - labelW - marginRight;
        const toX = d => labelW + ((d - minD) / totalMs) * chartW;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let md = new Date(minD); ctx.font = '600 10px Inter'; ctx.textAlign = 'center';
        while (md <= maxD) { const x = toX(md); const nextM = new Date(md); nextM.setMonth(nextM.getMonth() + 1); const x2 = toX(nextM > maxD ? maxD : nextM); ctx.fillStyle = isDark ? '#94a3b8' : '#475569'; ctx.fillText(months[md.getMonth()] + ' ' + md.getFullYear().toString().slice(2), (x + x2) / 2, 18); ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 28); ctx.lineTo(x, h); ctx.stroke(); md.setMonth(md.getMonth() + 1); }
        const today = new Date();
        if (today >= minD && today <= maxD) { const tx = toX(today); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(tx, 28); ctx.lineTo(tx, h); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#ef4444'; ctx.font = '600 9px Inter'; ctx.fillText('Today', tx, 40); }
        ps.forEach((p, i) => { const y = marginTop + i * rowH; const x1 = toX(new Date(p.startdate)); const x2 = toX(new Date(p.targetdate)); if (i % 2 === 0) { ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'; ctx.fillRect(0, y, w, rowH); } ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a'; ctx.font = '500 11px Inter'; ctx.textAlign = 'right'; ctx.fillText(p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name, labelW - 10, y + rowH / 2 + 3); const barH = 12, barY = y + (rowH - barH) / 2; const color = STATUS_COLORS[p.status]; ctx.fillStyle = color + '40'; ctx.beginPath(); ctx.roundRect(x1, barY, Math.max(x2 - x1, 6), barH, 3); ctx.fill(); const progW = (x2 - x1) * (p.progress / 100); ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x1, barY, Math.max(progW, 3), barH, 3); ctx.fill(); });
    }

    // ========== MODAL (Detail) ==========
    function setupModal() {
        $('modalClose').addEventListener('click', closeModal);
        $('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeCrudModal(); closePfCrudModal(); } });
        $('modalEditBtn').addEventListener('click', () => { const id = parseInt($('modalTitle').dataset.projectId); closeModal(); window._openCrudModal(id); });
        $('modalDeleteBtn').addEventListener('click', () => { const id = parseInt($('modalTitle').dataset.projectId); if (confirm(t('crud.confirmDelete'))) { projects = projects.filter(p => p.id !== id); saveProjects(); closeModal(); refreshCurrentView(); showToast(t('toast.deleted')); } });
    }

    window._openModal = function (id) {
        const p = projects.find(x => x.id === id); if (!p) return;
        const pf = PORTFOLIOS.find(x => x.id === p.portfolio);
        $('modalPortfolioBadge').innerHTML = pf ? pf.icon + ' ' + (t('pf.' + pf.id) || pf.name) : '';
        $('modalTitle').textContent = p.name;
        $('modalTitle').dataset.projectId = id;
        $('modalBody').innerHTML = `
        <div class="modal-section"><div class="modal-section-title">${t('modal.overview')}</div><div class="modal-grid">
            <div class="modal-field"><div class="modal-field-label">${t('modal.objective')}</div><div class="modal-field-value">${p.objective}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('col.status')}</div><div class="modal-field-value"><span class="status-badge ${STATUS_CLASSES[p.status]}"><span class="status-dot ${STATUS_CLASSES[p.status]}"></span>${p.status}</span></div></div>
            <div class="modal-field"><div class="modal-field-label">${t('col.owner')}</div><div class="modal-field-value">${p.owner}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('col.accountable')}</div><div class="modal-field-value">${p.accountable}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('col.stakeholders')}</div><div class="modal-field-value">${(p.stakeholders || []).join(', ')}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('col.progress')}</div><div class="modal-field-value"><div class="progress-cell"><div class="progress-bar-mini"><div class="progress-bar-fill" style="width:${p.progress}%;background:${progressColor(p.progress)}"></div></div><span class="progress-value">${p.progress}%</span></div></div></div>
            <div class="modal-field"><div class="modal-field-label">${t('modal.startdate')}</div><div class="modal-field-value">${formatDate(p.startdate)}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('modal.targetdate')}</div><div class="modal-field-value">${formatDate(p.targetdate)}</div></div>
        </div></div>
        <div class="modal-section"><div class="modal-section-title">${t('modal.currentStatus')}</div><div class="modal-grid">
            <div class="modal-field full-width"><div class="modal-field-label">${t('modal.currentfocus')}</div><div class="modal-field-value">${p.currentfocus}</div></div>
            <div class="modal-field full-width"><div class="modal-field-label">${t('modal.deliverables')}</div><div class="modal-field-value">${p.deliverables}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('modal.nextmilestone')}</div><div class="modal-field-value">${p.nextmilestone}</div></div>
            <div class="modal-field"><div class="modal-field-label">${t('modal.lastupdated')}</div><div class="modal-field-value">${formatDate(p.lastupdated)}</div></div>
            ${p.blockers ? `<div class="modal-field full-width" style="border-left:3px solid var(--status-off-track)"><div class="modal-field-label">${t('modal.blockers')}</div><div class="modal-field-value" style="color:var(--status-off-track)">${p.blockers}</div></div>` : ''}
            ${p.risks ? `<div class="modal-field full-width"><div class="modal-field-label">${t('modal.risks')}</div><div class="modal-field-value">${p.risks}</div></div>` : ''}
        </div></div>`;
        $('modalOverlay').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        const ov = $('modalOverlay');
        if (ov.style.display === 'none') return;
        ov.classList.add('closing');
        setTimeout(() => { ov.style.display = 'none'; ov.classList.remove('closing'); document.body.style.overflow = ''; }, 350);
    }

    // ========== PROJECT CRUD ==========
    let editingProjectId = null;

    function setupCrud() {
        $('btnAddProject')?.addEventListener('click', () => window._openCrudModal());
        $('crudClose').addEventListener('click', closeCrudModal);
        $('crudCancel').addEventListener('click', closeCrudModal);
        $('crudOverlay').addEventListener('click', e => { if (e.target === $('crudOverlay')) closeCrudModal(); });
        $('crudSave').addEventListener('click', saveCrudForm);
    }

    window._openCrudModal = function (id) {
        editingProjectId = id || null;
        const p = id ? projects.find(x => x.id === id) : null;
        $('crudTitle').textContent = p ? t('crud.editTitle') : t('crud.addTitle');
        $('crudBody').innerHTML = `<div class="crud-form">
        <div class="crud-field"><label class="crud-label">${t('crud.name')}</label><input class="crud-input" id="crudName" value="${p ? p.name : ''}"></div>
        <div class="crud-row">
            <div class="crud-field"><label class="crud-label">${t('crud.portfolio')}</label><select class="crud-select" id="crudPortfolio">${PORTFOLIOS.map(pf => `<option value="${pf.id}" ${p && p.portfolio === pf.id ? 'selected' : ''}>${t('pf.' + pf.id) || pf.name}</option>`).join('')}</select></div>
            <div class="crud-field"><label class="crud-label">${t('col.status')}</label><select class="crud-select" id="crudStatus">${STATUS_LIST.map(s => `<option value="${s}" ${p && p.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        </div>
        <div class="crud-field"><label class="crud-label">${t('crud.objective')}</label><input class="crud-input" id="crudObjective" value="${p ? p.objective : ''}"></div>
        <div class="crud-row">
            <div class="crud-field"><label class="crud-label">${t('col.owner')}</label><input class="crud-input" id="crudOwner" value="${p && p.owner ? p.owner : ''}"></div>
            <div class="crud-field"><label class="crud-label">${t('col.accountable')}</label><input class="crud-input" id="crudAccountable" value="${p && p.accountable ? p.accountable : ''}"></div>
        </div>
        <div class="crud-row">
            <div class="crud-field full-width"><label class="crud-label">${t('col.progress')} (%)</label><input class="crud-input" type="number" min="0" max="100" id="crudProgress" value="${p && p.progress ? p.progress : 0}"></div>
        </div>
        <div class="crud-row">
            <div class="crud-field"><label class="crud-label">${t('modal.startdate')}</label><input class="crud-input" type="date" id="crudStart" value="${p && p.startdate ? p.startdate : ''}"></div>
            <div class="crud-field"><label class="crud-label">${t('modal.targetdate')}</label><input class="crud-input" type="date" id="crudTarget" value="${p && p.targetdate ? p.targetdate : ''}"></div>
        </div>
        <div class="crud-field"><label class="crud-label">${t('modal.currentfocus')}</label><input class="crud-input" id="crudFocus" value="${p && p.currentfocus ? p.currentfocus : ''}"></div>
        <div class="crud-field"><label class="crud-label">${t('col.blockers')}</label><input class="crud-input" id="crudBlockers" value="${p && p.blockers ? p.blockers : ''}"></div>
        <div class="crud-field"><label class="crud-label">${t('modal.nextmilestone')}</label><input class="crud-input" id="crudMilestone" value="${p && p.nextmilestone ? p.nextmilestone : ''}"></div>
    </div>`;
        $('crudOverlay').style.display = 'flex';
    };

    async function saveCrudForm() {
        const name = $('crudName').value.trim();
        if (!name) { showToast(t('toast.nameRequired')); return; }
        const data = {
            name, portfolio: $('crudPortfolio').value, status: $('crudStatus').value,
            objective: $('crudObjective').value, owner: $('crudOwner').value, accountable: $('crudAccountable').value,
            progress: parseInt($('crudProgress').value) || 0,
            currentfocus: $('crudFocus').value, blockers: $('crudBlockers').value,
            nextmilestone: $('crudMilestone').value, lastupdated: new Date().toISOString().slice(0, 10)
        };
        const sDate = $('crudStart').value;
        data.startdate = sDate ? sDate : null;
        const tDate = $('crudTarget').value;
        data.targetdate = tDate ? tDate : null;

        if (editingProjectId) {
            data.id = editingProjectId;
            const { error } = await supabase.from('projects').update(data).eq('id', editingProjectId);
            if (!error) {
                const p = projects.find(x => x.id === editingProjectId);
                if (p) Object.assign(p, data);
            } else {
                showToast("Error updating database!");
                return;
            }
        } else {
            const { data: inserted, error } = await supabase.from('projects').insert([data]).select();
            if (!error && inserted && inserted.length > 0) {
                projects.push(inserted[0]);
            } else {
                showToast("Error creating project!");
                return;
            }
        }

        if (data.status === 'Done') {
            fireConfetti();
        }

        closeCrudModal(); refreshCurrentView();
        showToast(t('toast.saved'));
    }

    function fireConfetti() {
        if (typeof confetti !== 'undefined') {
            const count = 200;
            const defaults = { origin: { y: 0.8 }, zIndex: 9999 };
            function fire(particleRatio, opts) {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            }
            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        }
    }

    window._deleteProject = async function (id) {
        if (!confirm(t('crud.confirmDelete'))) return;
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            projects = projects.filter(p => p.id !== id);
            refreshCurrentView();
            try { closeModal(); } catch (e) { }
            try { closeCrudModal(); } catch (e) { }
            showToast(t('toast.deleted'));
        }
    };

    function closeCrudModal() {
        const ov = $('crudOverlay');
        if (ov.style.display === 'none') return;
        ov.classList.add('closing');
        setTimeout(() => { ov.style.display = 'none'; ov.classList.remove('closing'); editingProjectId = null; }, 350);
    }

    // ========== PORTFOLIO CRUD ==========
    let editingPfId = null;
    let selectedPfIcon = PORTFOLIO_ICON_OPTIONS[0];
    let selectedPfColor = PORTFOLIO_COLOR_OPTIONS[0];

    function setupPortfolioCrud() {
        $('btnAddPortfolio').addEventListener('click', () => openPfCrudModal());
        $('pfCrudClose').addEventListener('click', closePfCrudModal);
        $('pfCrudCancel').addEventListener('click', closePfCrudModal);
        $('pfCrudOverlay').addEventListener('click', e => { if (e.target === $('pfCrudOverlay')) closePfCrudModal(); });
        $('pfCrudSave').addEventListener('click', savePfCrud);
    }

    window._openPfCrudModal = openPfCrudModal;
    function openPfCrudModal(id) {
        editingPfId = id || null;
        const pf = id ? PORTFOLIOS.find(x => x.id === id) : null;
        selectedPfIcon = pf ? pf.icon : PORTFOLIO_ICON_OPTIONS[0];
        selectedPfColor = pf ? pf.color : PORTFOLIO_COLOR_OPTIONS[0];
        $('pfCrudTitle').textContent = pf ? t('pf.editTitle') || 'Edit Portfolio' : (t('pf.addTitle') || 'Add Portfolio');
        $('pfCrudBody').innerHTML = `<div class="crud-form">
        <div class="crud-field"><label class="crud-label">${t('crud.name') || 'Name'}</label><input class="crud-input" id="pfCrudName" value="${pf ? pf.name : ''}"></div>
        <div class="crud-field"><label class="crud-label">${t('pf.icon') || 'Icon'}</label>
            <div class="icon-picker-grid" id="pfIconPicker">${PORTFOLIO_ICON_OPTIONS.map(ic => `<div class="icon-picker-item${ic === selectedPfIcon ? ' selected' : ''}" data-icon="${ic}" onclick="window._selectPfIcon(this.dataset.icon)">${ic}</div>`).join('')}</div>
        </div>
        <div class="crud-field"><label class="crud-label">${t('pf.color') || 'Color'}</label>
            <div class="color-picker-grid" id="pfColorPicker">${PORTFOLIO_COLOR_OPTIONS.map(c => `<div class="color-picker-item${c === selectedPfColor ? ' selected' : ''}" data-color="${c}" style="background:${c}" onclick="window._selectPfColor('${c}')"></div>`).join('')}</div>
        </div>
    </div>`;
        $('pfCrudOverlay').style.display = 'flex';
    }

    window._selectPfIcon = function (icon) {
        selectedPfIcon = icon;
        document.querySelectorAll('#pfIconPicker .icon-picker-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.icon === icon);
        });
    };

    window._selectPfColor = function (color) {
        selectedPfColor = color;
        document.querySelectorAll('#pfColorPicker .color-picker-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.color === color);
        });
    };

    async function savePfCrud() {
        const name = $('pfCrudName').value.trim();
        if (!name) { showToast(t('toast.nameRequired') || 'Name required'); return; }
        const id = editingPfId || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

        const data = { id, name, icon: selectedPfIcon, color: selectedPfColor };

        if (editingPfId) {
            const { error } = await supabase.from('portfolios').update(data).eq('id', editingPfId);
            if (!error) {
                const pf = PORTFOLIOS.find(x => x.id === editingPfId);
                if (pf) Object.assign(pf, data);
            }
        } else {
            if (PORTFOLIOS.find(x => x.id === id)) { showToast('Portfolio already exists'); return; }
            const { error } = await supabase.from('portfolios').insert([data]);
            if (!error) {
                PORTFOLIOS.push(data);
            }
        }
        closePfCrudModal(); refreshCurrentView();
        showToast(t('toast.saved'));
    }

    window._deletePortfolio = async function (id) {
        const pf = PORTFOLIOS.find(x => x.id === id);
        const count = projects.filter(p => p.portfolio === id).length;
        const msg = count > 0
            ? `Delete "${pf.name}"? ${count} project(s) will lose their portfolio assignment.`
            : `Delete "${pf.name}"?`;
        if (!confirm(msg)) return;

        const { error } = await supabase.from('portfolios').delete().eq('id', id);
        if (!error) {
            const idx = PORTFOLIOS.findIndex(x => x.id === id);
            if (idx >= 0) PORTFOLIOS.splice(idx, 1);

            // Also update all projects locally to clear portfolio, assuming DB cascade or trigger handles it, 
            // or we run an update to Supabase manually to set them to null.
            const projectsToUpdate = projects.filter(p => p.portfolio === id);
            if (projectsToUpdate.length > 0) {
                await supabase.from('projects').update({ portfolio: null }).eq('portfolio', id);
                projects.forEach(p => { if (p.portfolio === id) p.portfolio = ''; });
            }

            refreshCurrentView();
            if (currentPortfolio === id) { navigateTo('hub', null); }
            showToast(t('toast.deleted'));
        }
    };

    function closePfCrudModal() {
        const ov = $('pfCrudOverlay');
        if (ov.style.display === 'none') return;
        ov.classList.add('closing');
        setTimeout(() => { ov.style.display = 'none'; ov.classList.remove('closing'); editingPfId = null; }, 350);
    }

    // ========== SETTINGS ==========
    function setupSettings() {
        $('btnExportCSV')?.addEventListener('click', exportCSV);
        $('btnExportJSON')?.addEventListener('click', exportJSON);
        $('btnImportJSON')?.addEventListener('change', importJSON);
    }

    function exportCSV() {
        const headers = ['Portfolio', 'Name', 'Status', 'Progress', 'Owner', 'Accountable', 'Stakeholders', 'Objective', 'CurrentFocus', 'Blockers', 'Risks', 'NextMilestone', 'TargetDate', 'LastUpdated'];
        const rows = projects.map(p => [PORTFOLIOS.find(x => x.id === p.portfolio)?.name || '', p.name, p.status, p.progress, p.owner, p.accountable, (p.stakeholders || []).join(';'), p.objective, p.currentfocus, p.blockers, p.risks, p.nextmilestone, p.targetdate, p.lastupdated].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`));
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        download('sprix-projects.csv', csv, 'text/csv');
        showToast(t('toast.csvDone'));
    }

    function exportJSON() {
        const backup = { portfolios: PORTFOLIOS, projects };
        download('sprix-projects-backup.json', JSON.stringify(backup, null, 2), 'application/json');
        showToast(t('toast.backupDone'));
    }

    function importJSON(e) {
        showToast("JSON Import is disabled in the online database version.");
        e.target.value = '';
    }

    // ========== TUTORIAL ==========
    let tutorialCurrent = 0;
    const tutorialSteps = [
        { title: "Portfolio Hub", text: "全プロジェクトの進捗とブロック状態を俯瞰できます。各カードをクリックすると詳細にジャンプします。" },
        { title: "表示の切り替え", text: "テーブル、カンバン、タイムラインの3つの視点をワンクリックで切り替え可能です。" },
        { title: "プロジェクト追加", text: "右上の「+ Add Project」からいつでも新しいプロジェクトを追加・追跡できます。" },
        { title: "プレニアム体験", text: "ダークモード切替やエクスポートの他、心地よい波紋エフェクト等の操作感をお楽しみください！" }
    ];

    window._startTutorial = function () {
        tutorialCurrent = 0;
        showTutorialStep();
    };

    window._nextTutorialStep = function () {
        tutorialCurrent++;
        showTutorialStep();
    };

    function showTutorialStep() {
        if (tutorialCurrent >= tutorialSteps.length) {
            closeModal();
            showToast("チュートリアルが完了しました！");
            return;
        }
        const s = tutorialSteps[tutorialCurrent];
        $('modalTitle').textContent = `チュートリアル (${tutorialCurrent + 1}/${tutorialSteps.length})`;
        $('modalPortfolioBadge').style.display = 'none';
        $('modalEditBtn').style.display = 'none';
        $('modalDeleteBtn').style.display = 'none';

        $('modalBody').innerHTML = `
            <div style="text-align: center; padding: 20px 10px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">💡</div>
                <h3 style="margin-bottom: 20px; font-size: 1.4rem;">${s.title}</h3>
                <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 30px;">${s.text}</p>
                <button class="btn-primary ripple-target" onclick="window._nextTutorialStep()" style="padding: 12px 30px; font-size: 1.1rem; filter: none;">
                    ${tutorialCurrent < tutorialSteps.length - 1 ? '次へ (Next) ➔' : '完了 (Finish) ✅'}
                    <span class="ripple" style="transform: scale(0); opacity: 0;"></span>
                </button>
            </div>
        `;
        $('modalOverlay').style.display = 'flex';
    }

    // ========== PREMIUM ANIMATIONS ==========
    function setupRipple() {
        const selectors = '.btn-primary, .btn-outline, .btn-icon, .nav-item, .view-tab, .portfolio-card, .blocker-item, .milestone-item, .btn-add-project';
        document.body.addEventListener('click', function (e) {
            const target = e.target.closest(selectors);
            if (!target) return;

            target.classList.add('ripple-target');

            const circle = document.createElement('span');
            const diameter = Math.max(target.clientWidth, target.clientHeight);
            const radius = diameter / 2;

            const rect = target.getBoundingClientRect();
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');

            const ripple = target.querySelector('.ripple');
            if (ripple) {
                ripple.remove();
            }

            target.appendChild(circle);

            setTimeout(() => {
                circle.remove();
            }, 600);
        });
    }

    function setupMagnetic() {
        const magnets = document.querySelectorAll('.btn-primary, .btn-icon, .btn-add-project, .nav-item');
        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', function (e) {
                const rect = magnet.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Max translation is 10px
                const strength = 0.2;
                const tx = x * strength;
                const ty = y * strength;

                magnet.style.transform = `translate(${tx}px, ${ty}px)`;
                magnet.style.transition = 'transform 0.1s ease-out';
            });

            magnet.addEventListener('mouseleave', function () {
                magnet.style.transform = 'translate(0px, 0px)';
                magnet.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
        });

        // Setup observer for dynamically added buttons (like in Kanban/TableView)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const newMagnets = node.querySelectorAll ? node.querySelectorAll('.btn-primary, .btn-icon, .btn-add-project, .nav-item') : [];
                        const isMagnet = node.matches && node.matches('.btn-primary, .btn-icon, .btn-add-project, .nav-item');
                        const elements = isMagnet ? [node, ...newMagnets] : Array.from(newMagnets);

                        elements.forEach(magnet => {
                            // Avoid double binding
                            if (!magnet.dataset.magnetic) {
                                magnet.dataset.magnetic = "true";
                                magnet.addEventListener('mousemove', function (e) {
                                    const rect = magnet.getBoundingClientRect();
                                    const x = e.clientX - rect.left - rect.width / 2;
                                    const y = e.clientY - rect.top - rect.height / 2;
                                    const tx = x * 0.2;
                                    const ty = y * 0.2;
                                    magnet.style.transform = `translate(${tx}px, ${ty}px)`;
                                    magnet.style.transition = 'transform 0.1s ease-out';
                                });
                                magnet.addEventListener('mouseleave', function () {
                                    magnet.style.transform = 'translate(0px, 0px)';
                                    magnet.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                });
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Mark initial items to avoid double binding later just in case
        magnets.forEach(m => m.dataset.magnetic = "true");
    }

    function download(name, content, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); }

    // ========== TOAST ==========
    function showToast(msg) {
        const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
        $('toastContainer').appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
    }

    // ========== HELPERS ==========
    function observeAndAnimate(elementId, animateFn) {
        const el = $(elementId);
        if (!el) return;
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateFn();
                    obs.disconnect();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(el);
    }

    function formatDate(str) { if (!str) return '—'; const d = new Date(str); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return m[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }

    $('blockerAlert')?.addEventListener('click', () => { if (currentView !== 'hub') navigateTo('hub', null); setTimeout(() => $('blockerList')?.scrollIntoView({ behavior: 'smooth' }), 100); });

})();
