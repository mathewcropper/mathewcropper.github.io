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

  // ---------- Keep company stars clear of the crew card ----------
  var card = document.querySelector('.card');
  var CLEAR = 18;   // gap between a star's centre and the card edge
  var SPACING = 34; // minimum distance between two company stars

  function overlaps(x, y, box) {
    return x > box.left && x < box.right && y > box.top && y < box.bottom;
  }

  function tooClose(x, y, placed) {
    for (var i = 0; i < placed.length; i++) {
      var dx = placed[i].x - x, dy = placed[i].y - y;
      if (dx * dx + dy * dy < SPACING * SPACING) return true;
    }
    return false;
  }

  function avoidCard() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var c = card.getBoundingClientRect();
    var box = { left: c.left - CLEAR, right: c.right + CLEAR, top: c.top - CLEAR, bottom: c.bottom + CLEAR };
    var min = 22; // keep the whole 44px tap target on screen
    var placed = [];

    // Reset any earlier nudges so stars start from their designed spots.
    stars.forEach(function (s) { s.style.left = ''; s.style.top = ''; });

    stars.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (!overlaps(x, y, box)) { placed.push({ x: x, y: y }); return; }

      // Candidate spots just outside each edge, nearest edge first.
      var options = [
        { d: x - box.left, x: box.left, y: y, axis: 'y' },
        { d: box.right - x, x: box.right, y: y, axis: 'y' },
        { d: y - box.top, x: x, y: box.top, axis: 'x' },
        { d: box.bottom - y, x: x, y: box.bottom, axis: 'x' }
      ].filter(function (o) {
        return o.x >= min && o.x <= vw - min && o.y >= min && o.y <= vh - min;
      }).sort(function (a, b) { return a.d - b.d; });

      for (var i = 0; i < options.length; i++) {
        var o = options[i];
        // Slide along the edge until the spot isn't crowding another star.
        for (var step = 0; step < 8; step++) {
          var shift = (step % 2 ? 1 : -1) * Math.ceil(step / 2) * SPACING;
          var nx = o.axis === 'x' ? o.x + shift : o.x;
          var ny = o.axis === 'y' ? o.y + shift : o.y;
          if (nx < min || nx > vw - min || ny < min || ny > vh - min) continue;
          if (overlaps(nx, ny, box) || tooClose(nx, ny, placed)) continue;
          s.style.left = nx + 'px';
          s.style.top = ny + 'px';
          placed.push({ x: nx, y: ny });
          return;
        }
      }
      placed.push({ x: x, y: y }); // nowhere free (tiny screen): leave it
    });
  }

  var pending = false;
  function relayout() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      avoidCard();
      if (openStar) place(openStar);
    });
  }

  avoidCard();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener('load', relayout);
  window.addEventListener('resize', relayout);
  window.addEventListener('scroll', relayout, { passive: true });
  document.addEventListener('click', close);
})();
