/* ── Visitor tracking + email alerts ───────────────────────────
   Sends events to (a) a GoatCounter dashboard, if its tag is on the
   page, and (b) your Apps Script endpoint, which emails you.
   Other scripts can report their own events with window.grTrack(event, label).
───────────────────────────────────────────────────────────────── */
(function () {

  /* ▼▼ FILL THESE IN ▼▼ */
  var NOTIFY_URL = 'https://script.google.com/macros/s/AKfycbxhIpCHwuzJAh2byEdl7WOl-s5bWM91_UoVsib1Kz-YGbUDFhTA7QpABE2L8FHVOUQo/exec';
  var NOTIFY_KEY = 'gr-p0rt-7x2k9';
  /* ▲▲ leave as-is to disable email alerts ▲▲ */

  window.grTrack = function () {};

  // Ignore obvious bots and your own visits (?me=1 once, then remembered)
  if (/bot|crawl|spider|slurp|preview|headless/i.test(navigator.userAgent)) return;
  if (navigator.webdriver) return;

  // Storage can throw (private mode, blocked cookies); tracking must never break the page
  function store(s, k, v) {
    try { if (v === undefined) return s.getItem(k); s.setItem(k, v); } catch (e) { return null; }
  }

  if (location.search.indexOf('me=1') > -1) store(localStorage, 'skipTrack', '1');
  var SKIP = store(localStorage, 'skipTrack') === '1';

  // One id per browser tab session, so one visitor != ten emails
  var sid = store(sessionStorage, 'sid');
  if (!sid) { sid = Math.random().toString(36).slice(2, 10); store(sessionStorage, 'sid', sid); }

  // Each event is sent at most once per page per session (refreshes and repeat clicks don't re-send)
  var sent = {};
  try { sent = JSON.parse(store(sessionStorage, 'sentEvents') || '{}'); } catch (e) {}

  // Set once the visitor clicks a tracked link or scrolls, so bounces can be told apart
  var interacted = false;

  function context() {
    var q = new URLSearchParams(location.search);
    return {
      key:    NOTIFY_KEY,
      sid:    sid,
      page:   location.pathname + location.search,
      ref:    document.referrer || '(direct)',
      src:    q.get('utm_source') || q.get('src') || '',
      tz:     (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
      lang:   navigator.language || '',
      screen: screen.width + 'x' + screen.height,
      ua:     navigator.userAgent
    };
  }

  function track(event, label) {
    if (SKIP) return;
    var once = event + '|' + location.pathname;
    if (sent[once]) return;
    sent[once] = 1;
    store(sessionStorage, 'sentEvents', JSON.stringify(sent));

    // (a) GoatCounter dashboard
    if (window.goatcounter && window.goatcounter.count && event !== 'pageview') {
      window.goatcounter.count({ path: event, title: label, event: true });
    }

    // (b) Email alert
    if (NOTIFY_URL.indexOf('PASTE') === 0) return;
    var body = context();
    body.event = event;
    body.label = label;
    try {
      fetch(NOTIFY_URL, {
        method:  'POST',
        mode:    'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body:    JSON.stringify(body)
      });
    } catch (e) { /* never break the page over analytics */ }
  }

  window.grTrack = function (event, label) { interacted = true; track(event, label); };

  // 1. Someone landed
  track('pageview', document.title ? 'Page opened: ' + document.title : 'Page opened');

  // 2. Someone clicked something — label each link distinctly
  function cardTitle(a) {
    var card = a.closest('.project-card, .automation-card') || a;
    var el = card.querySelector('h3, h4, .project-title, .automation-title');
    return el ? el.textContent : '';
  }

  function labelFor(a) {
    var h = a.getAttribute('href') || '';
    if (/resume\.pdf$/i.test(h))            return ['click-resume',   'RESUME OPENED'];
    if (/^mailto:/i.test(h))                return ['click-email',    'Email clicked'];
    if (/linkedin\.com/i.test(h))           return ['click-linkedin', 'LinkedIn clicked'];
    if (/github\.com\/gov466\/?$/i.test(h)) return ['click-github',   'GitHub profile clicked'];
    if (/case-studies\//i.test(h)) {
      var c = (cardTitle(a) || h.split('/').pop().replace(/\.html$/, '')).trim().slice(0, 60);
      return ['case-study:' + c, 'Case study opened: ' + c];
    }
    if (/github\.com\/gov466\//i.test(h) || a.closest('.project-card, .automation-card')) {
      // A specific project — name it from the card's own heading
      var t = cardTitle(a) || h.split('/').pop();
      t = decodeURIComponent(t).replace(/\.(pdf|md)$/i, '').trim().slice(0, 60);
      return ['project:' + t, 'Project viewed: ' + t];
    }
    if (/^https?:/i.test(h) && h.indexOf(location.hostname) === -1) {
      return ['outbound:' + (h.split('/')[2] || h), 'Left for ' + (h.split('/')[2] || h)];
    }
    return null;
  }

  document.querySelectorAll('a[href]').forEach(function (a) {
    var l = labelFor(a);
    if (!l) return;
    a.addEventListener('click', function () { interacted = true; track(l[0], l[1]); });
  });

  // 3. Scroll depth tracking (25%, 50%, 75%, 90%, 100%)
  var scrollMarkers = { 25: false, 50: false, 75: false, 90: false, 100: false };
  window.addEventListener('scroll', function () {
    if (SKIP) return;
    interacted = true;
    var pct = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    if (pct >= 25 && !scrollMarkers[25]) { scrollMarkers[25] = true; track('scroll-25', 'Scrolled 25%'); }
    if (pct >= 50 && !scrollMarkers[50]) { scrollMarkers[50] = true; track('scroll-50', 'Scrolled 50%'); }
    if (pct >= 75 && !scrollMarkers[75]) { scrollMarkers[75] = true; track('scroll-75', 'Scrolled 75%'); }
    if (pct >= 90 && !scrollMarkers[90]) { scrollMarkers[90] = true; track('scroll-90', 'Scrolled 90%'); }
    if (pct >= 100 && !scrollMarkers[100]) { scrollMarkers[100] = true; track('scroll-100', 'Scrolled to bottom'); }
  }, { passive: true });

  // 4. Time-based engagement milestones
  setTimeout(function () { track('dwell-30s', 'Stayed 30 seconds'); }, 30000);
  setTimeout(function () { track('dwell-60s', 'Stayed 1 minute'); }, 60000);
  setTimeout(function () { track('dwell-2m', 'Stayed 2 minutes'); }, 120000);
  setTimeout(function () { track('dwell-5m', 'Stayed 5 minutes'); }, 300000);

  // 5. Bounce detection (left without interaction).
  // pagehide fires reliably on mobile too, unlike beforeunload.
  window.addEventListener('pagehide', function () {
    if (!interacted) {
      track('bounce', 'Left without interaction');
    }
  });
})();
