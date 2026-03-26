    document.addEventListener('DOMContentLoaded', () => {
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
