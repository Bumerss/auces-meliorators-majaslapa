// Phone menu, section entry, service prefill, request form checks.
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('izvelne');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    btn.querySelector('.menu-label').textContent = open ? 'Aizvērt' : 'Izvēlne';
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
  }

  // Current section: underline slides to the menu link of the section on screen.
  var ink = document.querySelector('.nav-ink');
  var navLinks = [].slice.call(document.querySelectorAll('.nav a[href^="#"]:not(.btn)'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var current = null, lockUntil = 0;
  function moveInk(link, instant) {
    if (!ink) return;
    if (!link || !link.offsetWidth) { ink.style.opacity = '0'; return; }
    var pad = 12; // matches link side padding
    ink.classList.toggle('no-anim', !!instant);
    ink.style.transform = 'translateX(' + (link.offsetLeft + pad) + 'px) scaleX(' + (link.offsetWidth - pad * 2) + ')';
    ink.style.opacity = '1';
  }
  function setCurrent(link, instant) {
    if (link === current) return;
    var wasHidden = !current;
    navLinks.forEach(function (a) { if (a === link) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    current = link;
    moveInk(link, instant || wasHidden);
  }
  function spy() {
    if (Date.now() < lockUntil) return;
    var line = window.innerHeight * 0.35, found = null;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) found = navLinks[i]; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) found = navLinks[navLinks.length - 1];
    setCurrent(found);
  }
  navLinks.forEach(function (a) {
    a.addEventListener('click', function () { lockUntil = Date.now() + 900; setCurrent(a); });
  });
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; spy(); }); }
  }, { passive: true });
  window.addEventListener('resize', function () { moveInk(current, true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInk(current, true); });
  spy();

  // Section entry (CSS keeps content visible when JS or motion is off).
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Service links prefill the "Darba veids" field.
  var select = document.getElementById('darbs');
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-service');
      if (select && v) select.value = v;
    });
  });

  // Request form: inline checks. There is no server yet, so nothing is sent.
  var form = document.getElementById('pieteikums');
  if (!form) return;
  var status = document.getElementById('forma-status');
  var rules = {
    vards: function (v) { return v.trim().length >= 2 ? '' : 'Ierakstiet savu vārdu.'; },
    talrunis: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Ierakstiet tālruni, piemēram, 26 123 456.'; }
  };
  function check(input) {
    var msg = rules[input.name](input.value);
    var err = document.getElementById(input.name + '-err');
    err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { if (input.value) check(input); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') check(input); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!check(input) && !first) first = input;
    });
    if (first) { first.focus(); status.hidden = true; return; }
    status.textContent = 'Šī ir mājaslapas priekšskatījuma versija, tāpēc pieteikums netiek nosūtīts. Lūdzu, zvaniet +371 25 668 515.';
    status.hidden = false;
  });
})();
