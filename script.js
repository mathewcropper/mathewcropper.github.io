/* mathewcropper.com · Mission Log
   Without this script every log entry shows, stacked. With it, one shows at a time. */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  var ids = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
  var sel = null;

  var live = document.getElementById('live');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var pickers = document.querySelectorAll('[data-entry]');

  function announce(text) {
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 50);
  }

  /* ----- Log entries ----- */
  function select(id, opts) {
    opts = opts || {};
    if (ids.indexOf(id) === -1 || id === sel) return;
    sel = id;

    ids.forEach(function (n) {
      document.getElementById('entry-' + n).classList.toggle('is-open', n === id);
    });
    pickers.forEach(function (el) {
      if (el.getAttribute('data-entry') === id) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });

    var i = ids.indexOf(id);
    prev.hidden = i === 0;
    next.hidden = i === ids.length - 1;

    if (opts.updateHash) history.replaceState(null, '', '#entry-' + id);
    if (opts.announce) {
      var entry = document.getElementById('entry-' + id);
      announce([
        entry.querySelector('.entry-label').textContent,
        entry.querySelector('h3').textContent,
        entry.querySelector('.entry-role').textContent
      ].join(', '));
    }
  }

  function idFromHash() {
    var m = /^#entry-(0[1-9])$/.exec(location.hash);
    return m ? m[1] : null;
  }

  pickers.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      select(el.getAttribute('data-entry'), { updateHash: true, announce: true });
    });
  });
  prev.addEventListener('click', function () {
    select(ids[Math.max(0, ids.indexOf(sel) - 1)], { updateHash: true, announce: true });
  });
  next.addEventListener('click', function () {
    select(ids[Math.min(ids.length - 1, ids.indexOf(sel) + 1)], { updateHash: true, announce: true });
  });
  window.addEventListener('hashchange', function () {
    var id = idFromHash();
    if (id) select(id, { announce: true });
  });

  var deep = idFromHash();
  select(deep || '09');
  if (deep) document.getElementById('entry-' + deep).scrollIntoView();

  /* ----- Crew ID card ----- */
  var card = document.getElementById('card');
  var front = card.querySelector('.card-front');
  var back = card.querySelector('.card-back');
  card.addEventListener('click', function () {
    var flipped = card.getAttribute('aria-pressed') !== 'true';
    card.setAttribute('aria-pressed', String(flipped));
    front.hidden = flipped;
    back.hidden = !flipped;
  });

  /* ----- The tenth star ----- */
  var tenth = document.getElementById('tenth');
  var found = document.getElementById('found');
  tenth.addEventListener('click', function () {
    if (!found.hidden) return;
    tenth.classList.add('is-found');
    found.hidden = false;
    announce(found.textContent);
  });

  /* ----- Fingers of Creation ----- */
  var con = document.getElementById('con');
  con.addEventListener('click', function () {
    con.setAttribute('aria-pressed', String(con.getAttribute('aria-pressed') !== 'true'));
  });

  /* ----- Red alert ----- */
  var layers = document.getElementById('alert-layers');
  var wrap = document.getElementById('wrap');
  var red = document.getElementById('red');
  var calm = document.getElementById('red-calm');
  var done = document.getElementById('red-done');
  var standDown = document.getElementById('stand-down');

  function setAlert(on) {
    layers.hidden = !on;
    wrap.classList.toggle('shake', on);
    red.setAttribute('aria-pressed', String(on));
    calm.hidden = on;
    done.hidden = !on;
  }
  red.addEventListener('click', function () {
    setAlert(red.getAttribute('aria-pressed') !== 'true');
  });
  standDown.addEventListener('click', function () {
    setAlert(false);
    red.focus({ preventScroll: true });
  });
});
