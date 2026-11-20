// Career constellation: background field stars + company-star tooltips.
(function () {
  var mobile = window.matchMedia('(max-width: 600px)');

  // ---------- Field stars ----------
  var dots = document.getElementById('dots');
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var count = mobile.matches ? 55 : 110;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < count; i++) {
    var sz = rnd() < 0.85 ? 1 + rnd() : 1.6 + rnd() * 1.2;
    var o = (0.2 + rnd() * 0.6).toFixed(2);
    var tw = rnd() < 0.3;
    var d = document.createElement('span');
    d.className = tw ? 'dot tw' : 'dot';
    d.style.left = (rnd() * 100).toFixed(2) + '%';
    d.style.top = (rnd() * 100).toFixed(2) + '%';
    d.style.width = d.style.height = sz.toFixed(1) + 'px';
    d.style.opacity = o;
    d.style.setProperty('--o', o);
    if (tw) d.style.animationDelay = (rnd() * 5).toFixed(2) + 's';
    frag.appendChild(d);
  }
  dots.appendChild(frag);

  // ---------- Tooltips ----------
  var tip = document.getElementById('tip');
  var tipLogo = document.getElementById('tip-logo');
  var tipName = document.getElementById('tip-name');
  var tipTitle = document.getElementById('tip-title');
  var tipDates = document.getElementById('tip-dates');
  var stars = Array.prototype.slice.call(document.querySelectorAll('.star'));
  var openStar = null;
  var lastPointer = 'mouse';
  var pointerDownAt = 0;
  var GAP = 22, EDGE = 12;

  function place(star) {
    var r = star.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var x, y;
    if (mobile.matches) {
      x = (vw - w) / 2;
      y = cy < vh / 2 ? cy + 30 : cy - 30 - h;
    } else {
      x = cx < vw / 2 ? cx + GAP : cx - GAP - w;
      y = cy < vh / 2 ? cy - 14 : cy + 14 - h;
    }
    x = Math.max(EDGE, Math.min(x, vw - w - EDGE));
    y = Math.max(EDGE, Math.min(y, vh - h - EDGE));
    tip.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }

  function open(star) {
    if (openStar === star) return;
    if (openStar) close();
    openStar = star;
    tipLogo.src = star.dataset.logo;
    tipName.textContent = star.dataset.name;
    tipTitle.textContent = star.dataset.title;
    tipDates.textContent = star.dataset.dates;
    tip.hidden = false;
    star.classList.add('is-open');
    star.setAttribute('aria-expanded', 'true');
    star.setAttribute('aria-describedby', 'tip');
    place(star);
  }

  function close() {
    if (!openStar) return;
    openStar.classList.remove('is-open');
    openStar.setAttribute('aria-expanded', 'false');
    openStar.removeAttribute('aria-describedby');
    openStar = null;
    tip.hidden = true;
  }

  stars.forEach(function (star) {
    star.addEventListener('pointerdown', function (e) {
      lastPointer = e.pointerType || 'mouse';
      pointerDownAt = Date.now();
    });
    star.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') open(star); });
    star.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && openStar === star) close(); });
    star.addEventListener('focus', function () { if (Date.now() - pointerDownAt > 400) open(star); });
    star.addEventListener('blur', function () { if (openStar === star) close(); });
    star.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    star.addEventListener('click', function (e) {
      e.stopPropagation();
      if (lastPointer === 'mouse') { open(star); return; }
      if (openStar === star) close(); else open(star);
    });
  });

  document.addEventListener('click', close);
  window.addEventListener('resize', function () { if (openStar) place(openStar); });
})();
