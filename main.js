    document.addEventListener('DOMContentLoaded', () => {
        // Font stylesheet loader (replaces inline onload)
        const fontSheet = document.getElementById('fontStylesheet');
        if(fontSheet){ fontSheet.addEventListener('load', function(){ this.media='all'; }); }

        // Skip link focus/blur (replaces inline onfocus/onblur)
        const skipLink = document.getElementById('skipLink');
        if(skipLink){
            skipLink.addEventListener('focus', function(){ this.style.top='0'; });
            skipLink.addEventListener('blur', function(){ this.style.top='-40px'; });
        }

        // Mobile menu toggle (replaces inline onclick)
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if(mobileMenuBtn){
            mobileMenuBtn.addEventListener('click', function(){
                const expanded = this.getAttribute('aria-expanded') === 'false' ? 'true' : 'false';
                this.setAttribute('aria-expanded', expanded);
                document.querySelector('.nav-links').classList.toggle('open');
            });
        }

        // Scroll animations
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1 });
        document.querySelectorAll('.animate').forEach(el => obs.observe(el));

        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const t = document.querySelector(a.getAttribute('href'));
                if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelector('.nav-links')?.classList.remove('open');
            });
        });

        // ═══════════════════════════════════════════════
        // CONFIGURATION — Replace before going live
        // ═══════════════════════════════════════════════
        const CONFIG = {
            WEB3FORMS_KEY: '64b168c0-ba11-468a-9647-24a41d356cc5',
            SUPABASE_URL: '',       // e.g. 'https://xxxx.supabase.co' — set in Vercel env vars, injected at build
            SUPABASE_ANON_KEY: '',  // Public anon key — safe for client-side, RLS protects data
        };

        // Security layer: client-side protections

        // Email obfuscation
        const eLink = document.getElementById('emailLink');
        const eTxt = document.getElementById('emailText');
        if (eLink && eTxt) {
            const u = eLink.dataset.u, d = eLink.dataset.d;
            const full = u + '@' + d;
            eTxt.textContent = full;
            eLink.setAttribute('href', 'mai' + 'lto:' + full + '?subject=' + encodeURIComponent('SOLOMON TEKNIKA: Inquiry'));
        }

        // Input sanitizer — powered by DOMPurify
        function sanitize(str) {
            if (typeof DOMPurify !== 'undefined') {
                return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
            }
            // Fallback if DOMPurify failed to load
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML.trim();
        }

        // Escape helper for safe insertion into HTML templates (analytics dashboard)
        function escHtml(str) {
            const div = document.createElement('div');
            div.textContent = String(str);
            return div.innerHTML;
        }

        // Rate limiter
        const rateLimiter = {
            submissions: [],
            maxPerWindow: 3,      // max 3 submissions
            windowMs: 300000,     // per 5 minutes
            cooldownMs: 600000,   // 10 min cooldown after limit hit
            lockedUntil: 0,
            check() {
                const now = Date.now();
                if (now < this.lockedUntil) return false;
                this.submissions = this.submissions.filter(t => now - t < this.windowMs);
                if (this.submissions.length >= this.maxPerWindow) {
                    this.lockedUntil = now + this.cooldownMs;
                    return false;
                }
                this.submissions.push(now);
                return true;
            }
        };

        // Fraud detection
        const fraudDetector = {
            pageLoadTime: Date.now(),
            fieldInteractions: new Set(),
            keystrokeTimings: [],
            lastKeystroke: 0,
            mouseMovements: 0,
            tabSequence: [],

            trackField(fieldId) { this.fieldInteractions.add(fieldId); },
            trackKeystroke() {
                const now = Date.now();
                if (this.lastKeystroke > 0) {
                    this.keystrokeTimings.push(now - this.lastKeystroke);
                }
                this.lastKeystroke = now;
            },
            trackMouse() { this.mouseMovements++; },
            trackTab(fieldId) { this.tabSequence.push(fieldId); },

            analyze() {
                const flags = [];
                const timeOnPage = Date.now() - this.pageLoadTime;

                // Too fast submission
                if (timeOnPage < 5000) flags.push('SPEED_BOT');

                // No mouse movement
                if (this.mouseMovements < 3) flags.push('NO_MOUSE');

                // Low field interactions
                if (this.fieldInteractions.size < 3) flags.push('LOW_INTERACTION');

                // Uniform keystroke patterns
                if (this.keystrokeTimings.length > 5) {
                    const avg = this.keystrokeTimings.reduce((a,b) => a+b, 0) / this.keystrokeTimings.length;
                    const variance = this.keystrokeTimings.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / this.keystrokeTimings.length;
                    if (variance < 10) flags.push('UNIFORM_TYPING');
                }

                // Suspicious content
                const msg = document.getElementById('cfMessage')?.value || '';
                if (/(https?:\/\/[^\s]+){3,}/i.test(msg)) flags.push('LINK_SPAM');
                if (/\b(bitcoin|crypto|wire transfer|western union|urgent|lottery|prince)\b/i.test(msg)) flags.push('SCAM_KEYWORDS');
                if (/(.)\1{10,}/.test(msg)) flags.push('CHAR_REPEAT');

                // Email pattern checks
                const email = document.getElementById('cfEmail')?.value || '';
                if (/^[a-z]{1,3}\d{5,}@/i.test(email)) flags.push('DISPOSABLE_EMAIL');

                return {
                    score: flags.length,
                    flags,
                    isLikelyBot: flags.length >= 3,
                    isSuspicious: flags.length >= 2,
                    timeOnPage: Math.round(timeOnPage / 1000),
                    interactions: this.fieldInteractions.size,
                    mouseEvents: this.mouseMovements
                };
            }
        };

        /* Attach fraud detection listeners */
        const formFields = ['cfName', 'cfEmail', 'cfCompany', 'cfInterest', 'cfMessage'];
        formFields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('focus', () => { fraudDetector.trackField(id); fraudDetector.trackTab(id); });
            el.addEventListener('keydown', () => fraudDetector.trackKeystroke());
        });
        document.addEventListener('mousemove', () => fraudDetector.trackMouse(), { passive: true });

        // Form validation and submission
        const form = document.getElementById('contactForm');
        const status = document.getElementById('formStatus');

        function showStatus(msg, type) {
            status.style.display = 'block';
            status.textContent = msg;
            status.style.background = type === 'error' ? 'rgba(239,68,68,0.15)' : type === 'warn' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)';
            status.style.color = type === 'error' ? '#EF4444' : type === 'warn' ? '#F59E0B' : '#10B981';
            status.style.border = '1px solid ' + (type === 'error' ? 'rgba(239,68,68,0.3)' : type === 'warn' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)');
        }

        function validateEmail(email) {
            return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/.test(email);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('cfSubmit');

            // Honeypot check
            if (document.getElementById('hpField').value !== '') {
                showStatus('Message sent successfully!', 'success');
                return;
            }

            // Rate limit check
            if (!rateLimiter.check()) {
                showStatus('Too many submissions. Please try again in a few minutes.', 'error');
                return;
            }

            // Sanitize inputs
            const name = sanitize(document.getElementById('cfName').value);
            const email = sanitize(document.getElementById('cfEmail').value);
            const company = sanitize(document.getElementById('cfCompany').value);
            const interest = sanitize(document.getElementById('cfInterest').value);
            const message = sanitize(document.getElementById('cfMessage').value);

            // Validate inputs
            if (!name || name.length < 2) { showStatus('Please enter a valid name.', 'error'); return; }
            if (!validateEmail(email)) { showStatus('Please enter a valid email address.', 'error'); return; }
            if (!interest) { showStatus('Please select what you\'re interested in.', 'error'); return; }
            if (!message || message.length < 10) { showStatus('Please enter a message (at least 10 characters).', 'error'); return; }

            // Guard: block submission if Web3Forms key not configured
            if (!CONFIG.WEB3FORMS_KEY || CONFIG.WEB3FORMS_KEY === 'REPLACE_WITH_YOUR_KEY') {
                showStatus('Contact form not configured yet. Please email us directly at care@tavaraholdings.com.', 'error');
                return;
            }

            // Analyze for fraud signals
            const fraud = fraudDetector.analyze();

            if (fraud.isLikelyBot) {
                showStatus('Message sent successfully!', 'success');
                console.warn('Submission blocked — fraud detected:', fraud.score, fraud.flags);
                return;
            }

            // Submit via Web3Forms
            btn.disabled = true;
            btn.textContent = 'Sending...';

            try {
                const payload = {
                    access_key: CONFIG.WEB3FORMS_KEY,
                    subject: `SOLOMON TEKNIKA: ${interest} inquiry from ${name}${company ? ' (' + company + ')' : ''}`,
                    from_name: 'SOLOMON TEKNIKA Website',
                    replyto: email,
                    name, email, company, interest, message,
                    _fraud_score: fraud.score,
                    _fraud_flags: fraud.flags.join(', ') || 'CLEAN',
                    _time_on_page: fraud.timeOnPage + 's',
                    _interactions: fraud.interactions,
                    _mouse_events: fraud.mouseEvents,
                    _suspicious: fraud.isSuspicious ? 'YES — review carefully' : 'No'
                };

                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    showStatus('Message sent! We\'ll get back to you within 24 hours.', 'success');
                    form.reset();
                    fraudDetector.fieldInteractions.clear();
                } else {
                    showStatus('Something went wrong. Please email us directly.', 'error');
                }
            } catch (err) {
                showStatus('Network error. Please email us directly at care@tavaraholdings.com.', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Send Message →';
            }
        });

        // External link protection
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('target', '_blank');
            }
        });

        // Console warning
        console.log('%c⚠ STOP', 'color:red;font-size:40px;font-weight:bold;');
        console.log('%cThis browser feature is for developers. If someone told you to paste something here, it is likely a scam. Do not paste anything you do not understand.', 'color:#1B2A4A;font-size:16px;');

        // ═══════════════════════════════════════════════════════════════
        // SOLOMON TEKNIKA — Built-in Analytics Engine (Privacy-First)
        // No cookies. No third-party. No PII. IndexedDB + localStorage.
        // Access: press Ctrl+Shift+K or click footer © 5 times
        // ═══════════════════════════════════════════════════════════════
        const STAnalytics = (() => {
            const DB_NAME = 'st_analytics';
            const DB_VERSION = 1;
            const STORES = ['pageviews', 'events', 'sessions', 'conversions'];
            let db = null;

            // IndexedDB setup
            function openDB() {
                return new Promise((resolve, reject) => {
                    const req = indexedDB.open(DB_NAME, DB_VERSION);
                    req.onupgradeneeded = (e) => {
                        const d = e.target.result;
                        STORES.forEach(s => {
                            if (!d.objectStoreNames.contains(s)) {
                                const store = d.createObjectStore(s, { keyPath: 'id', autoIncrement: true });
                                store.createIndex('timestamp', 'timestamp', { unique: false });
                                if (s === 'events') store.createIndex('type', 'type', { unique: false });
                                if (s === 'pageviews') store.createIndex('path', 'path', { unique: false });
                            }
                        });
                    };
                    req.onsuccess = () => { db = req.result; resolve(db); };
                    req.onerror = () => reject(req.error);
                });
            }

            function put(storeName, data) {
                if (!db) return;
                const tx = db.transaction(storeName, 'readwrite');
                tx.objectStore(storeName).add({ ...data, timestamp: Date.now() });
            }

            function getAll(storeName) {
                return new Promise((resolve) => {
                    if (!db) { resolve([]); return; }
                    const tx = db.transaction(storeName, 'readonly');
                    const req = tx.objectStore(storeName).getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => resolve([]);
                });
            }

            function clearStore(storeName) {
                if (!db) return;
                const tx = db.transaction(storeName, 'readwrite');
                tx.objectStore(storeName).clear();
            }

            // Session fingerprint (no PII — just screen + lang + timezone)
            function sessionId() {
                let sid = sessionStorage.getItem('st_sid');
                if (!sid) {
                    sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                    sessionStorage.setItem('st_sid', sid);
                }
                return sid;
            }

            // Device category
            function deviceType() {
                const w = window.innerWidth;
                if (w < 768) return 'mobile';
                if (w < 1024) return 'tablet';
                return 'desktop';
            }

            // UTM params
            function utmParams() {
                const p = new URLSearchParams(window.location.search);
                return {
                    source: p.get('utm_source') || 'direct',
                    medium: p.get('utm_medium') || 'none',
                    campaign: p.get('utm_campaign') || 'none',
                };
            }

            // Referrer category
            function referrerCategory() {
                const ref = document.referrer;
                if (!ref) return 'direct';
                try {
                    const host = new URL(ref).hostname;
                    if (host.includes('google') || host.includes('bing') || host.includes('yahoo') || host.includes('duckduckgo')) return 'search';
                    if (host.includes('facebook') || host.includes('twitter') || host.includes('linkedin') || host.includes('instagram') || host.includes('tiktok')) return 'social';
                    if (host === window.location.hostname) return 'internal';
                    return 'referral';
                } catch { return 'unknown'; }
            }

            // Track pageview
            function trackPageview() {
                put('pageviews', {
                    path: window.location.pathname + window.location.hash,
                    referrer: referrerCategory(),
                    device: deviceType(),
                    viewport: window.innerWidth + 'x' + window.innerHeight,
                    lang: navigator.language,
                    sessionId: sessionId(),
                    utm: utmParams(),
                });

                put('sessions', {
                    sessionId: sessionId(),
                    device: deviceType(),
                    referrer: referrerCategory(),
                    lang: navigator.language,
                    utm: utmParams(),
                    entry: window.location.pathname,
                });
            }

            // Track custom events
            function trackEvent(type, data = {}) {
                put('events', { type, ...data, sessionId: sessionId(), path: window.location.pathname });
            }

            // Section visibility tracking
            function trackSections() {
                const sectionObs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            trackEvent('section_view', { section: e.target.id || e.target.className, visibleAt: Date.now() });
                        }
                    });
                }, { threshold: 0.3 });
                document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));
            }

            // Scroll depth tracking
            function trackScrollDepth() {
                let maxScroll = 0;
                const milestones = [25, 50, 75, 90, 100];
                const hit = new Set();
                window.addEventListener('scroll', () => {
                    const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                    if (scrollPct > maxScroll) maxScroll = scrollPct;
                    milestones.forEach(m => {
                        if (scrollPct >= m && !hit.has(m)) {
                            hit.add(m);
                            trackEvent('scroll_depth', { depth: m });
                        }
                    });
                }, { passive: true });
                window.addEventListener('beforeunload', () => {
                    trackEvent('max_scroll', { depth: maxScroll });
                });
            }

            // CTA click tracking
            function trackCTAs() {
                document.querySelectorAll('.btn-primary, .btn-outline, a[href^="#"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        trackEvent('cta_click', {
                            text: btn.textContent.trim().slice(0, 50),
                            href: btn.getAttribute('href') || '',
                            classList: btn.className,
                        });
                    });
                });
            }

            // Form analytics
            function trackFormAnalytics() {
                const form = document.getElementById('contactForm');
                if (!form) return;
                let formStartTime = 0;
                form.addEventListener('focusin', () => {
                    if (!formStartTime) {
                        formStartTime = Date.now();
                        trackEvent('form_start', { form: 'contact' });
                    }
                });
                form.addEventListener('submit', () => {
                    const duration = formStartTime ? Math.round((Date.now() - formStartTime) / 1000) : 0;
                    trackEvent('form_submit', { form: 'contact', duration });
                    put('conversions', { type: 'contact_form', duration, interest: document.getElementById('cfInterest')?.value || '' });
                });
            }

            // Time on page
            function trackTimeOnPage() {
                const start = Date.now();
                window.addEventListener('beforeunload', () => {
                    const seconds = Math.round((Date.now() - start) / 1000);
                    trackEvent('time_on_page', { seconds });
                });
                // Heartbeat every 30s for active time
                let activeTime = 0;
                let lastActivity = Date.now();
                ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                    document.addEventListener(evt, () => { lastActivity = Date.now(); }, { passive: true, once: false });
                });
                setInterval(() => {
                    if (Date.now() - lastActivity < 60000) activeTime += 30;
                }, 30000);
                window.addEventListener('beforeunload', () => {
                    trackEvent('active_time', { seconds: activeTime });
                });
            }

            // External link tracking
            function trackExternalLinks() {
                document.querySelectorAll('a[href^="http"]').forEach(link => {
                    if (!link.href.includes(window.location.hostname)) {
                        link.addEventListener('click', () => {
                            trackEvent('external_click', { url: link.href, text: link.textContent.trim().slice(0, 50) });
                        });
                    }
                });
            }

            // Core Web Vitals
            function trackWebVitals() {
                // LCP
                if (window.PerformanceObserver) {
                    try {
                        new PerformanceObserver((list) => {
                            const entries = list.getEntries();
                            const lcp = entries[entries.length - 1];
                            trackEvent('web_vital', { metric: 'LCP', value: Math.round(lcp.startTime) });
                        }).observe({ type: 'largest-contentful-paint', buffered: true });
                    } catch {}
                    // FID
                    try {
                        new PerformanceObserver((list) => {
                            list.getEntries().forEach(e => {
                                trackEvent('web_vital', { metric: 'FID', value: Math.round(e.processingStart - e.startTime) });
                            });
                        }).observe({ type: 'first-input', buffered: true });
                    } catch {}
                    // CLS
                    try {
                        let clsValue = 0;
                        new PerformanceObserver((list) => {
                            list.getEntries().forEach(e => { if (!e.hadRecentInput) clsValue += e.value; });
                        }).observe({ type: 'layout-shift', buffered: true });
                        window.addEventListener('beforeunload', () => {
                            trackEvent('web_vital', { metric: 'CLS', value: Math.round(clsValue * 1000) / 1000 });
                        });
                    } catch {}
                }
                // TTFB + DOM load
                window.addEventListener('load', () => {
                    const nav = performance.getEntriesByType('navigation')[0];
                    if (nav) {
                        trackEvent('web_vital', { metric: 'TTFB', value: Math.round(nav.responseStart) });
                        trackEvent('web_vital', { metric: 'DOM_LOAD', value: Math.round(nav.domContentLoadedEventEnd) });
                        trackEvent('web_vital', { metric: 'FULL_LOAD', value: Math.round(nav.loadEventEnd) });
                    }
                });
            }

            // ─────────────────────────────────────────
            // ANALYTICS DASHBOARD (hidden by default)
            // ─────────────────────────────────────────
            async function buildDashboard() {
                const pageviews = await getAll('pageviews');
                const events = await getAll('events');
                const sessions = await getAll('sessions');
                const conversions = await getAll('conversions');

                const now = Date.now();
                const day = 86400000;
                const today = pageviews.filter(p => now - p.timestamp < day);
                const week = pageviews.filter(p => now - p.timestamp < 7 * day);
                const month = pageviews.filter(p => now - p.timestamp < 30 * day);

                const uniqueSessions = (arr) => new Set(arr.map(a => a.sessionId)).size;
                const avgTime = () => {
                    const times = events.filter(e => e.type === 'time_on_page').map(e => e.seconds);
                    return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
                };

                // Device breakdown
                const devices = {};
                pageviews.forEach(p => { devices[p.device] = (devices[p.device] || 0) + 1; });

                // Referrer breakdown
                const referrers = {};
                pageviews.forEach(p => { referrers[p.referrer] = (referrers[p.referrer] || 0) + 1; });

                // Section views
                const sectionViews = {};
                events.filter(e => e.type === 'section_view').forEach(e => {
                    sectionViews[e.section] = (sectionViews[e.section] || 0) + 1;
                });

                // Scroll depth distribution
                const scrollDepths = {};
                events.filter(e => e.type === 'scroll_depth').forEach(e => {
                    scrollDepths[e.depth + '%'] = (scrollDepths[e.depth + '%'] || 0) + 1;
                });

                // CTA clicks
                const ctaClicks = {};
                events.filter(e => e.type === 'cta_click').forEach(e => {
                    const key = e.text || e.href || 'unknown';
                    ctaClicks[key] = (ctaClicks[key] || 0) + 1;
                });

                // Web vitals averages
                const vitals = {};
                events.filter(e => e.type === 'web_vital').forEach(e => {
                    if (!vitals[e.metric]) vitals[e.metric] = [];
                    vitals[e.metric].push(e.value);
                });
                const vitalAvgs = {};
                Object.entries(vitals).forEach(([k, v]) => {
                    vitalAvgs[k] = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
                });

                // UTM campaigns
                const campaigns = {};
                pageviews.forEach(p => {
                    if (p.utm && p.utm.campaign !== 'none') {
                        const key = `${p.utm.source}/${p.utm.medium}/${p.utm.campaign}`;
                        campaigns[key] = (campaigns[key] || 0) + 1;
                    }
                });

                // Conversion rate
                const totalSessions = uniqueSessions(pageviews);
                const convRate = totalSessions > 0 ? ((conversions.length / totalSessions) * 100).toFixed(1) : '0.0';

                // Hourly heatmap (last 7 days)
                const hourly = new Array(24).fill(0);
                week.forEach(p => { hourly[new Date(p.timestamp).getHours()]++; });

                // Daily trend (last 30 days)
                const daily = {};
                month.forEach(p => {
                    const d = new Date(p.timestamp).toISOString().split('T')[0];
                    daily[d] = (daily[d] || 0) + 1;
                });

                return {
                    overview: {
                        totalPageviews: pageviews.length,
                        todayPageviews: today.length,
                        weekPageviews: week.length,
                        monthPageviews: month.length,
                        uniqueVisitors: uniqueSessions(pageviews),
                        todayVisitors: uniqueSessions(today),
                        avgTimeOnPage: avgTime(),
                        conversionRate: convRate,
                        totalConversions: conversions.length,
                        totalEvents: events.length,
                    },
                    devices,
                    referrers,
                    sectionViews,
                    scrollDepths,
                    ctaClicks,
                    vitalAvgs,
                    campaigns,
                    hourly,
                    daily,
                    conversions,
                    raw: { pageviews: pageviews.length, events: events.length, sessions: sessions.length },
                };
            }

            function renderBar(value, max, color) {
                const pct = max > 0 ? Math.round((value / max) * 100) : 0;
                return `<div style="display:flex;align-items:center;gap:8px;margin:2px 0;">
                    <div style="flex:1;height:18px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width 0.4s;"></div>
                    </div>
                    <span style="font-size:12px;color:#9CA3AF;min-width:36px;text-align:right;">${value}</span>
                </div>`;
            }

            function renderHeatmap(hourly) {
                const max = Math.max(...hourly, 1);
                let html = '<div style="display:flex;gap:2px;align-items:flex-end;height:60px;margin-top:8px;">';
                hourly.forEach((v, i) => {
                    const h = max > 0 ? Math.round((v / max) * 56) + 4 : 4;
                    const opacity = max > 0 ? 0.2 + (v / max) * 0.8 : 0.2;
                    html += `<div title="${i}:00 — ${v} views" style="flex:1;height:${h}px;background:rgba(249,115,22,${opacity});border-radius:2px 2px 0 0;cursor:help;"></div>`;
                });
                html += '</div><div style="display:flex;justify-content:space-between;font-size:9px;color:#6B7280;margin-top:2px;"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>';
                return html;
            }

            function renderDailyChart(daily) {
                const entries = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
                if (!entries.length) return '<div style="color:#6B7280;font-size:12px;">No data yet</div>';
                const max = Math.max(...entries.map(([, v]) => v), 1);
                let html = '<div style="display:flex;gap:3px;align-items:flex-end;height:80px;margin-top:8px;">';
                entries.forEach(([date, v]) => {
                    const h = Math.round((v / max) * 72) + 8;
                    html += `<div title="${date}: ${v}" style="flex:1;height:${h}px;background:linear-gradient(to top,#8B5CF6,#EC4899);border-radius:3px 3px 0 0;cursor:help;"></div>`;
                });
                html += '</div>';
                return html;
            }

            function vitalGrade(metric, value) {
                const thresholds = { LCP: [2500, 4000], FID: [100, 300], CLS: [0.1, 0.25], TTFB: [800, 1800] };
                const t = thresholds[metric];
                if (!t) return { grade: '—', color: '#9CA3AF' };
                if (value <= t[0]) return { grade: 'Good', color: '#10B981' };
                if (value <= t[1]) return { grade: 'Needs Work', color: '#F59E0B' };
                return { grade: 'Poor', color: '#EF4444' };
            }

            async function showDashboard() {
                if (document.getElementById('st-analytics-panel')) {
                    document.getElementById('st-analytics-panel').remove();
                    return;
                }

                const data = await buildDashboard();
                const o = data.overview;

                const panel = document.createElement('div');
                panel.id = 'st-analytics-panel';
                panel.style.cssText = 'position:fixed;top:0;right:0;width:520px;height:100vh;background:#0C0C18;color:#E8E4DD;z-index:99999;overflow-y:auto;box-shadow:-4px 0 30px rgba(0,0,0,0.5);font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:13px;';

                const sortedObj = (obj) => Object.entries(obj).sort(([,a],[,b]) => b - a);
                const maxOfObj = (obj) => Math.max(...Object.values(obj), 1);

                let vitalsHtml = '';
                Object.entries(data.vitalAvgs).forEach(([metric, val]) => {
                    const g = vitalGrade(metric, val);
                    const unit = metric === 'CLS' ? '' : 'ms';
                    vitalsHtml += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span>${escHtml(metric)}</span><span style="color:${escHtml(g.color)};font-weight:600;">${escHtml(val)}${escHtml(unit)} <span style="font-size:10px;">${escHtml(g.grade)}</span></span>
                    </div>`;
                });

                panel.innerHTML = `
                    <div style="padding:20px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                            <div>
                                <div style="font-family:'Jost',sans-serif;font-weight:800;font-size:18px;color:#F97316;">ANALYTICS</div>
                                <div style="font-size:11px;color:#6B7280;">SOLOMON TEKNIKA — Data Dashboard</div>
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button id="st-export-csv" style="background:#1B2A4A;color:#E8E4DD;border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;">Export CSV</button>
                                <button id="st-export-json" style="background:#1B2A4A;color:#E8E4DD;border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;">Export JSON</button>
                                <button id="st-clear-data" style="background:#3B0F0F;color:#EF4444;border:1px solid rgba(239,68,68,0.3);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;">Clear</button>
                                <button id="st-close-panel" style="background:none;border:none;color:#9CA3AF;font-size:20px;cursor:pointer;padding:0 4px;">&times;</button>
                            </div>
                        </div>

                        <!-- KPI Cards -->
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Today</div>
                                <div style="font-size:24px;font-weight:800;color:#F97316;">${o.todayPageviews}</div>
                                <div style="font-size:10px;color:#9CA3AF;">${o.todayVisitors} visitors</div>
                            </div>
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">This Week</div>
                                <div style="font-size:24px;font-weight:800;color:#8B5CF6;">${o.weekPageviews}</div>
                                <div style="font-size:10px;color:#9CA3AF;">${o.uniqueVisitors} unique total</div>
                            </div>
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Conversions</div>
                                <div style="font-size:24px;font-weight:800;color:#10B981;">${o.conversionRate}%</div>
                                <div style="font-size:10px;color:#9CA3AF;">${o.totalConversions} form submits</div>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;">All Time Views</div>
                                <div style="font-size:20px;font-weight:700;">${o.totalPageviews}</div>
                            </div>
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;">Avg Time</div>
                                <div style="font-size:20px;font-weight:700;">${o.avgTimeOnPage}s</div>
                            </div>
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;">Events Tracked</div>
                                <div style="font-size:20px;font-weight:700;">${o.totalEvents}</div>
                            </div>
                        </div>

                        <!-- Daily Trend -->
                        <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;color:#E8E4DD;margin-bottom:4px;">Daily Pageviews (14 days)</div>
                            ${renderDailyChart(data.daily)}
                        </div>

                        <!-- Hourly Heatmap -->
                        <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;color:#E8E4DD;margin-bottom:4px;">Hourly Traffic (7 days)</div>
                            ${renderHeatmap(data.hourly)}
                        </div>

                        <!-- Two columns: Devices + Referrers -->
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-weight:600;font-size:12px;margin-bottom:8px;">Devices</div>
                                ${sortedObj(data.devices).map(([k, v]) => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;"><span>${escHtml(k)}</span><span style="color:#F97316;font-weight:600;">${escHtml(v)}</span></div>`).join('')}
                            </div>
                            <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
                                <div style="font-weight:600;font-size:12px;margin-bottom:8px;">Traffic Sources</div>
                                ${sortedObj(data.referrers).map(([k, v]) => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;"><span>${escHtml(k)}</span><span style="color:#8B5CF6;font-weight:600;">${escHtml(v)}</span></div>`).join('')}
                            </div>
                        </div>

                        <!-- Section Engagement -->
                        <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;margin-bottom:8px;">Section Engagement</div>
                            ${sortedObj(data.sectionViews).map(([k, v]) => `<div style="font-size:12px;"><span style="color:#E8E4DD;">${escHtml(k)}</span>${renderBar(v, maxOfObj(data.sectionViews), '#EC4899')}</div>`).join('')}
                        </div>

                        <!-- Scroll Depth -->
                        <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;margin-bottom:8px;">Scroll Depth</div>
                            ${['25%','50%','75%','90%','100%'].map(d => `<div style="font-size:12px;"><span>${d}</span>${renderBar(data.scrollDepths[d] || 0, maxOfObj(data.scrollDepths), '#06B6D4')}</div>`).join('')}
                        </div>

                        <!-- CTA Clicks -->
                        <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;margin-bottom:8px;">CTA Clicks</div>
                            ${sortedObj(data.ctaClicks).slice(0, 10).map(([k, v]) => `<div style="font-size:11px;"><span style="color:#E8E4DD;">${escHtml(k)}</span>${renderBar(v, maxOfObj(data.ctaClicks), '#F97316')}</div>`).join('') || '<div style="color:#6B7280;font-size:12px;">No clicks yet</div>'}
                        </div>

                        <!-- Web Vitals -->
                        <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;margin-bottom:8px;">Core Web Vitals</div>
                            ${vitalsHtml || '<div style="color:#6B7280;font-size:12px;">Collecting data...</div>'}
                        </div>

                        <!-- UTM Campaigns -->
                        ${Object.keys(data.campaigns).length ? `<div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-bottom:16px;">
                            <div style="font-weight:600;font-size:12px;margin-bottom:8px;">UTM Campaigns</div>
                            ${sortedObj(data.campaigns).map(([k, v]) => `<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;"><span>${escHtml(k)}</span><span style="color:#F59E0B;font-weight:600;">${escHtml(v)}</span></div>`).join('')}
                        </div>` : ''}

                        <!-- Data Stats -->
                        <div style="text-align:center;padding:12px;font-size:10px;color:#6B7280;">
                            ${data.raw.pageviews} pageviews &bull; ${data.raw.events} events &bull; ${data.raw.sessions} sessions stored<br>
                            Privacy-first: no cookies, no PII, no third-party. Data stays on-device.
                        </div>
                    </div>
                `;

                document.body.appendChild(panel);

                // Export CSV
                document.getElementById('st-export-csv').addEventListener('click', async () => {
                    const pageviews = await getAll('pageviews');
                    const events = await getAll('events');
                    let csv = 'Type,Timestamp,SessionId,Path,Device,Referrer,Detail\n';
                    pageviews.forEach(p => {
                        csv += `pageview,${new Date(p.timestamp).toISOString()},${p.sessionId},${p.path},${p.device},${p.referrer},\n`;
                    });
                    events.forEach(e => {
                        csv += `event,${new Date(e.timestamp).toISOString()},${e.sessionId},${e.path},,${e.type},${JSON.stringify(e).replace(/,/g, ';')}\n`;
                    });
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                    a.download = `solomon-teknika-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click(); URL.revokeObjectURL(a.href);
                });

                // Export JSON
                document.getElementById('st-export-json').addEventListener('click', async () => {
                    const all = {
                        exportDate: new Date().toISOString(),
                        pageviews: await getAll('pageviews'),
                        events: await getAll('events'),
                        sessions: await getAll('sessions'),
                        conversions: await getAll('conversions'),
                        summary: data.overview,
                    };
                    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                    a.download = `solomon-teknika-analytics-${new Date().toISOString().split('T')[0]}.json`;
                    a.click(); URL.revokeObjectURL(a.href);
                });

                // Close panel
                document.getElementById('st-close-panel').addEventListener('click', () => {
                    document.getElementById('st-analytics-panel').remove();
                });

                // Clear data
                document.getElementById('st-clear-data').addEventListener('click', () => {
                    if (confirm('Clear all analytics data? This cannot be undone.')) {
                        STORES.forEach(s => clearStore(s));
                        document.getElementById('st-analytics-panel').remove();
                        showDashboard();
                    }
                });
            }

            // Dashboard triggers: Ctrl+Shift+K or 5x click on footer copyright
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'K') { e.preventDefault(); showDashboard(); }
            });

            let footerClicks = 0;
            let footerTimer = null;
            const footerLegal = document.querySelector('.footer-legal');
            if (footerLegal) {
                footerLegal.addEventListener('click', () => {
                    footerClicks++;
                    clearTimeout(footerTimer);
                    footerTimer = setTimeout(() => { footerClicks = 0; }, 2000);
                    if (footerClicks >= 5) { footerClicks = 0; showDashboard(); }
                });
            }

            // ─────────────────────────────────────────
            // SUPABASE SYNC (TAVARA Standard)
            // Batches local events and syncs to server
            // ─────────────────────────────────────────
            const SUPABASE_ANALYTICS_URL = CONFIG.SUPABASE_URL ? `${CONFIG.SUPABASE_URL}/functions/v1/analytics-collector` : null;
            const SUPABASE_ERROR_URL = CONFIG.SUPABASE_URL ? `${CONFIG.SUPABASE_URL}/functions/v1/error-logger` : null;
            let eventBatch = [];
            const BATCH_SIZE = 20;
            const BATCH_INTERVAL = 30000; // 30 seconds

            async function fetchWithRetry(url, options, retries = 3) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const res = await fetch(url, options);
                        if (res.ok) return res;
                        if (res.status >= 500 && i < retries - 1) {
                            await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
                            continue;
                        }
                        return res;
                    } catch (err) {
                        if (i === retries - 1) throw err;
                        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
                    }
                }
            }

            function queueForSync(event) {
                eventBatch.push(event);
                if (eventBatch.length >= BATCH_SIZE) flushBatch();
            }

            async function flushBatch() {
                if (!SUPABASE_ANALYTICS_URL || eventBatch.length === 0) return;
                const batch = [...eventBatch];
                eventBatch = [];
                try {
                    await fetchWithRetry(SUPABASE_ANALYTICS_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY || ''}`
                        },
                        body: JSON.stringify({ events: batch })
                    });
                } catch (e) { /* Sync failure is non-critical — data persists in IndexedDB */ }
            }

            // Flush on interval and before page unload
            setInterval(flushBatch, BATCH_INTERVAL);
            window.addEventListener('beforeunload', () => {
                if (SUPABASE_ANALYTICS_URL && eventBatch.length > 0) {
                    navigator.sendBeacon(SUPABASE_ANALYTICS_URL, JSON.stringify({ events: eventBatch }));
                }
            });

            // ─────────────────────────────────────────
            // GLOBAL ERROR HANDLER (Phase 2)
            // Catches uncaught errors + promise rejections
            // ─────────────────────────────────────────
            function logErrorToSupabase(errorType, message, stackTrace, context) {
                if (!SUPABASE_ERROR_URL) return;
                try {
                    const payload = {
                        error_type: errorType,
                        message: String(message).slice(0, 2000),
                        stack_trace: String(stackTrace || '').slice(0, 10000),
                        context: context || {},
                        url: window.location.href,
                        user_agent: navigator.userAgent
                    };
                    navigator.sendBeacon(SUPABASE_ERROR_URL, JSON.stringify(payload));
                } catch (e) { /* Error logging should never cause more errors */ }
            }

            window.addEventListener('error', (e) => {
                logErrorToSupabase('UNCAUGHT_ERROR', e.message, e.error?.stack, {
                    filename: e.filename, lineno: e.lineno, colno: e.colno
                });
            });

            window.addEventListener('unhandledrejection', (e) => {
                logErrorToSupabase('UNHANDLED_REJECTION', String(e.reason), e.reason?.stack, {});
            });

            // Network status monitoring
            window.addEventListener('offline', () => {
                trackEvent('network_status', { status: 'offline' });
                const banner = document.createElement('div');
                banner.id = 'st-offline-banner';
                banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#EF4444;color:white;text-align:center;padding:10px;font-size:14px;font-weight:600;z-index:99999;';
                banner.textContent = 'No internet connection. Some features may be unavailable.';
                document.body.appendChild(banner);
            });

            window.addEventListener('online', () => {
                trackEvent('network_status', { status: 'online' });
                const banner = document.getElementById('st-offline-banner');
                if (banner) banner.remove();
                flushBatch(); // Sync queued events when back online
            });

            // Initialize
            async function init() {
                try {
                    await openDB();
                    trackPageview();
                    trackSections();
                    trackScrollDepth();
                    trackCTAs();
                    trackFormAnalytics();
                    trackTimeOnPage();
                    trackExternalLinks();
                    trackWebVitals();
                } catch (e) {
                    logErrorToSupabase('ANALYTICS_INIT_ERROR', e.message, e.stack, {});
                }
            }

            init();
            return { showDashboard, trackEvent, buildDashboard, getAll, flushBatch, logErrorToSupabase };
        })();
    });

    /* ===== NIKA — Built-in AI Chat (runs after DOM ready) ===== */
    document.addEventListener('DOMContentLoaded', function() {
    (function(){
    const KB = [
        {k:['solomon teknika','what is solomon','who is solomon','about solomon','about the company','what do you do','what does solomon','company'],
         a:"Great question! SOLOMON TEKNIKA is a venture studio \u2014 we build digital marketplace apps really fast (like 14\u201328 days fast), grow them to revenue, and then either sell them or keep scaling. We target 2.5\u20134x returns on exit, with margins protected by a lean studio model. We\u2019re part of the <a href='https://tavaraholdings.com' target='_blank'>TAVARA HOLDINGS</a> family."},
        {k:['tavara','parent company','holdings','tavara holdings','who owns'],
         a:"TAVARA HOLDINGS is our parent company \u2014 and there\u2019s actually a beautiful story behind the name. It comes from the founder\u2019s own bloodline: <strong>Ta</strong>mayo, <strong>Va</strong>llejo, <strong>Ra</strong>mos. The wild part? The word already existed in other languages \u2014 it means \u2018goods and wealth\u2019 in Finnish, \u2018noble daring\u2019 in Marathi, and connects to \u2018truth and perfection\u2019 in Hebrew. Pretty meaningful for a company building something meant to last. Check it out at <a href='https://tavaraholdings.com' target='_blank'>tavaraholdings.com</a>."},
        {k:['optima praxis','opxis','advisory','coaching','transformation advisory'],
         a:"That\u2019s another venture under TAVARA HOLDINGS! OPTIMA PRAXIS is a premium transformation advisory \u2014 think executive coaching, leadership development, and organizational change. They use a proprietary framework called OPXIS and the IGNITE Assessment. If you\u2019re curious, check out <a href='https://optimapraxis.com' target='_blank'>optimapraxis.com</a>."},
        {k:['blas','framework','model','how do you operate','blas x','methodology','sprint','process','build lift accelerate scale'],
         a:"This is the heart of what we do! Our <strong>BLAS X Framework</strong> is a sprint-based cycle that takes an app from idea to exit:<br><br><strong>B</strong>uild \u2014 Ship a working MVP in Sprint 1<br><strong>L</strong>ift \u2014 Get your first paying users in Sprint 2<br><strong>A</strong>ccelerate \u2014 Hit $5K monthly revenue in Sprint 3<br><strong>S</strong>cale \u2014 Package it for buyers in Sprint 4<br><strong>X</strong> \u2014 Exit or Multiply \u2014 sell it, keep the cash flow, or build on top<br><br>No wasted motion. Data decides everything."},
        {k:['build phase','sprint 1','mvp','build sprint'],
         a:"Sprint 1 is all about speed and substance. We go from zero to a fully deployed product \u2014 and it has to process real transactions from day one. No prototypes, no demos. Real engineering at startup speed."},
        {k:['lift phase','sprint 2','paying users','first customers'],
         a:"Sprint 2 is where things get real \u2014 we need people paying. Our approach is supply-first: onboard providers who bring their own clients. The target? 50 real transactions. That\u2019s when you know the engine is turning."},
        {k:['accelerate phase','sprint 3','mrr','traction'],
         a:"Sprint 3 is about proving the flywheel. We\u2019re aiming for $5K MRR sustained over 2+ months. At this stage, retention matters more than acquisition \u2014 we\u2019re optimizing take rates and making sure the unit economics actually work."},
        {k:['scale phase','sprint 4','acquisition','package'],
         a:"Sprint 4 is when we package everything for acquisition. Clean documentation, verified metrics, growth narrative \u2014 then we list on platforms like Acquire.com, Flippa, and Microns.io. Target: 2.5\u20134x revenue multiples."},
        {k:['exit','multiply','endgame','sell','x phase'],
         a:"The X is the endgame \u2014 and it\u2019s not just \u201Csell.\u201D It\u2019s Exit <em>or</em> Multiply. We can sell the venture, hold it for cash flow, or build on top of it. That\u2019s what makes the model powerful \u2014 every app is inventory, and every exit is proof the system works."},
        {k:['portfolio','apps','products','how many apps','inventory','ventures','what apps'],
         a:"We\u2019ve got <strong>6 marketplace apps</strong> in the portfolio right now! Here\u2019s the lineup:<br><br>\u2022 <strong>SERBISUYO</strong> \u2014 Home services (this one\u2019s already LIVE!)<br>\u2022 <strong>PALO FORE</strong> \u2014 Golf lifestyle \u2014 our #1 exit priority<br>\u2022 <strong>PAMEALYA PLATE</strong> \u2014 Home-cooked meal subscriptions<br>\u2022 <strong>PALITADA</strong> \u2014 Construction & renovation<br>\u2022 <strong>ROLETA</strong> \u2014 Raffles & rewards<br>\u2022 <strong>UNIFIED LOCAL CARD</strong> \u2014 Coalition loyalty<br><br>Want to know more about any of them? Just ask!"},
        {k:['serbisuyo','home service','plumbing','cleaning','aircon'],
         a:"SERBISUYO is our flagship \u2014 and it\u2019s already live! It\u2019s a home services marketplace connecting homeowners with vetted providers across 64 services in 11 categories. What makes it unique? Hybrid pricing \u2014 both fixed price and competitive bidding. The market\u2019s massive too: $893B by 2032, and 73% of it is still undigitized. You can check it out at <a href='https://serbisuyo.com' target='_blank'>serbisuyo.com</a>."},
        {k:['palo fore','golf','tee time','coach','garment'],
         a:"Oh, PALO FORE is a fun one. It\u2019s the all-in-one golf lifestyle platform \u2014 course booking, coach marketplace, garment retail, and even club share trading. Think ClassPass but for golf. It\u2019s our #1 exit priority because niche premium in the golf space is incredible."},
        {k:['pamealya','meal','food','home cook','lutong bahay','subscription meal'],
         a:"PAMEALYA PLATE is close to our hearts \u2014 it\u2019s a subscription marketplace for home-cooked meals. Families subscribe to weekly meal plans from verified home cooks in their area. Real food, delivered fresh. Lutong bahay, on schedule. The recurring revenue model makes it especially attractive."},
        {k:['palitada','construction','renovation','contractor','builder'],
         a:"If you\u2019ve ever tried to find a trustworthy contractor, you know the pain. PALITADA solves that \u2014 it\u2019s a marketplace connecting homeowners with verified contractors for construction and renovation. From quoting to milestone payments, everything\u2019s transparent. Check it out at <a href='https://palitada.com' target='_blank'>palitada.com</a>."},
        {k:['roleta','raffle','reward','spin','prize','swerte'],
         a:"ROLETA taps into something deeply Filipino \u2014 the love of \u201Cswerte\u201D (luck)! It\u2019s a digital raffle and rewards marketplace where brands run ticket-based promotions and consumers win real prizes. Gamified engagement meets e-commerce. Super engaging model."},
        {k:['unified local card','loyalty','coalition','reward card'],
         a:"Imagine one loyalty card that works at every local business in your area. That\u2019s UNIFIED LOCAL CARD \u2014 a coalition loyalty platform with cross-merchant rewards. The network effects are what make it really powerful as it scales."},
        {k:['tavara erp','erp','enterprise resource'],
         a:"TAVARA ERP is another venture under the TAVARA HOLDINGS umbrella \u2014 it\u2019s a peso-priced ERP platform built specifically for Filipino MSMEs, with BIR tax compliance and inventory automation baked in. They\u2019re targeting 900K+ SMEs. Learn more at <a href='https://tavaraerp.com' target='_blank'>tavaraerp.com</a>."},
        {k:['blue whale','monitoring','sre','observability','infrastructure'],
         a:"BLUE WHALE is the infrastructure play \u2014 a licensable monitoring and SRE platform that gives engineering teams complete visibility across their stack. Think of it as \u201Csee everything, miss nothing.\u201D Built for the $65B observability market. More at <a href='https://bluewhaleops.com' target='_blank'>bluewhaleops.com</a>."},
        {k:['komuni','hoa','community','subdivision','dues','proptech'],
         a:"KOMUNI is the PropTech play \u2014 built for HOAs and residential communities. Dues collection, gate passes, facility booking, security management \u2014 basically everything a subdivision needs, digitized. Visit <a href='https://komuni.app' target='_blank'>komuni.app</a>."},
        {k:['gridhopper','ev','charger','electric vehicle','lunara'],
         a:"GRIDHOPPER is our clean energy bet \u2014 an EV charging station finder with community-verified data. It runs under LUNARA Tech Corp and is all about making the EV transition practical. Check it out at <a href='https://gridhopper.app' target='_blank'>gridhopper.app</a>."},
        {k:['hanapdok','doctor','clinic','healthcare','hmo'],
         a:"HanapDok makes finding the right doctor so much easier \u2014 search by specialty, HMO, distance, and ratings. It\u2019s a healthcare provider locator built for the Philippines. No teleconsult overhead, just the fastest path to the right care. More at <a href='https://hanapdok.com' target='_blank'>hanapdok.com</a>."},
        {k:['talyer','mechanic','auto repair','car repair','automotive'],
         a:"TALYER solves a real trust problem \u2014 how do you find a mechanic you can actually trust? It\u2019s an auto repair shop locator where you can search by specialty, vehicle brand, pricing, and verified credentials. Serving the \u20B1417B automotive maintenance market in the Philippines."},
        {k:['founder','blas','ramos','who founded','ceo','chairman','leadership','who runs','who started'],
         a:"The man behind it all is <strong>Blas Ramos</strong> \u2014 Founder & Chief Visionary Officer. He\u2019s got 20+ years of executive leadership at global companies like SimCorp, PCCW Solutions, Dairy Farm, and RingCentral, spanning APAC, North America, and EMEA. His big dream? Building the first Filipino-founded global holding company that lasts across generations. You can learn more about him at <a href='https://blasramos.com' target='_blank'>blasramos.com</a>."},
        {k:['values','great','core values','what do you believe','principles'],
         a:"Our values are everything to us \u2014 we call them <strong>G.R.E.A.T.</strong>:<br><br><strong>G</strong>race-Centered Giving \u2014 lead with generosity first<br><strong>R</strong>esolute Resilience \u2014 stay steady when things get hard<br><strong>E</strong>xtraordinary Excellence \u2014 every product should command premium value<br><strong>A</strong>uthentic Action \u2014 results, not just talk<br><strong>T</strong>ransformational Impact \u2014 actually change the game, don\u2019t just play it"},
        {k:['tavara principles','tavara meaning','how you think','idea framework'],
         a:"TAVARA HOLDINGS runs on four principle frameworks \u2014 and they\u2019re actually encoded in the names we chose:<br><br><strong>TAVARA</strong> \u2014 How We Think (think beyond, act with conviction, venture boldly)<br><strong>G.R.E.A.T.</strong> \u2014 What We Value (grace, resilience, excellence, authenticity, transformation)<br><strong>I.D.E.A.</strong> \u2014 How We Build (innovate, develop, execute, amplify)<br><strong>BLAS X</strong> \u2014 How We Operate (build, lift, accelerate, scale, exit/multiply)<br><br>Every decision traces back to these."},
        {k:['acquire','buy','acquirer','investment','investor','purchase','interested in buying'],
         a:"Love that you\u2019re interested! Every app we build is packaged for acquisition from day one. Here\u2019s what you\u2019d get:<br><br>\u2022 <strong>Transparent reporting</strong> \u2014 open metrics shared with serious acquirers under NDA<br>\u2022 <strong>Clean codebase</strong> \u2014 fully documented, transfer-ready<br>\u2022 <strong>Growth narrative</strong> \u2014 clear trajectory with a documented playbook<br>\u2022 <strong>Capital efficient</strong> \u2014 lean studio model, margins protected<br>\u2022 <strong>Smooth transition</strong> \u2014 full handover support included<br><br>Want to explore? <a href='#contact'>Let\u2019s talk</a> \u2014 no pressure, just a conversation."},
        {k:['cost','how much','price','build cost','budget'],
         a:"We build production-grade marketplace apps at internal cost using our BLAS X sprint methodology and shared studio infrastructure. The result: structurally lower build cost than typical agency or in-house spin-ups, which protects margins for any future acquirer. Detailed economics are shared under NDA with serious counterparties."},
        {k:['timeline','how long','how fast','days','speed','14 days','28 days'],
         a:"We move fast \u2014 <strong>14 to 28 days</strong> from zero to market. Every app goes through our BLAS X sprint cycle, and there\u2019s genuinely no wasted motion. Data decides everything, speed is in our DNA."},
        {k:['exit multiple','revenue multiple','valuation','how much worth','roi'],
         a:"We target <strong>2.5\u20134x revenue multiples</strong> on exits. Our apps get listed on platforms like Acquire.com, Flippa, Microns.io, and Empire Flippers. The transaction-based revenue model is key \u2014 it\u2019s what commands the highest premiums from buyers."},
        {k:['market','tam','market size','opportunity'],
         a:"The opportunity is massive. Our portfolio spans home services ($893B market by 2032), golf lifestyle, food delivery, construction, loyalty networks \u2014 and the global app market overall is heading toward $753B by 2033. We\u2019re positioned in the right verticals at the right time."},
        {k:['contact','reach','email','talk','get in touch','phone','meeting','connect','book'],
         a:"I\u2019d love to connect you with the team! You can:<br><br>\u2022 Fill out the <a href='#contact'>contact form</a> right below on this page<br>\u2022 Visit <a href='https://solomonteknika.com'>solomonteknika.com</a><br>\u2022 Or check out <a href='https://tavaraholdings.com' target='_blank'>tavaraholdings.com</a><br><br>Whether it\u2019s about acquiring, partnering, or just being curious \u2014 we\u2019re always happy to chat."},
        {k:['partner','partnership','collaborate','work together','work with you'],
         a:"We\u2019re always open to good partnerships! Whether you\u2019re a platform, agency, or strategic ally \u2014 if there\u2019s a way to create value together, we\u2019re all ears. <a href='#contact'>Drop us a message</a> and let\u2019s see what\u2019s possible."},
        {k:['foundation','charity','social','damara','buhi','aralino','give back','csr'],
         a:"This is something we\u2019re really proud of. TAVARA HOLDINGS supports three foundations:<br><br>\u2022 <strong>DAMARA</strong> \u2014 care and dignity for abandoned elderly Filipinos<br>\u2022 <strong>BUHI</strong> \u2014 free overnight shelter and transitional housing<br>\u2022 <strong>ARALINO</strong> \u2014 a self-sustaining scholarship chain where each graduate funds the next student<br><br>Building wealth is only meaningful if it changes lives too."},
        {k:['tech','technology','stack','what tech','built with','code','engineering'],
         a:"We\u2019re a full-stack engineering operation, and we take code quality seriously. Every app ships with clean, documented architecture that\u2019s transfer-ready from day one. Our BLAS X methodology means production-grade from Sprint 1 \u2014 because that\u2019s what makes exits clean and buyers confident."},
        {k:['funding','self funded','investor','funded','capital','bootstrapped','money'],
         a:"Here\u2019s something we\u2019re proud of \u2014 TAVARA HOLDINGS is <strong>100% founder-owned and self-funded</strong>. No outside investors, no debt, no compromises. Each venture funds the next one. That\u2019s the whole strategy, and it keeps us lean, independent, and focused on what actually matters."},
        {k:['filipino','philippines','pinoy','ph','local','cebu','manila'],
         a:"TAVARA HOLDINGS is <strong>proudly Filipino-founded</strong> with global ambition. The mission is bold: build the first Filipino-founded global holding company that endures across generations. We believe legacy isn\u2019t inherited \u2014 it\u2019s constructed, one venture at a time, with vision, discipline, and heart."},
        {k:['future','plan','roadmap','long term','vision','next','phase'],
         a:"We think in decades, not quarters. Here\u2019s the long game:<br><br>\u2022 <strong>Phase 1 (Now)</strong> \u2014 Six ventures launching simultaneously<br>\u2022 <strong>Phase 2 (Year 1\u20133)</strong> \u2014 Portfolio matures, institutional structure takes shape<br>\u2022 <strong>Phase 3 (Year 3\u20135)</strong> \u2014 Expand into PropTech, FinTech, FranchiseTech<br>\u2022 <strong>Phase 4 (Year 5\u201310)</strong> \u2014 Multi-sector global portfolio<br>\u2022 <strong>Phase 5 (Year 10+)</strong> \u2014 A permanent generational institution<br><br>We\u2019re just getting started."},
        {k:['nika','who are you','your name','what are you','chatbot','ai','assistant'],
         a:"Hey! I\u2019m <strong>NIKA</strong> \u2014 short for tek<strong>NIKA</strong>. I\u2019m the AI assistant here at SOLOMON TEKNIKA. Think of me as your friendly guide to everything about our ventures, the BLAS X framework, acquisition opportunities, and TAVARA HOLDINGS. Ask me anything \u2014 I\u2019m happy to help!"},
        {k:['hire','job','career','work for','hiring','employment'],
         a:"We\u2019re always on the lookout for talented engineers, designers, and growth-minded people who want to build something meaningful. If that sounds like you, <a href='#contact'>send us a message</a> and let us know what role excites you!"},
        {k:['blog','news','article','content','updates'],
         a:"We\u2019ve got a blog! Head over to our <a href='/blog/'>Blog section</a> for the latest articles, behind-the-scenes insights, and updates from the SOLOMON TEKNIKA team."},
        {k:['hello','hi','hey','good morning','good afternoon','good evening','greetings','yo','sup'],
         a:"Hey! Welcome! I\u2019m NIKA \u2014 your go-to guide for all things SOLOMON TEKNIKA. What are you curious about? I can walk you through our portfolio, explain how the BLAS X framework works, talk about acquisition opportunities, or really anything else."},
        {k:['thanks','thank you','appreciate','helpful','great','awesome','cool'],
         a:"Glad I could help! If anything else comes to mind, I\u2019m right here. And if you want to take the conversation further, our team would love to hear from you \u2014 <a href='#contact'>just say the word</a>."},
        {k:['bye','goodbye','see you','later','ciao'],
         a:"It was great chatting with you! Come back anytime \u2014 I\u2019ll be here. Have an awesome day!"},
    ];

    const SUGGESTIONS = ['What is SOLOMON TEKNIKA?','Show me the portfolio','How does BLAS X work?','Who is the founder?','I want to acquire an app'];
    const FALLBACK = [
        "Hmm, that\u2019s a good one! I don\u2019t have the perfect answer for that right now, but I bet our team does. Want to <a href='#contact'>reach out to them</a>?",
        "Interesting question! That\u2019s a bit outside what I know, but our team would love to help. <a href='#contact'>Drop them a note here</a>.",
        "I wish I had a great answer for that! Our human team definitely can help though \u2014 <a href='#contact'>let\u2019s connect you</a>.",
        "Great question! I\u2019m still learning, so I might not have that one nailed yet. But our team is just a message away \u2014 <a href='#contact'>say hello here</a>."
    ];

    const fab = document.getElementById('nikaFab');
    const win = document.getElementById('nikaWindow');
    const msgs = document.getElementById('nikaMsgs');
    const input = document.getElementById('nikaInput');
    const sendBtn = document.getElementById('nikaSend');
    const closeBtn = document.getElementById('nikaClose');
    let isOpen = false, firstOpen = true;

    function toggle(){
        isOpen = !isOpen;
        win.classList.toggle('open', isOpen);
        fab.classList.toggle('open', isOpen);
        if(isOpen && firstOpen){
            firstOpen = false;
            addBot("Hi! I\u2019m <strong>NIKA</strong>, SOLOMON TEKNIKA\u2019s AI assistant. Ask me anything about our ventures, the BLAS X framework, acquisition opportunities, or TAVARA HOLDINGS.");
            showSuggestions(SUGGESTIONS);
        }
        if(isOpen) setTimeout(()=>input.focus(),350);
    }
    fab.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

    function addBot(html){
        const d = document.createElement('div');
        d.className = 'nika-msg bot';
        d.innerHTML = html;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }
    function addUser(text){
        const d = document.createElement('div');
        d.className = 'nika-msg user';
        d.textContent = text;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }
    function showTyping(){
        const d = document.createElement('div');
        d.className = 'nika-typing';
        d.id = 'nikaTyping';
        d.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }
    function hideTyping(){
        const t = document.getElementById('nikaTyping');
        if(t) t.remove();
    }
    function showSuggestions(items){
        const existing = msgs.querySelector('.nika-suggestions');
        if(existing) existing.remove();
        const wrap = document.createElement('div');
        wrap.className = 'nika-suggestions';
        items.forEach(s=>{
            const btn = document.createElement('button');
            btn.className = 'nika-sug';
            btn.textContent = s;
            btn.addEventListener('click',()=>{ wrap.remove(); sendMessage(s); });
            wrap.appendChild(btn);
        });
        msgs.appendChild(wrap);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function findAnswer(q){
        const lower = q.toLowerCase().replace(/[^a-z0-9\s]/g,'');
        const words = lower.split(/\s+/);
        let bestMatch = null, bestScore = 0;
        for(const entry of KB){
            let score = 0;
            for(const keyword of entry.k){
                const kw = keyword.toLowerCase();
                if(lower.includes(kw)){
                    score += kw.split(/\s+/).length * 3;
                }else{
                    for(const w of words){
                        if(w.length > 2 && kw.includes(w)) score += 1;
                    }
                }
            }
            if(score > bestScore){ bestScore = score; bestMatch = entry; }
        }
        return bestScore >= 2 ? bestMatch.a : FALLBACK[Math.floor(Math.random()*FALLBACK.length)];
    }

    function sendMessage(text){
        if(!text.trim()) return;
        addUser(text);
        input.value = '';
        const sug = msgs.querySelector('.nika-suggestions');
        if(sug) sug.remove();
        showTyping();
        const delay = 400 + Math.random()*800;
        setTimeout(()=>{
            hideTyping();
            const answer = findAnswer(text);
            addBot(answer);
            if(Math.random() > 0.5){
                const followUps = ['Tell me about the portfolio','How does BLAS X work?','Who is the founder?','How to acquire an app?','What are your values?'];
                const filtered = followUps.sort(()=>0.5-Math.random()).slice(0,3);
                showSuggestions(filtered);
            }
        }, delay);
    }

    sendBtn.addEventListener('click',()=>sendMessage(input.value));
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') sendMessage(input.value); });
    })();
    });
