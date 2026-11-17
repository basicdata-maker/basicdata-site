/* BasicData site script: theme switch, products dropdown, mobile nav, docs TOC highlight. No tracking. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'bd-theme';

  /* ---------- Theme ---------- */
  function readTheme() {
    try { var t = localStorage.getItem(KEY); return (t === 'light' || t === 'dark') ? t : 'system'; }
    catch (e) { return 'system'; }
  }
  function applyTheme(mode) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');
    var btns = document.querySelectorAll('[data-theme-set]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-theme-set') === mode ? 'true' : 'false');
    }
  }
  function saveTheme(mode) {
    try {
      if (mode === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) { /* storage blocked: theme still applies for this page */ }
  }
  applyTheme(readTheme());
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-theme-set]') : null;
    if (!b) return;
    var mode = b.getAttribute('data-theme-set');
    saveTheme(mode);
    applyTheme(mode);
  });

  /* ---------- Mobile nav ---------- */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-toggle');
  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
  }

  /* ---------- Products dropdown ---------- */
  var ddBtn = document.querySelector('.dd-toggle');
  var ddPanel = ddBtn ? document.getElementById(ddBtn.getAttribute('aria-controls')) : null;
  function items() { return ddPanel ? ddPanel.querySelectorAll('a') : []; }
  function setDD(open, focusFirst) {
    if (!ddBtn || !ddPanel) return;
    ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) ddPanel.removeAttribute('hidden'); else ddPanel.setAttribute('hidden', '');
    if (open && focusFirst && items().length) items()[0].focus();
  }
  if (ddBtn && ddPanel) {
    ddBtn.addEventListener('click', function () {
      setDD(ddBtn.getAttribute('aria-expanded') !== 'true', false);
    });
    ddBtn.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setDD(true, true); }
    });
    ddPanel.addEventListener('keydown', function (ev) {
      var list = Array.prototype.slice.call(items());
      var i = list.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') { ev.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (i <= 0) ddBtn.focus(); else list[i - 1].focus(); }
    });
    var wrap = ddBtn.parentNode;
    wrap.addEventListener('focusout', function (ev) {
      if (ev.relatedTarget && !wrap.contains(ev.relatedTarget)) setDD(false);
    });
    document.addEventListener('click', function (ev) {
      if (!wrap.contains(ev.target)) setDD(false);
    });
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (ddBtn && ddBtn.getAttribute('aria-expanded') === 'true') { setDD(false); ddBtn.focus(); return; }
    if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Product sub-nav: keep the current link visible on small screens ---------- */
  var curSub = document.querySelector('.subnav-links [aria-current="page"]');
  if (curSub) {
    var bar = curSub.parentNode;
    var right = curSub.offsetLeft - bar.offsetLeft + curSub.offsetWidth;
    if (right > bar.clientWidth - 28) bar.scrollLeft = right - bar.clientWidth + 36;
    var mark = function () { bar.classList.toggle('is-scrolled', bar.scrollLeft > 4); };
    bar.addEventListener('scroll', mark, { passive: true });
    mark();
  }

  /* ---------- Docs: highlight current TOC entry ---------- */
  var toc = document.querySelector('.docs-layout .toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = toc.querySelectorAll('a[href^="#"]');
    var map = {};
    for (var j = 0; j < links.length; j++) map[links[j].getAttribute('href').slice(1)] = links[j];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          for (var k = 0; k < links.length; k++) links[k].classList.remove('active');
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
