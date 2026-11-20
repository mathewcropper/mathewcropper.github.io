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

  // ---------- Every now and then, a visitor from deep space ----------
  // One of a small fleet of (original) villain ships drifts through the background.
  // Any company star it strays too close to locks on with a phaser and takes it down.
  (function invaders() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var NS = 'http://www.w3.org/2000/svg';
    var touch = window.matchMedia('(pointer: coarse)').matches;
    var demo = /^#(ufo|saucer|crystal|bioship|ring|swarm)$/.exec(location.hash); // e.g. /#crystal
    var RANGE = touch ? 80 : 110;
    var SCALE = touch ? 0.85 : 1;
    var COOLDOWN = 1.2; // seconds before the same star can fire again

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
    function rand(a, b) { return a + Math.random() * (b - a); }

    // ----- The fleet -----
    // Each type builds its bodies (the parts a star can shoot), animates them, and has its own explosion.
    var TYPES = {
      saucer: {
        speed: [60, 90], amp: [10, 32],
        build: function (ship) {
          var g = el('g', {}, ship.g);
          el('ellipse', { cx: 0, cy: -3, rx: 5, ry: 4.5, fill: '#9FD8FF', 'fill-opacity': '.85' }, g);
          el('ellipse', { cx: 0, cy: 0.5, rx: 11.5, ry: 3.6, fill: '#B9C2DC' }, g);
          el('ellipse', { cx: 0, cy: 1.6, rx: 8, ry: 2, fill: '#6B7699' }, g);
          [-6.5, 0, 6.5].forEach(function (x, i) {
            el('circle', { cx: x, cy: 0.6, r: 1.1, fill: '#FFB547', 'class': 'ufo-light', style: 'animation-delay:' + (i * 0.2) + 's' }, g);
          });
          return [{ g: g, ox: 0, oy: 0 }];
        },
        animate: function (ship, b) {
          b.g.setAttribute('transform', 'rotate(' + (Math.cos(ship.t * ship.freq * 2) * 8 * ship.dir).toFixed(1) + ')');
        },
        boom: 'sparks'
      },

      // A faceted shard of violet crystal, turning slowly as it goes.
      crystal: {
        speed: [45, 70], amp: [6, 18],
        build: function (ship) {
          var g = el('g', {}, ship.g);
          el('polygon', { points: '0,-11 6,-3 3.5,10 -3.5,10 -6,-3', fill: '#B69CFF', 'fill-opacity': '.35', stroke: '#D9CCFF', 'stroke-width': '.9', 'stroke-linejoin': 'round' }, g);
          el('path', { d: 'M-6,-3 L0,0 L6,-3 M0,0 L0,10 M0,-11 L0,0', fill: 'none', stroke: '#EFE9FF', 'stroke-width': '.5', 'stroke-opacity': '.7' }, g);
          el('circle', { cx: 0, cy: 0, r: 1.6, fill: '#FF4D7A', 'class': 'ufo-core' }, g);
          return [{ g: g, ox: 0, oy: 0 }];
        },
        animate: function (ship, b) {
          var sx = Math.cos(ship.t * 1.6); // a slow turn, faked by squashing
          b.g.setAttribute('transform', 'rotate(' + (ship.t * 14 * ship.dir).toFixed(1) + ') scale(' + (0.35 + 0.65 * Math.abs(sx)).toFixed(2) + ' 1)');
        },
        boom: 'shards'
      },

      // A soft, pulsing bell trailing tendrils: half creature, half ship.
      bioship: {
        speed: [35, 55], amp: [14, 30],
        build: function (ship) {
          var g = el('g', {}, ship.g);
          var tendrils = [];
          for (var i = 0; i < 4; i++) {
            tendrils.push(el('path', { fill: 'none', stroke: '#5BE3A0', 'stroke-width': '1', 'stroke-opacity': '.6', 'stroke-linecap': 'round' }, g));
          }
          el('path', { d: 'M-9,0 C-9,-11 9,-11 9,0 C6,2 3,1 0,2 C-3,1 -6,2 -9,0 Z', fill: '#2FBF85', 'fill-opacity': '.55', stroke: '#8CF5C8', 'stroke-width': '.8' }, g);
          el('circle', { cx: -3, cy: -4, r: 1.2, fill: '#C6FFE6', 'fill-opacity': '.8' }, g);
          el('circle', { cx: 2.5, cy: -5.5, r: 0.9, fill: '#C6FFE6', 'fill-opacity': '.7' }, g);
          el('circle', { cx: 0.5, cy: -2, r: 1.5, fill: '#FF4D7A', 'class': 'ufo-core' }, g);
          return [{ g: g, ox: 0, oy: 0, tendrils: tendrils }];
        },
        animate: function (ship, b) {
          var pulse = 1 + Math.sin(ship.t * 3) * 0.08;
          b.g.setAttribute('transform', 'scale(' + pulse.toFixed(3) + ' ' + (2 - pulse).toFixed(3) + ')');
          b.tendrils.forEach(function (p, i) {
            var x = -6 + i * 4, ph = ship.t * 4 + i;
            var d = 'M' + x + ',1 q' + (Math.sin(ph) * 3).toFixed(1) + ',4 0,7 t' + (Math.sin(ph + 1) * 3).toFixed(1) + ',6';
            p.setAttribute('d', d);
          });
        },
        boom: 'goo'
      },

      // A spinning ring with a hot red core.
      ring: {
        speed: [50, 75], amp: [8, 22],
        build: function (ship) {
          var g = el('g', {}, ship.g);
          el('circle', { cx: 0, cy: 0, r: 8, fill: 'none', stroke: '#8E97B5', 'stroke-width': '3' }, g);
          el('circle', { cx: 0, cy: 0, r: 8, fill: 'none', stroke: '#D5DBEE', 'stroke-width': '1', 'stroke-dasharray': '3 3.3' }, g);
          [0, 90, 180, 270].forEach(function (a) {
            el('line', { x1: 0, y1: -2.6, x2: 0, y2: -6.5, stroke: '#8E97B5', 'stroke-width': '1', transform: 'rotate(' + a + ')' }, g);
          });
          el('circle', { cx: 0, cy: 0, r: 2.6, fill: '#FF5A4D', 'class': 'ufo-core' }, g);
          return [{ g: g, ox: 0, oy: 0 }];
        },
        animate: function (ship, b) {
          b.g.setAttribute('transform', 'rotate(' + (ship.t * 90 * ship.dir).toFixed(1) + ')');
        },
        boom: 'shockwave'
      },

      // Three little drones in formation. Stars can pick them off one at a time.
      swarm: {
        speed: [70, 100], amp: [6, 16],
        build: function (ship) {
          return [[0, 0], [-14, -9], [-14, 9]].map(function (o, i) {
            var g = el('g', {}, ship.g);
            el('path', { d: 'M5,0 L-4,-4 L-2,0 L-4,4 Z', fill: '#59627F', stroke: '#9AA3C2', 'stroke-width': '.6', 'stroke-linejoin': 'round' }, g);
            el('circle', { cx: 1.2, cy: 0, r: 1, fill: '#FF4D4D', 'class': 'ufo-light', style: 'animation-delay:' + (i * 0.15) + 's' }, g);
            return { g: g, ox: o[0], oy: o[1], phase: i * 1.3 };
          });
        },
        animate: function (ship, b) {
          var bob = Math.sin(ship.t * 5 + b.phase) * 1.5;
          b.g.setAttribute('transform', 'translate(' + b.ox + ' ' + (b.oy + bob).toFixed(1) + ')');
        },
        boom: 'puff'
      }
    };
    var NAMES = Object.keys(TYPES);

    // ----- Explosions -----
    function particles(x, y, opts) {
      var parts = [], flash = null, wave = null;
      if (opts.flash) flash = el('circle', { cx: x, cy: y, r: 2, fill: opts.flash });
      if (opts.wave) wave = el('circle', { cx: x, cy: y, r: 3, fill: 'none', stroke: opts.wave, 'stroke-width': '2' });
      for (var i = 0; i < opts.count; i++) {
        var a = Math.random() * Math.PI * 2, v = rand(opts.speed[0], opts.speed[1]);
        var colour = opts.colours[i % opts.colours.length], n;
        if (opts.shape === 'shard') {
          var s = rand(1.5, 3.2);
          n = el('polygon', { points: '0,' + (-s) + ' ' + (s * 0.5) + ',' + s + ' ' + (-s * 0.5) + ',' + s, fill: colour });
        } else {
          n = el('circle', { r: rand(opts.size[0], opts.size[1]).toFixed(1), fill: colour });
        }
        parts.push({ n: n, vx: Math.cos(a) * v, vy: Math.sin(a) * v, spin: rand(-400, 400) });
      }
      var start = performance.now(), life = opts.life;
      (function tick(now) {
        var t = (now - start) / 1000, k = Math.min(t / 0.35, 1);
        if (flash) { flash.setAttribute('r', (2 + k * opts.flashR).toFixed(1)); flash.setAttribute('opacity', (1 - k).toFixed(2)); }
        if (wave) {
          var w = Math.min(t / 0.6, 1);
          wave.setAttribute('r', (3 + w * 34).toFixed(1));
          wave.setAttribute('opacity', (1 - w).toFixed(2));
          wave.setAttribute('stroke-width', (2.5 * (1 - w) + 0.3).toFixed(2));
        }
        parts.forEach(function (p) {
          var drag = Math.exp(-opts.drag * t), d = (1 - drag) / opts.drag;
          var px = x + p.vx * d, py = y + p.vy * d + (opts.gravity || 0) * t * t;
          if (opts.shape === 'shard') p.n.setAttribute('transform', 'translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + (p.spin * t).toFixed(0) + ')');
          else { p.n.setAttribute('cx', px.toFixed(1)); p.n.setAttribute('cy', py.toFixed(1)); }
          p.n.setAttribute('opacity', Math.max(0, 1 - t / life).toFixed(2));
        });
        if (t < Math.max(life, 0.6)) requestAnimationFrame(tick);
        else { if (flash) flash.remove(); if (wave) wave.remove(); parts.forEach(function (p) { p.n.remove(); }); }
      })(start);
    }

    var BOOMS = {
      sparks: { count: 16, speed: [40, 150], size: [0.8, 2.2], drag: 2.5, life: 0.8, colours: ['#FFB547', '#FFD89A', '#E8ECF8', '#9FD8FF'], flash: '#FFE3B0', flashR: 16 },
      shards: { count: 14, speed: [50, 140], drag: 2, life: 1, shape: 'shard', colours: ['#D9CCFF', '#B69CFF', '#EFE9FF', '#FF4D7A'], flash: '#EFE9FF', flashR: 12 },
      goo:    { count: 18, speed: [20, 80], size: [1, 3], drag: 2, life: 1.1, gravity: 18, colours: ['#5BE3A0', '#2FBF85', '#C6FFE6', '#8CF5C8'], flash: '#8CF5C8', flashR: 20 },
      shockwave: { count: 12, speed: [60, 160], size: [0.8, 1.8], drag: 3, life: 0.7, colours: ['#FF5A4D', '#FFB547', '#D5DBEE'], flash: '#FFD2C9', flashR: 10, wave: '#FF8A6B' },
      puff:   { count: 8, speed: [30, 90], size: [0.7, 1.6], drag: 3, life: 0.6, colours: ['#FF4D4D', '#FFB547', '#9AA3C2'], flash: '#FFD2C9', flashR: 7 }
    };

    // ----- Flying -----
    var ship = null, last = 0, running = false, cooldown = new Map(), turn = 0;

    function spawn() {
      if (ship || document.hidden) return schedule();
      var vw = window.innerWidth, vh = window.innerHeight;
      var name = demo && demo[1] !== 'ufo' ? demo[1]
               : demo ? NAMES[turn++ % NAMES.length]          // #ufo: cycle through the fleet
               : NAMES[Math.floor(Math.random() * NAMES.length)];
      var type = TYPES[name], fromLeft = Math.random() < 0.5;
      ship = {
        type: type, name: name,
        g: el('g', { 'class': 'ufo ufo-' + name }),
        x: fromLeft ? -40 : vw + 40, dir: fromLeft ? 1 : -1,
        baseY: vh * rand(0.12, 0.88), amp: rand(type.amp[0], type.amp[1]),
        freq: rand(0.6, 1.4), speed: rand(type.speed[0], type.speed[1]) * (touch ? 0.8 : 1),
        t: 0, shot: null
      };
      ship.bodies = type.build(ship);
      ship.bodies.forEach(function (b) { b.alive = true; });
      if (!running) { running = true; last = 0; requestAnimationFrame(frame); }
    }

    function schedule(first) {
      var wait = demo ? 2500 : first ? rand(6000, 12000) : rand(18000, 40000);
      setTimeout(spawn, wait);
    }

    function centre(node) {
      var r = node.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function bodyPos(b) {
      return { x: ship.x + b.ox * ship.dir * SCALE, y: ship.y + b.oy * SCALE };
    }

    function finish() {
      if (ship.shot) { ship.shot.glow.remove(); ship.shot.core.remove(); }
      ship.g.remove();
      ship = null;
      schedule();
    }

    function frame(now) {
      if (!ship) { running = false; return; }
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      ship.t += dt;
      var vw = window.innerWidth;
      var shot = ship.shot;

      if (!shot) {
        ship.x += ship.dir * ship.speed * dt;
        ship.y = ship.baseY + Math.sin(ship.t * ship.freq * 2) * ship.amp;
      }
      ship.g.setAttribute('transform', 'translate(' + ship.x.toFixed(1) + ' ' + ship.y.toFixed(1) + ') scale(' + (SCALE * ship.dir) + ' ' + SCALE + ')');
      ship.bodies.forEach(function (b) { if (b.alive) ship.type.animate(ship, b); });

      if (shot) {
        // Caught in a beam: shudder, then boom.
        var since = ship.t - shot.at, from = centre(shot.star), to = bodyPos(shot.body);
        var jx = to.x + rand(-1, 1), jy = to.y + rand(-1, 1);
        var on = Math.floor(since * 22) % 3 !== 2;
        [shot.glow, shot.core].forEach(function (line) {
          line.setAttribute('x1', from.x.toFixed(1)); line.setAttribute('y1', from.y.toFixed(1));
          line.setAttribute('x2', jx.toFixed(1)); line.setAttribute('y2', jy.toFixed(1));
          line.style.opacity = on ? 1 : 0.35;
        });
        if (since > 0.45) {
          particles(to.x, to.y, BOOMS[ship.type.boom]);
          shot.body.alive = false;
          shot.body.g.remove();
          shot.glow.remove(); shot.core.remove();
          ship.shot = null;
          if (!ship.bodies.some(function (b) { return b.alive; })) { finish(); }
        }
      } else if (ship.x > 10 && ship.x < vw - 10) {
        // Any company star in range of any part of the ship?
        outer:
        for (var i = 0; i < ship.bodies.length; i++) {
          var b = ship.bodies[i];
          if (!b.alive) continue;
          var p = bodyPos(b);
          for (var j = 0; j < stars.length; j++) {
            var s = stars[j];
            if ((cooldown.get(s) || 0) > now) continue;
            var c = centre(s);
            if (Math.hypot(c.x - p.x, c.y - p.y) < RANGE) {
              cooldown.set(s, now + COOLDOWN * 1000);
              s.classList.add('is-firing');
              setTimeout(function (st) { st.classList.remove('is-firing'); }.bind(null, s), 700);
              ship.shot = { star: s, body: b, at: ship.t,
                            glow: el('line', { 'class': 'phaser-glow' }), core: el('line', { 'class': 'phaser-core' }) };
              break outer;
            }
          }
        }
      }

      if (ship && !ship.shot && ((ship.dir > 0 && ship.x > vw + 50) || (ship.dir < 0 && ship.x < -50))) finish();
      requestAnimationFrame(frame);
    }

    schedule(true);
  })();
})();
