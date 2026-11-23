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
    status.textContent = 'Šī ir mājaslapas priekšskatījuma versija, tāpēc pieteikums netiek nosūtīts. Lūdzu, zvaniet [+371 2X XXX XXX].';
    status.hidden = false;
  });
})();
