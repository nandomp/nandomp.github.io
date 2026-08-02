---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
classes:
  - page--publications
---

Also on [Google Scholar](https://scholar.google.es/citations?user=a5qlaGIAAAAJ&hl=en) and [ORCID](http://orcid.org/0000-0003-2902-6477).
{: .lead}

{% comment %}
  Entries live in _data/publications.yml — edit that file, not this one.
  Every entry renders with the same structure:
    Authors. “Title”. Venue, details, Year.  [type] [Paper]
  The single "Paper" pill uses `url`, which is the DOI whenever one exists.
  The richer `links:` lists are kept in the data file but are not rendered.
{% endcomment %}
{% assign me = site.author.name %}
{% capture me_bold %}<b class="pub-me">{{ me }}</b>{% endcapture %}

<div class="pub-list">
{%- for group in site.data.publications %}
<section class="pub-year" data-year="{{ group.year }}">
<h2 class="pub-year__label">{{ group.year }}</h2>
{%- for pub in group.entries %}
<article class="pub-item" data-type="{{ pub.type }}">
<p class="pub-item__authors">{{ pub.authors | replace: me, me_bold }}</p>
<h3 class="pub-item__title">{% if pub.url %}<a href="{{ pub.url }}">&ldquo;{{ pub.title }}&rdquo;</a>{% else %}&ldquo;{{ pub.title }}&rdquo;{% endif %}</h3>
<p class="pub-item__meta"><a class="pub-item__venue" href="{{ pub.venue_url }}"><em>{{ pub.venue }}</em></a>{% if pub.details %}, {{ pub.details }}{% endif %}, {{ group.year }}.</p>
<p class="pub-item__links"><span class="badge badge--type">{{ pub.type | capitalize }}</span>{% if pub.award %}{% if pub.award_url %}<a class="badge badge--award" href="{{ pub.award_url }}">{{ pub.award }}</a>{% else %}<span class="badge badge--award">{{ pub.award }}</span>{% endif %}{% endif %}{% if pub.url %}<a class="badge badge--action" href="{{ pub.url }}">Paper</a>{% endif %}</p>
</article>
{%- endfor %}
</section>
{%- endfor %}
</div>
