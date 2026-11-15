/* dzanino.github.io/littlEyeAI — site.js
   Anonymous visit counter (GoatCounter): no cookies, no identifiers, nothing stored about the visitor.
   A visit = first page opened in a browser tab session (sessionStorage), not every page view.
   Bots and headless browsers are not counted. Owner can exclude own device in the panel.
   Hidden panel: click "©" in the footer three times quickly. */
(function () {
  var GC = 'https://forensika.goatcounter.com';
  var HOST = true;                    // true: do cesty sa pridá hostiteľ (podweb na github.io)
  var OWN = 'fz-own';                   // localStorage: '1' = nepočítať toto zariadenie

  function store(kind, k, v) {
    try {
      var s = kind === 'l' ? window.localStorage : window.sessionStorage;
      if (v === undefined) return s.getItem(k);
      if (v === null) s.removeItem(k); else s.setItem(k, v);
    } catch (e) { return null; }
  }
  function enc(x) { return encodeURIComponent(x || ''); }

  // ---- count the page view ----
  var ua = navigator.userAgent || '';
  var isBot = navigator.webdriver || /bot|crawl|spider|slurp|preview|lighthouse|headless|pingdom|monitor/i.test(ua);
  var local = /^(localhost|127\.|\[?::1|.*\.local$)/.test(location.hostname) || location.protocol === 'file:';
  if (!isBot && !local && store('l', OWN) !== '1') {
    var path = (HOST ? location.host : '') + location.pathname;
    var ref = document.referrer && document.referrer.indexOf(location.origin) !== 0 ? document.referrer : '';
    var url = GC + '/count?p=' + enc(path) + '&t=' + enc(document.title) + '&r=' + enc(ref) +
      '&s=' + enc([screen.width, screen.height, window.devicePixelRatio || 1].join(',')) + '&b=0&rnd=' + Math.random().toString(36).slice(2);
    try { if (!(navigator.sendBeacon && navigator.sendBeacon(url))) fetch(url, { mode: 'no-cors', keepalive: true, credentials: 'omit' }); } catch (e) {}
  }

  // ---- hidden panel ----
  function fmt(n) { return n === null || n === undefined ? '–' : String(n).replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  var panel = null;
  function close() { if (panel) { panel.remove(); panel = null; } }

  function open() {
    if (panel) return close();
    if (store('l', OWN) === null) store('l', OWN, '1'); // first open: stop counting this device
    panel = document.createElement('div');
    panel.setAttribute('role', 'dialog');
    panel.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;max-width:320px;width:calc(100% - 32px);' +
      'background:#2d1440;color:#f3e9fa;border-radius:14px;padding:16px 18px;font:14px/1.5 -apple-system,Helvetica,Arial,sans-serif;' +
      'box-shadow:0 18px 44px rgba(0,0,0,.35)';
    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<b style="font-size:15px">Návštevnosť littlEye AI</b>' +
        '<button type="button" aria-label="Zavrieť" style="background:none;border:0;color:inherit;opacity:.7;font-size:20px;cursor:pointer;line-height:1">×</button>' +
      '</div>' +
      '<div data-x="body" style="opacity:.85">Načítavam…</div>' +
      '<label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:12.5px;opacity:.75;cursor:pointer">' +
        '<input type="checkbox" style="margin-top:3px"> Nepočítať návštevy z tohto zariadenia</label>' +
      '<div style="margin-top:8px;font-size:12.5px"><a href="' + GC + '" target="_blank" rel="noopener" style="color:inherit">Podrobná štatistika (GoatCounter) →</a></div>';
    document.body.appendChild(panel);
    panel.querySelector('button').onclick = close;
    var cb = panel.querySelector('input');
    cb.checked = store('l', OWN) === '1';
    cb.onchange = function () { store('l', OWN, cb.checked ? '1' : '0'); };

    var body = panel.querySelector('[data-x="body"]');
    var done = false;
    var timer = setTimeout(function () { if (!done && panel) body.textContent = 'Počítadlo práve neodpovedá, skúste neskôr.'; }, 10000);
    fetch(GC + '/counter/TOTAL.json', { mode: 'cors', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        done = true; clearTimeout(timer);
        if (!panel) return;
        if (!j) { body.textContent = 'Počty sa nenačítali. Prehliadač ich môže blokovať (napríklad štíty v Brave), podrobná štatistika je na odkaze nižšie.'; return; }
        body.innerHTML = '<div style="display:grid;grid-template-columns:1fr auto;gap:2px 12px">' +
          '<span>Návštevníci spolu</span><b>' + fmt(j.count_unique || j.count) + '</b>' +
          (j.count_unique ? '<span>Zobrazenia stránok</span><b>' + fmt(j.count) + '</b>' : '') +
          '</div><div style="margin-top:8px;font-size:12px;opacity:.75">Celý web vrátane podstránok, od 15. 11. 2026. Roboty sa nepočítajú.</div>';
      })
      .catch(function () { done = true; clearTimeout(timer); if (panel) body.textContent = 'Počty sa nenačítali. Prehliadač ich môže blokovať (napríklad štíty v Brave), podrobná štatistika je na odkaze nižšie.'; });
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var clicks = 0, timer = null;
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-fz]') : null;
    if (!t) return;
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(function () { clicks = 0; }, 1200);
    if (clicks >= 3) { clicks = 0; open(); }
  });
})();
