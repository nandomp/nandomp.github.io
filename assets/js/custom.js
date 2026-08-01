/* ==========================================================================
   Site customisations — vanilla JS, no dependencies.
   1. Light/dark theme toggle (persisted in localStorage)
   2. Publications: year grouping, link badges, live search + year filter
   Everything here is progressive enhancement: with JS disabled the pages
   still render correctly, just without the toolbar and badges.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. Theme toggle
   * ------------------------------------------------------------------ */

  var root = document.documentElement;

  function prefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function activeTheme() {
    var attr = root.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') { return attr; }
    return prefersDark() ? 'dark' : 'light';
  }

  function describe(button) {
    if (!button) { return; }
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
      root.setAttribute('data-theme', next);
      try {
        window.localStorage.setItem('theme', next);
      } catch (e) { /* storage disabled — the choice just won't persist */ }
      describe(button);
    });

    /* Follow the OS while the visitor has not made an explicit choice. */
    if (window.matchMedia) {
      var query = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () {
        if (!root.getAttribute('data-theme')) { describe(button); }
      };
      if (query.addEventListener) {
        query.addEventListener('change', onChange);
      } else if (query.addListener) {
        query.addListener(onChange);
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. Publications
   * ------------------------------------------------------------------ */

  /* Classify a link by its href/anchor text. Returns null for links we do
     not want to surface as badges (conference and journal home pages), so
     the badge row stays a short, useful set of resources. */
  function badgeLabel(href, text) {
    var h = (href || '').toLowerCase();
    var t = (text || '').trim().toLowerCase();

    if (!h || h.charAt(0) === '#') { return null; }

    if (t === 'bibtex' || t === 'bibtext' || h.indexOf('.bib') > -1) { return 'BibTeX'; }
    if (t === 'slides' || t === 'presentation' || h.indexOf('pres.pdf') > -1 || h.indexOf('slides') > -1) { return 'Slides'; }
    if (t === 'poster' || h.indexOf('poster') > -1) { return 'Poster'; }
    if (h.indexOf('doi.org') > -1 || h.indexOf('dx.doi') > -1 || h.indexOf('/doi/') > -1 || h.indexOf('data.europa.eu/doi') > -1) { return 'DOI'; }
    if (h.indexOf('arxiv.org') > -1) { return 'arXiv'; }
    if (h.indexOf('openreview.net') > -1) { return 'OpenReview'; }
    if (h.indexOf('github.com') > -1 || h.indexOf('gitlab.com') > -1) { return 'Code'; }
    if (h.indexOf('.pdf') > -1) { return 'PDF'; }
    return null;
  }

  /* Older entries end with a hand-written "[BibTex | Slides]" group. Once it
     is represented by badges, drop the bracketed tail so it is not shown twice.
     Only removes a tail made exclusively of links, pipes and whitespace. */
  function stripTrailingLinkGroup(item) {
    var html = item.innerHTML;
    var pattern = /\[\s*(?:<a\b[^>]*>[\s\S]*?<\/a>\s*(?:\|\s*)?)+\]\s*$/;
    if (pattern.test(html.replace(/\s+$/, ''))) {
      item.innerHTML = html.replace(/\s+$/, '').replace(pattern, '');
    }
  }

  function addBadges(item) {
    var links = item.querySelectorAll('a[href]');
    var seen = {};
    var badges = [];
    var i, link, label, href, key;

    for (i = 0; i < links.length; i++) {
      link = links[i];
      href = link.getAttribute('href');
      label = badgeLabel(href, link.textContent);
      if (!label) { continue; }
      key = label + '|' + href;
      if (seen[key]) { continue; }
      seen[key] = true;
      badges.push({ label: label, href: href });
    }

    if (!badges.length) { return; }

    stripTrailingLinkGroup(item);

    var row = document.createElement('span');
    row.className = 'pub-item__links';

    for (i = 0; i < badges.length; i++) {
      var a = document.createElement('a');
      a.className = 'badge';
      a.setAttribute('href', badges[i].href);
      a.textContent = badges[i].label;
      if (badges[i].href.indexOf('http') === 0) {
        a.setAttribute('rel', 'noopener');
      }
      row.appendChild(a);
    }

    item.appendChild(row);
  }

  /* Wrap each "<h2>year</h2> + following content" run in a section so it can
     be filtered and so the year heading can stick while scrolling. */
  function groupByYear(container) {
    var nodes = Array.prototype.slice.call(container.children);
    var sections = [];
    var current = null;

    nodes.forEach(function (node) {
      if (node.tagName === 'H2') {
        current = document.createElement('section');
        current.className = 'pub-year';
        current.setAttribute('data-year', (node.textContent || '').trim());
        container.insertBefore(current, node);
        current.appendChild(node);
        sections.push(current);
      } else if (current && node.tagName !== 'H1') {
        current.appendChild(node);
      }
    });

    return sections;
  }

  function buildToolbar(sections, items, container) {
    var toolbar = document.createElement('div');
    toolbar.className = 'pub-toolbar';

    var search = document.createElement('input');
    search.className = 'pub-search';
    search.type = 'search';
    search.setAttribute('placeholder', 'Search by title, co-author, venue…');
    search.setAttribute('aria-label', 'Search publications');

    var count = document.createElement('span');
    count.className = 'pub-count';

    var years = document.createElement('div');
    years.className = 'pub-years';

    var chips = [];
    var activeYear = 'all';

    function makeChip(value, text) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pub-year-chip';
      chip.textContent = text;
      chip.setAttribute('data-year', value);
      chip.setAttribute('aria-pressed', value === 'all' ? 'true' : 'false');
      chip.addEventListener('click', function () {
        activeYear = value;
        chips.forEach(function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        apply();
      });
      chips.push(chip);
      years.appendChild(chip);
      return chip;
    }

    var empty = document.createElement('p');
    empty.className = 'pub-empty';
    empty.textContent = 'No publications match that search.';
    empty.hidden = true;

    function apply() {
      var query = search.value.trim().toLowerCase();
      var visible = 0;

      sections.forEach(function (section) {
        var year = section.getAttribute('data-year');
        var yearOk = activeYear === 'all' || activeYear === year;
        var shown = 0;

        var list = section.querySelectorAll('li');
        for (var i = 0; i < list.length; i++) {
          var match = yearOk && (!query || (list[i].textContent || '').toLowerCase().indexOf(query) > -1);
          list[i].hidden = !match;
          if (match) { shown++; }
        }

        section.hidden = shown === 0;
        visible += shown;
      });

      count.textContent = visible + (visible === 1 ? ' entry' : ' entries');
      empty.hidden = visible !== 0;
    }

    search.addEventListener('input', apply);

    makeChip('all', 'All');
    sections.forEach(function (section) {
      makeChip(section.getAttribute('data-year'), section.getAttribute('data-year'));
    });

    toolbar.appendChild(search);
    toolbar.appendChild(count);
    toolbar.appendChild(years);

    container.insertBefore(toolbar, sections[0]);
    container.appendChild(empty);

    count.textContent = items.length + ' entries';
  }

  function initPublications() {
    if (!document.body || document.body.className.indexOf('page--publications') === -1) { return; }

    var container = document.querySelector('.archive');
    if (!container) { return; }

    var sections = groupByYear(container);
    if (!sections.length) { return; }

    var items = container.querySelectorAll('.pub-year li');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.add('pub-item');
      addBadges(items[i]);
    }

    buildToolbar(sections, items, container);
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
