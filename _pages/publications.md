---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
classes:
  - page--publications
---

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
{%- assign paper_url = "" -%}
{%- assign doi_link = pub.links | where: "label", "DOI" | first -%}
{%- assign openreview_link = pub.links | where: "label", "OpenReview" | first -%}
{%- assign pdf_link = pub.links | where: "label", "PDF" | first -%}
{%- assign fallback_link = pub.links | first -%}
{%- if doi_link -%}{%- assign paper_url = doi_link.url -%}
{%- elsif openreview_link -%}{%- assign paper_url = openreview_link.url -%}
{%- elsif pub.url -%}{%- assign paper_url = pub.url -%}
{%- elsif pdf_link -%}{%- assign paper_url = pdf_link.url -%}
{%- elsif fallback_link -%}{%- assign paper_url = fallback_link.url -%}
{%- endif -%}
<p class="pub-item__links"><span class="badge badge--type">{{ pub.type | capitalize }}</span>{% if paper_url != "" %}<a class="badge badge--action" href="{{ paper_url }}">Paper</a>{% endif %}{% if pub.award %}{% if pub.award_url %}<a class="badge badge--award" href="{{ pub.award_url }}">&#9733; {{ pub.award }}</a>{% else %}<span class="badge badge--award">&#9733; {{ pub.award }}</span>{% endif %}{% endif %}</p>
</article>
{%- endfor %}
</section>
{%- endfor %}
</div>
