/* ==========================================================================
   Site customisations — vanilla JS, no dependencies.
   1. Light/dark theme toggle. Light is the default; dark is opt-in and is
      remembered in localStorage.
   2. Publications: live search + year filter over the server-rendered list.
   Both are progressive enhancement: with JS disabled the pages still render
   correctly (in light theme, with the full publication list visible).
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. Theme toggle
   * ------------------------------------------------------------------ */

  var THEME_COLORS = { light: '#ffffff', dark: '#0e1116' };
  var root = document.documentElement;

  /* Light unless the visitor explicitly switched to dark. The OS
     prefers-color-scheme setting is intentionally not consulted. */
  function activeTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
    }
  }

  function describe(button) {
    var next = activeTheme() === 'dark' ? 'light' : 'dark';
    var label = 'Switch to ' + next + ' theme';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  function initThemeToggle() {
    var button = document.getElementById('theme-toggle');
    if (!button) { return; }

    describe(button);

    button.addEventListener('click', function () {
      var next = activeTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        window.localStorage.setItem('theme', next);
      } catch (e) { /* storage disabled — the choice just won't persist */ }
      describe(button);
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Publications search + year filter
   * ------------------------------------------------------------------ */

  function initPublications() {
    var list = document.querySelector('.pub-list');
    if (!list) { return; }

    var sections = list.querySelectorAll('.pub-year');
    var items = list.querySelectorAll('.pub-item');
    if (!sections.length) { return; }

    var activeYear = 'all';
    var chips = [];

    var toolbar = document.createElement('div');
    toolbar.className = 'pub-toolbar';

    var search = document.createElement('input');
    search.className = 'pub-search';
    search.type = 'search';
    search.setAttribute('placeholder', 'Search by title, co-author or venue…');
    search.setAttribute('aria-label', 'Search publications');

    var count = document.createElement('span');
    count.className = 'pub-count';
    count.setAttribute('role', 'status');

    var years = document.createElement('div');
    years.className = 'pub-years';

    var empty = document.createElement('p');
    empty.className = 'pub-empty';
    empty.textContent = 'No publications match that search.';
    empty.hidden = true;

    function apply() {
      var query = search.value.trim().toLowerCase();
      var visible = 0;
      var i, j, section, entries, shown, match;

      for (i = 0; i < sections.length; i++) {
        section = sections[i];
        entries = section.querySelectorAll('.pub-item');
        shown = 0;

        for (j = 0; j < entries.length; j++) {
          match = (activeYear === 'all' || activeYear === section.getAttribute('data-year')) &&
                  (!query || (entries[j].textContent || '').toLowerCase().indexOf(query) > -1);
          entries[j].hidden = !match;
          if (match) { shown++; }
        }

        section.hidden = shown === 0;
        visible += shown;
      }

      count.textContent = visible + (visible === 1 ? ' entry' : ' entries');
      empty.hidden = visible !== 0;
    }

    function makeChip(value, text) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pub-year-chip';
      chip.textContent = text;
      chip.setAttribute('aria-pressed', value === 'all' ? 'true' : 'false');
      chip.addEventListener('click', function () {
        activeYear = value;
        for (var k = 0; k < chips.length; k++) {
          chips[k].setAttribute('aria-pressed', chips[k] === chip ? 'true' : 'false');
        }
        apply();
      });
      chips.push(chip);
      years.appendChild(chip);
    }

    makeChip('all', 'All');
    for (var i = 0; i < sections.length; i++) {
      makeChip(sections[i].getAttribute('data-year'), sections[i].getAttribute('data-year'));
    }

    search.addEventListener('input', apply);

    toolbar.appendChild(search);
    toolbar.appendChild(count);
    toolbar.appendChild(years);

    list.parentNode.insertBefore(toolbar, list);
    list.appendChild(empty);

    count.textContent = items.length + ' entries';
  }

  /* ------------------------------------------------------------------ */

  function init() {
    initThemeToggle();
    initPublications();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
