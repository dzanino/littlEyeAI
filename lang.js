/* Prepínanie jazyka (SK / EN). Voľba sa pamätá, takže platí naprieč všetkými stránkami. */
(function () {
  var root = document.documentElement;

  function setLang(code) {
    root.setAttribute('data-lang', code);
    root.setAttribute('lang', code);
    document.querySelectorAll('.langbar button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.set === code));
    });
    var t = root.getAttribute('data-title-' + code);
    if (t) document.title = t;
    try { localStorage.setItem('littleye-lang', code); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem('littleye-lang'); } catch (e) {}
  // ?lang=en / ?lang=sk v odkaze má prednosť (napr. odkaz z anglického App Store).
  var q = (location.search.match(/[?&]lang=(sk|en)\b/) || [])[1];
  // Bez voľby sa riadime jazykom prehliadača; slovenčina len pre slovenský prehliadač.
  setLang(q || saved || ((navigator.language || 'en').toLowerCase().indexOf('sk') === 0 ? 'sk' : 'en'));

  document.querySelectorAll('.langbar button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.set); });
  });
})();
