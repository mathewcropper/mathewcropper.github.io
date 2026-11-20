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
    var z = zone.getBoundingClientRect();
    x = Math.max(z.left + EDGE / 2, Math.min(x, z.right - w - EDGE / 2));
    y = Math.max(z.top, Math.min(y, z.bottom - h));
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
  var zone = document.getElementById('zone');
  var CLEAR = 18;   // gap between a star's centre and the card edge
  var SPACING = 34; // minimum distance between two company stars

  function overlaps(x, y, box) {
    return x > box.left && x < box.right && y > box.top && y < box.bottom;
  }

  function tooClose(x, y, placed, space) {
    space = space || SPACING;
    for (var i = 0; i < placed.length; i++) {
      var dx = placed[i].x - x, dy = placed[i].y - y;
      if (dx * dx + dy * dy < space * space) return true;
    }
    return false;
  }

  function avoidCard() {
    var z = zone.getBoundingClientRect();
    var c = card.getBoundingClientRect();
    var box = { left: c.left - CLEAR, right: c.right + CLEAR, top: c.top - CLEAR, bottom: c.bottom + CLEAR };
    var pad = 14; // keep the tap target inside the tappable zone
    var minX = z.left + pad, maxX = z.right - pad, minY = z.top + pad, maxY = z.bottom - pad;
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
        return o.x >= minX && o.x <= maxX && o.y >= minY && o.y <= maxY;
      }).sort(function (a, b) { return a.d - b.d; });

      for (var i = 0; i < options.length; i++) {
        var o = options[i];
        // Slide along the edge until the spot isn't crowding another star.
        for (var step = 0; step < 8; step++) {
          var shift = (step % 2 ? 1 : -1) * Math.ceil(step / 2) * SPACING;
          var nx = o.axis === 'x' ? o.x + shift : o.x;
          var ny = o.axis === 'y' ? o.y + shift : o.y;
          if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
          if (overlaps(nx, ny, box) || tooClose(nx, ny, placed)) continue;
          s.style.left = (nx - z.left) + 'px';
          s.style.top = (ny - z.top) + 'px';
          placed.push({ x: nx, y: ny });
          return;
        }
      }
      // No room along the card's edges (small screens): take the nearest free spot anywhere.
      // If it's very cramped, let stars sit a little closer together.
      var best = null;
      [SPACING, 24].forEach(function (space) {
        if (best) return;
        var bestD = Infinity;
        for (var gy = minY; gy <= maxY; gy += 6) {
          for (var gx = minX; gx <= maxX; gx += 6) {
            if (overlaps(gx, gy, box) || tooClose(gx, gy, placed, space)) continue;
            var dd = (gx - x) * (gx - x) + (gy - y) * (gy - y);
            if (dd < bestD) { bestD = dd; best = { x: gx, y: gy }; }
          }
        }
      });
      if (best) {
        s.style.left = (best.x - z.left) + 'px';
        s.style.top = (best.y - z.top) + 'px';
        placed.push(best);
      } else {
        placed.push({ x: x, y: y }); // truly no space: leave it
      }
    });
  }

  // ---------- Desktop: stars stay put, nudged clear of the card ----------
  function initDesktop() {
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
    // Phones report the new size late after rotating, so check again once it settles.
    window.addEventListener('orientationchange', function () {
      relayout();
      setTimeout(relayout, 250);
      setTimeout(relayout, 700);
    });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(relayout);
      ro.observe(card);
      ro.observe(document.documentElement);
    }
  }

  // ---------- Phones: draggable card, drifting stars ----------
  function initTouch() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PAD = 14, SEP = 38, CLEAR_T = 16;
    var dx = 0, dy = 0;       // card offset from its centred spot
    var z, bodies = [];
    var dragging = false, suppressClick = false;

    function zoneRect() { z = zone.getBoundingClientRect(); }

    function cardBox() {
      var c = card.getBoundingClientRect();
      return { left: c.left - z.left - CLEAR_T, right: c.right - z.left + CLEAR_T,
               top: c.top - z.top - CLEAR_T, bottom: c.bottom - z.top + CLEAR_T };
    }

    function bounds() {
      return { minX: PAD, maxX: z.width - PAD, minY: PAD, maxY: z.height - PAD };
    }

    function inBox(x, y, b) { return x > b.left && x < b.right && y > b.top && y < b.bottom; }

    // Somewhere free: outside the card and as far as possible from other stars.
    function freeSpot(skip) {
      var b = bounds(), box = cardBox(), best = null, bestScore = -1;
      for (var k = 0; k < 60; k++) {
        var x = b.minX + Math.random() * (b.maxX - b.minX);
        var y = b.minY + Math.random() * (b.maxY - b.minY);
        if (inBox(x, y, box)) continue;
        var near = Infinity;
        bodies.forEach(function (o) {
          if (o === skip) return;
          var d = Math.hypot(o.x - x, o.y - y);
          if (d < near) near = d;
        });
        if (near > bestScore) { bestScore = near; best = { x: x, y: y }; }
      }
      return best;
    }

    zoneRect();
    stars.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var a = Math.random() * Math.PI * 2;
      var speed = reduce ? 0 : 5 + Math.random() * 6; // px per second
      bodies.push({ el: s, x: r.left + r.width / 2 - z.left, y: r.top + r.height / 2 - z.top,
                    vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, speed: speed });
      s.style.left = '0px';
      s.style.top = '0px';
    });

    // Scatter any star that starts behind the card or crowded by another.
    function scatter() {
      var b = bounds(), box = cardBox();
      bodies.forEach(function (o, i) {
        var crowded = bodies.some(function (p, j) { return j < i && Math.hypot(p.x - o.x, p.y - o.y) < SEP; });
        var out = o.x < b.minX || o.x > b.maxX || o.y < b.minY || o.y > b.maxY;
        if (inBox(o.x, o.y, box) || crowded || out) {
          var spot = freeSpot(o);
          if (spot) { o.x = spot.x; o.y = spot.y; }
        }
      });
    }
    scatter();

    function step(dt) {
      var b = bounds(), box = cardBox();
      bodies.forEach(function (o) {
        if (o.el === openStar) return; // hold still while its card is showing
        if (o.speed) {
          // Wander a little so paths don't look mechanical.
          var a = Math.atan2(o.vy, o.vx) + (Math.random() - 0.5) * 0.6 * dt;
          o.vx = Math.cos(a) * o.speed;
          o.vy = Math.sin(a) * o.speed;
        }
        o.x += o.vx * dt;
        o.y += o.vy * dt;
      });

      // Keep a little space between stars.
      for (var i = 0; i < bodies.length; i++) {
        for (var j = i + 1; j < bodies.length; j++) {
          var p = bodies[i], q = bodies[j];
          var ddx = q.x - p.x, ddy = q.y - p.y, d = Math.hypot(ddx, ddy) || 0.01;
          if (d >= SEP) continue;
          var push = (SEP - d) / 2, ux = ddx / d, uy = ddy / d;
          var pFixed = p.el === openStar, qFixed = q.el === openStar;
          if (!pFixed) { p.x -= ux * push * (qFixed ? 2 : 1); p.y -= uy * push * (qFixed ? 2 : 1); }
          if (!qFixed) { q.x += ux * push * (pFixed ? 2 : 1); q.y += uy * push * (pFixed ? 2 : 1); }
          if (p.speed) { p.vx -= ux * 2; p.vy -= uy * 2; }
          if (q.speed) { q.vx += ux * 2; q.vy += uy * 2; }
        }
      }

      bodies.forEach(function (o) {
        // Bounce off the edges of the tappable zone.
        if (o.x < b.minX) { o.x = b.minX; o.vx = Math.abs(o.vx); }
        if (o.x > b.maxX) { o.x = b.maxX; o.vx = -Math.abs(o.vx); }
        if (o.y < b.minY) { o.y = b.minY; o.vy = Math.abs(o.vy); }
        if (o.y > b.maxY) { o.y = b.maxY; o.vy = -Math.abs(o.vy); }

        // Get out of the card's way, out through the nearest edge that's on screen.
        if (inBox(o.x, o.y, box)) {
          var exits = [
            { d: o.x - box.left, x: box.left, y: o.y, vx: -1, vy: 0 },
            { d: box.right - o.x, x: box.right, y: o.y, vx: 1, vy: 0 },
            { d: o.y - box.top, x: o.x, y: box.top, vx: 0, vy: -1 },
            { d: box.bottom - o.y, x: o.x, y: box.bottom, vx: 0, vy: 1 }
          ].filter(function (e) {
            return e.x >= b.minX && e.x <= b.maxX && e.y >= b.minY && e.y <= b.maxY;
          }).sort(function (m, n) { return m.d - n.d; });
          if (exits.length) {
            var e = exits[0];
            o.x = e.x; o.y = e.y;
            if (e.vx) o.vx = e.vx * Math.abs(o.vx || o.speed);
            if (e.vy) o.vy = e.vy * Math.abs(o.vy || o.speed);
          } else {
            var spot = freeSpot(o);
            if (spot) { o.x = spot.x; o.y = spot.y; }
          }
          if (o.el === openStar) close();
        }
        o.el.style.transform = 'translate3d(' + o.x.toFixed(1) + 'px,' + o.y.toFixed(1) + 'px,0)';
      });
    }

    var last = 0;
    function frame(t) {
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      step(dt);
      requestAnimationFrame(frame);
    }
    step(0);
    requestAnimationFrame(frame);

    // ----- Dragging the card -----
    var startX, startY, startDx, startDy, base, pid = null;

    function setOffset(x, y) {
      var vw = window.innerWidth, vh = window.innerHeight, m = 8;
      // base = where the card sits with no offset
      x = Math.max(m - base.left, Math.min(x, vw - m - base.right));
      y = Math.max(m - base.top, Math.min(y, vh - m - base.bottom));
      dx = x; dy = y;
      card.style.setProperty('--dx', dx + 'px');
      card.style.setProperty('--dy', dy + 'px');
    }

    function measureBase() {
      var r = card.getBoundingClientRect();
      base = { left: r.left - dx, right: r.right - dx, top: r.top - dy, bottom: r.bottom - dy };
    }

    card.addEventListener('pointerdown', function (e) {
      if (pid !== null) return;
      pid = e.pointerId;
      startX = e.clientX; startY = e.clientY; startDx = dx; startDy = dy;
      measureBase();
      dragging = false;
    });
    card.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      var mx = e.clientX - startX, my = e.clientY - startY;
      if (!dragging && Math.hypot(mx, my) > 6) {
        dragging = true;
        try { card.setPointerCapture(pid); } catch (err) {}
        card.classList.add('is-dragging');
        close();
      }
      if (dragging) setOffset(startDx + mx, startDy + my);
    });
    function endDrag(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      if (dragging) {
        dragging = false;
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
        card.classList.remove('is-dragging');
      }
    }
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    // A drag that ends over the LinkedIn link shouldn't open it.
    card.addEventListener('click', function (e) {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
    }, true);

    // ----- Screen size changes -----
    var pending = false;
    function relayout(recentre) {
      if (recentre) { dx = 0; dy = 0; card.style.setProperty('--dx', '0px'); card.style.setProperty('--dy', '0px'); }
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        zoneRect();
        measureBase();
        setOffset(dx, dy);
        scatter();
        if (openStar) place(openStar);
      });
    }
    window.addEventListener('resize', function () { relayout(false); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { relayout(false); });
    // Rotating: put the card back in the middle and let the stars resettle.
    window.addEventListener('orientationchange', function () {
      relayout(true);
      setTimeout(function () { relayout(false); }, 250);
      setTimeout(function () { relayout(false); }, 700);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { relayout(false); });
  }

  if (window.matchMedia('(pointer: coarse)').matches) initTouch(); else initDesktop();
  document.addEventListener('click', close);

  // ---------- Every now and then, a UFO ----------
  // Flies through the background. If it strays too close to a company star,
  // that star fires a phaser and the UFO goes up in sparks.
  (function ufos() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var NS = 'http://www.w3.org/2000/svg';
    var touch = window.matchMedia('(pointer: coarse)').matches;
    var demo = location.hash === '#ufo'; // mathewcropper.com/#ufo: one every few seconds
    var RANGE = touch ? 80 : 110;        // how close it can get before a star fires
    var SCALE = touch ? 0.85 : 1;

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ufo-layer');
    svg.setAttribute('aria-hidden', 'true');
    document.getElementById('sky').insertBefore(svg, zone);

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }

    function buildUfo() {
      var g = el('g', { 'class': 'ufo' });
      el('ellipse', { cx: 0, cy: -3, rx: 5, ry: 4.5, fill: '#9FD8FF', 'fill-opacity': '.85' }, g); // glass dome
      el('ellipse', { cx: 0, cy: 0.5, rx: 11.5, ry: 3.6, fill: '#B9C2DC' }, g);                     // saucer
      el('ellipse', { cx: 0, cy: 1.6, rx: 8, ry: 2, fill: '#6B7699' }, g);                           // underside
      [-6.5, 0, 6.5].forEach(function (x, i) {
        el('circle', { cx: x, cy: 0.6, r: 1.1, fill: '#FFB547', 'class': 'ufo-light', style: 'animation-delay:' + (i * 0.2) + 's' }, g);
      });
      return g;
    }

    var ufo = null, last = 0, running = false;

    function spawn() {
      if (ufo || document.hidden) return schedule();
      var vw = window.innerWidth, vh = window.innerHeight;
      var fromLeft = Math.random() < 0.5;
      ufo = {
        g: buildUfo(),
        x: fromLeft ? -30 : vw + 30,
        dir: fromLeft ? 1 : -1,
        baseY: vh * (0.12 + Math.random() * 0.76),
        amp: 10 + Math.random() * 22,
        freq: 0.6 + Math.random() * 0.8,
        speed: (touch ? 45 : 60) + Math.random() * 30,
        t: 0, state: 'flying'
      };
      if (!running) { running = true; last = 0; requestAnimationFrame(frame); }
    }

    function schedule(first) {
      var wait = demo ? 2500 : first ? 6000 + Math.random() * 6000 : 18000 + Math.random() * 22000;
      setTimeout(spawn, wait);
    }

    function starCentre(s) {
      var r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function fire(star, from) {
      ufo.state = 'hit';
      ufo.hitAt = ufo.t;
      star.classList.add('is-firing');
      setTimeout(function () { star.classList.remove('is-firing'); }, 700);
      ufo.beam = {
        star: star,
        glow: el('line', { 'class': 'phaser-glow' }),
        core: el('line', { 'class': 'phaser-core' })
      };
    }

    function explode(x, y) {
      var flash = el('circle', { cx: x, cy: y, r: 2, 'class': 'ufo-flash' });
      var parts = [];
      var colours = ['#FFB547', '#FFD89A', '#E8ECF8', '#9FD8FF'];
      for (var i = 0; i < 16; i++) {
        var a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 110;
        parts.push({
          n: el('circle', { r: (0.8 + Math.random() * 1.4).toFixed(1), fill: colours[i % colours.length] }),
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v
        });
      }
      var start = performance.now();
      (function burst(now) {
        var t = (now - start) / 1000, life = 0.8;
        var k = Math.min(t / 0.35, 1);
        flash.setAttribute('r', (2 + k * 16).toFixed(1));
        flash.setAttribute('opacity', (1 - k).toFixed(2));
        parts.forEach(function (p) {
          var drag = Math.exp(-2.5 * t);
          var px = p.x + p.vx * (1 - drag) / 2.5, py = p.y + p.vy * (1 - drag) / 2.5;
          p.n.setAttribute('cx', px.toFixed(1));
          p.n.setAttribute('cy', py.toFixed(1));
          p.n.setAttribute('opacity', Math.max(0, 1 - t / life).toFixed(2));
        });
        if (t < life) requestAnimationFrame(burst);
        else { flash.remove(); parts.forEach(function (p) { p.n.remove(); }); }
      })(start);
    }

    function done() {
      if (ufo.beam) { ufo.beam.glow.remove(); ufo.beam.core.remove(); }
      ufo.g.remove();
      ufo = null;
      schedule();
    }

    function frame(now) {
      if (!ufo) { running = false; return; }
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      ufo.t += dt;
      var vw = window.innerWidth;

      if (ufo.state === 'flying') {
        ufo.x += ufo.dir * ufo.speed * dt;
        var y = ufo.baseY + Math.sin(ufo.t * ufo.freq * 2) * ufo.amp;
        ufo.y = y;
        // Any company star close enough? Only once the UFO is properly on screen.
        if (ufo.x > 10 && ufo.x < vw - 10) {
          for (var i = 0; i < stars.length; i++) {
            var c = starCentre(stars[i]);
            if (Math.hypot(c.x - ufo.x, c.y - ufo.y) < RANGE) { fire(stars[i], c); break; }
          }
        }
        if ((ufo.dir > 0 && ufo.x > vw + 40) || (ufo.dir < 0 && ufo.x < -40)) { done(); requestAnimationFrame(frame); return; }
      } else if (ufo.state === 'hit') {
        // Caught in the beam: shudder, then boom.
        var since = ufo.t - ufo.hitAt;
        var c2 = starCentre(ufo.beam.star);
        var jx = ufo.x + (Math.random() - 0.5) * 2, jy = ufo.y + (Math.random() - 0.5) * 2;
        var on = Math.floor(since * 22) % 3 !== 2; // a little flicker
        [ufo.beam.glow, ufo.beam.core].forEach(function (line) {
          line.setAttribute('x1', c2.x.toFixed(1)); line.setAttribute('y1', c2.y.toFixed(1));
          line.setAttribute('x2', jx.toFixed(1)); line.setAttribute('y2', jy.toFixed(1));
          line.style.opacity = on ? 1 : 0.35;
        });
        ufo.g.setAttribute('transform', 'translate(' + jx.toFixed(1) + ' ' + jy.toFixed(1) + ') scale(' + SCALE + ')');
        if (since > 0.45) { explode(ufo.x, ufo.y); done(); }
        requestAnimationFrame(frame);
        return;
      }

      var tilt = Math.cos(ufo.t * ufo.freq * 2) * 8 * ufo.dir;
      ufo.g.setAttribute('transform', 'translate(' + ufo.x.toFixed(1) + ' ' + ufo.y.toFixed(1) + ') rotate(' + tilt.toFixed(1) + ') scale(' + SCALE + ')');
      requestAnimationFrame(frame);
    }

    schedule(true);
  })();
})();
