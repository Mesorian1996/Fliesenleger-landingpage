# SEO Audit — Limani Fliesenleger Mannheim
**Datum:** 16. Mai 2026  
**Website:** https://www.limani-fliesenleger.de  
**Typ:** Lokales Handwerksunternehmen (Fliesenleger, Badsanierung, Bodenarbeiten, Mannheim)  
**Technologie:** Astro (Static Build) + Cloudflare Pages

---

## 1. Executive Summary

### SEO Health Score

| Kategorie | Score | Status |
|---|---|---|
| Technical SEO | 68/100 | Verbesserungsbedarf |
| Content Quality | 58/100 | Kritisch |
| On-Page SEO | 72/100 | Verbesserungsbedarf |
| Schema & Structured Data | 68/100 | Verbesserungsbedarf |
| Performance | 78/100 | Gut |
| Images | 62/100 | Verbesserungsbedarf |
| AI Search Readiness | 32/100 | Kritisch |

### **Gesamt-Score: 65 / 100**

Die Website hat eine solide technische Basis (Astro Static Build, Cloudflare CDN, HTTPS, gute Titel und Meta-Descriptions), leidet aber unter mehreren kritischen Problemen, die aktiv Rankings kosten: 5 simultane H1-Tags auf der Homepage, ein kanonischer URL-Konflikt auf allen Unterseiten, dünner Content auf Service-Seiten und vollständige Blockierung aller KI-Crawler.

---

### Top 5 Kritische Probleme

1. **5× `<h1>` gleichzeitig im DOM (Homepage)** — Hero-Slider rendert alle Slides auf einmal. Google sieht 5 konkurrierende H1s für die wichtigste Seite der Domain.
2. **Canonical-Konflikt auf allen Unterseiten** — Canonical-Tag zeigt auf `/fliesenarbeiten-mannheim` (ohne Slash), Cloudflare leitet diese URL aber per 308 auf `/fliesenarbeiten-mannheim/` (mit Slash) weiter. Der Canonical verweist auf eine Redirect-Quelle.
3. **Non-www gibt HTTP 200 zurück** — `limani-fliesenleger.de` und `www.limani-fliesenleger.de` sind beide erreichbar und haben identischen Content. Duplicate-Content-Risiko.
4. **Thin Content auf allen 7 Service-Seiten** — Nur 500–870 Wörter pro Seite. Für lokal+service-keyword-Rankings zu wenig Tiefe.
5. **Alle KI-Crawler vollständig blockiert** — GPTBot, ClaudeBot, Google-Extended, Bytespider geblockt. Die Website erscheint nicht in ChatGPT, AI Overviews oder ähnlichen Antwort-Formaten.

---

### Top 5 Quick Wins

1. **Canonical-Tags korrigieren** — Trailing Slash in alle canonical-Attribute eintragen. Betrifft alle 7 Service-Seiten. Direkt im Astro-Code umsetzbar. Aufwand: Klein.
2. **Non-www Redirect einrichten** — In Cloudflare Page Rules `limani-fliesenleger.de/*` → 301 → `https://www.limani-fliesenleger.de/$1`. Aufwand: Klein.
3. **H1-Problem im Hero-Slider lösen** — Nur die aktive Slide soll `<h1>` tragen; inaktive Slides `aria-hidden` setzen oder auf `<p>`/`<span>` umstellen. Direkt im Astro-Code. Aufwand: Klein.
4. **Nicht-WebP-Bilder konvertieren** — 8 JPEG/JPG-Bilder (Malerarbeiten_bunt.jpeg, Parkett_1.jpeg, Verputzen2.jpg, Fliesen_bad_10.jpeg u.a.) zu WebP konvertieren. Aufwand: Klein.
5. **BreadcrumbList-Schema auf alle Service-Seiten ausweiten** — Aktuell nur auf `/kontakt-mannheim/` vorhanden. Für alle 8 weiteren Sitemap-URLs ergänzen. Aufwand: Klein.

---

## 2. Technical SEO

### 2.1 Duplicate Content — Non-www ohne Redirect

| Punkt | Befund |
|---|---|
| `https://www.limani-fliesenleger.de/` | HTTP 200 ✅ |
| `https://limani-fliesenleger.de/` | HTTP 200 ⚠️ (kein Redirect!) |

**Problem:** Beide Varianten liefern identischen Content und sind für Suchmaschinen zwei separate URLs. Google muss selbst entscheiden, welche Version kanonisch ist — das verdünnt Linkpower und Crawl-Budget.

**Lösung:** Cloudflare Redirect Rule: `limani-fliesenleger.de/*` → 301 → `https://www.limani-fliesenleger.de/$1`

---

### 2.2 Canonical-Tag Konflikt (alle Unterseiten)

**Befund:** Cloudflare liefert alle URLs mit Trailing Slash aus und macht einen 308-Redirect von `/fliesenarbeiten-mannheim` → `/fliesenarbeiten-mannheim/`. Der im HTML eingetragene Canonical zeigt aber auf die Version **ohne** Slash — also auf die Redirect-Quelle.

```
Canonical im HTML:  /fliesenarbeiten-mannheim    ← Redirect-Quelle (308)
Ausgelieferte URL:  /fliesenarbeiten-mannheim/   ← Ziel-URL (200)
```

**Betroffene Seiten (alle Unterseiten):**
- `/fliesenarbeiten-mannheim/`
- `/badsanierung-mannheim/`
- `/bodenarbeiten-mannheim/`
- `/malerarbeiten-mannheim/`
- `/trockenbauarbeiten-mannheim/`
- `/wohnungssanierung-mannheim/`
- `/abbrucharbeiten-mannheim/`
- `/kontakt-mannheim/`

**Lösung:** In der Astro-Konfiguration und/oder dem `<head>`-Template den Canonical-Tag mit Trailing Slash generieren: `<link rel="canonical" href="https://www.limani-fliesenleger.de/fliesenarbeiten-mannheim/" />`

---

### 2.3 robots.txt

```
User-agent: *
Allow: /
Disallow: /datenschutz
Disallow: /impressum
```

- Datenschutz und Impressum korrekt ausgeschlossen ✅
- KI-Crawler-Blockierung separat behandelt (→ Abschnitt 8)
- Sitemap-Verweis in robots.txt vorhanden? Bitte prüfen — empfohlen: `Sitemap: https://www.limani-fliesenleger.de/sitemap-index.xml`

---

### 2.4 Sitemap

| Punkt | Befund |
|---|---|
| Sitemap vorhanden | ✅ `/sitemap-index.xml` → `/sitemap-0.xml` |
| Anzahl URLs | 9 (alle Hauptseiten) ✅ |
| Trailing Slashes in Sitemap | ✅ konsistent |
| `lastmod` | ❌ fehlt |
| `changefreq` | ❌ fehlt |
| `priority` | ❌ fehlt |
| Impressum/Datenschutz ausgeschlossen | ✅ |

**Empfehlung:** `lastmod` mit dem tatsächlichen Änderungsdatum befüllen. `changefreq` und `priority` haben für Google geringen praktischen Wert, schaden aber nicht.

---

### 2.5 Security Headers

| Header | Status |
|---|---|
| HTTPS | ✅ |
| `x-content-type-options` | ✅ |
| Cloudflare CDN | ✅ |
| `Cache-Control: max-age=0` | ⚠️ Statische Assets ohne Long-Term-Caching |

**Cache-Empfehlung:** Statische Assets (Bilder, Fonts, CSS, JS) sollten `Cache-Control: public, max-age=31536000, immutable` erhalten. Bei Astro-Builds mit Content-Hash im Dateinamen ist das sicher. In `_headers` oder Cloudflare Page Rules konfigurierbar.

---

## 3. Content Quality

### 3.1 Wortzählung je Seite

| Seite | Wörter | Bewertung |
|---|---|---|
| Homepage (`/`) | ~2890 | ✅ Gut |
| `/fliesenarbeiten-mannheim/` | 500–870 | ⚠️ Dünn |
| `/badsanierung-mannheim/` | 500–870 | ⚠️ Dünn |
| `/bodenarbeiten-mannheim/` | 500–870 | ⚠️ Dünn |
| `/malerarbeiten-mannheim/` | 500–870 | ⚠️ Dünn |
| `/trockenbauarbeiten-mannheim/` | 500–870 | ⚠️ Dünn |
| `/wohnungssanierung-mannheim/` | 500–870 | ⚠️ Dünn |
| `/abbrucharbeiten-mannheim/` | 500–870 | ⚠️ Dünn |

**Problem:** Für wettbewerbsstarke lokale Service-Keywords (z.B. "Badsanierung Mannheim", "Fliesenleger Mannheim") ranken Seiten mit 600 Wörtern gegen Seiten mit 1200–2000 Wörtern. Die Unterseiten sind aktuell nicht tief genug, um Topical Authority aufzubauen.

**Empfehlungen je Seite (Beispiele):**
- `/badsanierung-mannheim/`: Ablauf einer typischen Badsanierung (Schritt-für-Schritt), Materialoptionen (Fliesen, Wannen, Armaturen), Preisrahmen, FAQ (3–5 Fragen), Referenzprojekte
- `/fliesenarbeiten-mannheim/`: Fliesenarten (Feinsteinzeug, Naturstein, Mosaik), Verlegemuster, Untergrundvorbereitung, Preise pro m², FAQ
- `/bodenarbeiten-mannheim/`: Parkett vs. Laminat vs. Fliesen, Estrich, Untergrundausgleich, FAQ

**Ziel:** Mindestens 1000–1500 Wörter pro Service-Seite.

---

### 3.2 Interne Verlinkung

- Alle Service-Seiten von der Homepage verlinkt ✅
- Seiten untereinander verlinkt? Empfohlen: Cluster-Verlinkung (z.B. Badsanierung verlinkt auf Fliesenarbeiten und Abbrucharbeiten).

---

## 4. On-Page SEO

### 4.1 Titel-Tags

Alle Seiten haben gute, standortspezifische Titel mit Marke und Keyword. ✅

### 4.2 Meta-Descriptions

Alle Seiten haben spezifische, ansprechende Meta-Descriptions. ✅

### 4.3 H1-Tags — Kritisches Problem auf der Homepage

**Befund:** Der Hero-Slider der Homepage rendert **alle 5 Slides gleichzeitig im DOM**. Jede Slide hat einen eigenen `<h1>`-Tag. Google sieht 5 gleichwertige H1s auf der wichtigsten Seite.

```html
<!-- Problem: 5× im DOM gleichzeitig -->
<h1>Fliesenleger Mannheim</h1>       <!-- Slide 1 -->
<h1>Badsanierung Mannheim</h1>       <!-- Slide 2 -->
<h1>Bodenarbeiten Mannheim</h1>      <!-- Slide 3 -->
<h1>Malerarbeiten Mannheim</h1>      <!-- Slide 4 -->
<h1>Wohnungssanierung Mannheim</h1>  <!-- Slide 5 -->
```

**Lösung:** Nur die erste/aktive Slide erhält `<h1>`. Alle anderen Slides erhalten entweder:
- `<p class="slide-heading">` statt `<h1>`
- oder `aria-hidden="true"` auf dem inaktiven Slide-Container
- und `<h2>` oder `<p>` für den Text der inaktiven Slides

### 4.4 H1-Tags — Unterseiten

Alle Unterseiten haben genau einen H1-Tag mit Standort-Keyword. ✅

### 4.5 Heading-Hierarchie

Unterseiten: Prüfen ob H2/H3-Struktur klar und keyword-haltig ist. Empfohlen: H2-Überschriften für Hauptabschnitte mit Variationen der Ziel-Keywords.

---

## 5. Schema & Structured Data

### 5.1 Übersicht

| Schema-Typ | Homepage | Service-Seiten | Kontakt |
|---|---|---|---|
| `LocalBusiness` | ✅ | ✅ | — |
| `GeoCoordinates` | ✅ | — | — |
| `PostalAddress` | ✅ | — | — |
| `OpeningHoursSpecification` | ✅ | — | — |
| `AggregateRating` | ✅ | — | — |
| `FAQPage` | ✅ | — | — |
| `WebSite` | ✅ | — | — |
| `Service` | — | ✅ | — |
| `BreadcrumbList` | ❌ | ❌ | ✅ |
| `Review` (einzeln) | ❌ | ❌ | ❌ |

### 5.2 AggregateRating — Glaubwürdigkeitsproblem

**Befund:**
```json
"aggregateRating": {
  "ratingValue": 5,
  "reviewCount": 4
}
```

**Problem:** Das Unternehmen wirbt mit "30+ Jahre Erfahrung" und "900+ abgeschlossene Projekte", aber nur **4 Reviews** sind im Schema hinterlegt. Das ist ein starkes Missverhältnis und wirkt für Nutzer und Algorithmen unglaubwürdig. Google zeigt Sterne-Bewertungen in den SERPs nur bei einer ausreichenden Anzahl glaubwürdiger Reviews.

**Empfehlung:**
1. Aktiv Google-Rezensionen sammeln (Ziel: 15–30+ echte Bewertungen auf Google My Business)
2. `reviewCount` im Schema erst erhöhen, wenn echte Reviews vorhanden sind
3. Einzelne `Review`-Objekte mit `author`, `datePublished`, `reviewBody` ergänzen

### 5.3 BreadcrumbList fehlt auf Service-Seiten

**Befund:** BreadcrumbList-Schema nur auf `/kontakt-mannheim/` vorhanden. Fehlt auf allen 7 Service-Seiten und der Homepage.

**Empfehlung:** BreadcrumbList global im Astro-Layout für alle Seiten außer Homepage generieren:
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://www.limani-fliesenleger.de/"},
    {"@type": "ListItem", "position": 2, "name": "Fliesenarbeiten Mannheim", "item": "https://www.limani-fliesenleger.de/fliesenarbeiten-mannheim/"}
  ]
}
```

### 5.4 FAQPage Schema

FAQPage auf der Homepage vorhanden ✅ — erwägen, FAQs auch auf Service-Seiten einzubinden (FAQ je Service-Thema), da dies für AI Overviews und Featured Snippets relevant ist.

---

## 6. Performance

### 6.1 Stärken

| Punkt | Bewertung |
|---|---|
| Astro Static Build | ✅ Kein Server-Rendering-Overhead |
| Cloudflare CDN | ✅ Globales Edge-Netzwerk |
| HTTPS | ✅ |
| Lokale Fonts via `@fontsource` | ✅ Kein CDN-Roundtrip für Schriften |

### 6.2 Schwächen

| Punkt | Bewertung |
|---|---|
| `Cache-Control: max-age=0` | ⚠️ Statische Assets werden nicht gecacht |
| Non-WebP Bilder (8 Dateien) | ⚠️ Höheres Dateigewicht als nötig |
| Icons via jsDelivr CDN | ⚠️ Externe Abhängigkeit (Phosphor Icons) |

### 6.3 Cache-Empfehlung

In `/public/_headers` oder Cloudflare Cache Rules:
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable
```

---

## 7. Images

### 7.1 Nicht-WebP-Bilder

Die folgenden Bilder sind noch im JPEG/JPG-Format und sollten zu WebP konvertiert werden:

| Datei | Format | Empfehlung |
|---|---|---|
| `Malerarbeiten_bunt.jpeg` | JPEG | → WebP konvertieren |
| `Parkett_1.jpeg` | JPEG | → WebP konvertieren |
| `Verputzen2.jpg` | JPG | → WebP konvertieren |
| `Fliesen_bad_10.jpeg` | JPEG | → WebP konvertieren |
| `Wohnung_6.jpeg` | JPEG | → WebP konvertieren |
| `Wohnung.jpg` | JPG | → WebP konvertieren |
| `Wohnung_3.jpeg` | JPEG | → WebP konvertieren |
| `Fliesenarbeiten.jpg` | JPG | → WebP konvertieren |

**Tool-Empfehlung:** `cwebp` (CLI) oder `sharp` (Node.js, integrierbar in Build-Prozess). Typische Einsparung: 25–35% Dateigröße gegenüber JPEG bei gleicher Qualität.

**Astro-Alternative:** Astros eingebaute `<Image>`-Komponente aus `astro:assets` konvertiert automatisch zu WebP:
```astro
import { Image } from 'astro:assets';
import fliesenbild from '../assets/Fliesenarbeiten.jpg';

<Image src={fliesenbild} alt="Fliesenarbeiten Mannheim" format="webp" />
```

### 7.2 Alt-Texte

- 1 Bild ohne Alt-Text auf der Homepage (dekoratives Icon — akzeptabel mit `alt=""`) ✅
- Alle anderen Bilder haben beschreibende Alt-Texte ✅

**Empfehlung:** Alt-Texte bei Service-Bildern standortspezifisch formulieren, z.B. `alt="Badsanierung Mannheim — fertig gefliestes Badezimmer von Limani"` statt nur `alt="Badezimmer"`.

---

## 8. AI Search Readiness

### 8.1 Aktuelle Blockierungen

| KI-Crawler | User-Agent | Status |
|---|---|---|
| ChatGPT / OpenAI | GPTBot | ❌ Blockiert |
| Claude / Anthropic | ClaudeBot | ❌ Blockiert |
| Google AI Overviews | Google-Extended | ❌ Blockiert |
| Amazon Alexa | Amazonbot | ❌ Blockiert |
| TikTok / Bytedance | Bytespider | ❌ Blockiert |
| Apple | Applebot-Extended | ❌ Blockiert |
| CCBot | CCBot | ❌ Blockiert |
| Meta | meta-externalagent | ❌ Blockiert |

**Konsequenz:** Die Website erscheint nicht als Quelle in ChatGPT-Antworten, Google AI Overviews, oder anderen KI-gestützten Suchergebnissen. Für ein lokales Handwerksunternehmen, bei dem Nutzer zunehmend "Fliesenleger in Mannheim" direkt in KI-Assistenten suchen, ist das ein wachsender Wettbewerbsnachteil.

**Score: 32/100** — nur FAQPage- und LocalBusiness-Schema als positive Signale.

### 8.2 Empfehlungen

**Option A (Empfohlen): Selektiv freigeben**

Google-Extended freigeben, damit die Website in Google AI Overviews erscheinen kann. GPTBot freigeben für ChatGPT-Sichtbarkeit.

In `robots.txt` die entsprechenden `Disallow`-Regeln für diese Crawler entfernen.

**Option B: `llms.txt` anlegen**

Eine strukturierte `/llms.txt` Datei anlegen, die KI-Systemen die wichtigsten Informationen über das Unternehmen liefert:
```
# Limani Fliesenleger Mannheim

Limani ist ein Fliesenleger-Betrieb in Mannheim mit 30+ Jahren Erfahrung.
Leistungen: Fliesenarbeiten, Badsanierung, Bodenarbeiten, Malerarbeiten, Trockenbau, Wohnungssanierung, Abbrucharbeiten.
Einsatzgebiet: Mannheim und Umgebung (Heidelberg, Ludwigshafen, Rhein-Neckar-Region)

## Kontakt
Website: https://www.limani-fliesenleger.de
Seite: https://www.limani-fliesenleger.de/kontakt-mannheim/
```

**FAQPage Schema beibehalten:** Bereits vorhanden — gutes Signal für AI Overviews. Auf Service-Seiten ausweiten.

---

## 9. Action Plan

### Kritisch (sofort beheben)

| # | Problem | Seite(n) | Maßnahme | Aufwand | Typ |
|---|---|---|---|---|---|
| K1 | 5× H1 im DOM gleichzeitig | Homepage | Nur aktive Slide behält `<h1>`, andere auf `<p>` oder `aria-hidden` | Klein | Code |
| K2 | Canonical zeigt auf Redirect-Quelle | Alle Unterseiten (7×) | Trailing Slash in alle `<link rel="canonical">` eintragen | Klein | Code |
| K3 | Non-www ohne Redirect | Domain-Ebene | Cloudflare Redirect Rule: `limani-fliesenleger.de → www.` | Klein | DNS/Cloudflare |
| K4 | Alle KI-Crawler blockiert | robots.txt | Google-Extended + GPTBot freigeben | Klein | Config |

---

### Hoch (innerhalb 2–4 Wochen)

| # | Problem | Seite(n) | Maßnahme | Aufwand | Typ |
|---|---|---|---|---|---|
| H1 | Thin Content | 7 Service-Seiten | Je Seite 400–800 Wörter ergänzen (FAQ, Ablauf, Preise) | Groß | Content |
| H2 | BreadcrumbList fehlt | 7 Service-Seiten | Schema-Komponente in Astro-Layout ergänzen | Klein | Code |
| H3 | Non-WebP Bilder (8 Dateien) | Alle Seiten | Astro `<Image>`-Komponente nutzen oder cwebp-Konvertierung | Mittel | Code |
| H4 | AggregateRating reviewCount: 4 | Homepage | Google-Rezensionen aktiv sammeln, Kunden ansprechen | Groß | Marketing |

---

### Mittel (innerhalb 1–2 Monate)

| # | Problem | Seite(n) | Maßnahme | Aufwand | Typ |
|---|---|---|---|---|---|
| M1 | Keine `lastmod` in Sitemap | sitemap-0.xml | Astro Sitemap-Plugin mit `lastmod` konfigurieren | Klein | Code |
| M2 | Cache-Control max-age=0 | Alle statischen Assets | `_headers`-Datei mit `max-age=31536000` für Assets | Klein | Code |
| M3 | Kein `llms.txt` | Root | `/llms.txt` mit Unternehmensinfo erstellen | Klein | Code |
| M4 | FAQPage nur auf Homepage | Homepage | FAQs je Thema auf Service-Seiten ergänzen | Mittel | Code+Content |
| M5 | Alt-Texte nicht standortspezifisch | Service-Seiten | Alt-Texte mit Ort und Service anreichern | Klein | Code |
| M6 | Icons via jsDelivr CDN | Alle Seiten | Phosphor Icons lokal hosten oder inline SVG nutzen | Mittel | Code |

---

### Niedrig (bei Gelegenheit)

| # | Problem | Seite(n) | Maßnahme | Aufwand | Typ |
|---|---|---|---|---|---|
| N1 | Keine einzelnen `Review`-Objekte | Homepage | Review-Schema mit 3–5 echten Bewertungen ergänzen | Klein | Code |
| N2 | Interne Cross-Links zwischen Services | Service-Seiten | Badsanierung → Fliesenarbeiten → Abbrucharbeiten verlinken | Klein | Code |
| N3 | Sitemap-Verweis in robots.txt prüfen | robots.txt | `Sitemap:`-Direktive ergänzen falls fehlend | Klein | Code |
| N4 | Cluster-Content für Mannheim-Stadtteile | Neue Seiten | Landingpages für Käfertal, Neckarau, Sandhofen etc. | Groß | Content |

---

## 10. Sofort umsetzbar im Code (Astro-Codebase)

### Direkt im Astro-Code behebbar

- [ ] **H1 Hero-Slider:** In der Slider-Komponente (vermutlich `src/components/`) nur die erste Slide mit `<h1>` auszeichnen, alle weiteren mit `<p class="hero-text">` oder `role="presentation"` auf den inaktiven Containern.
- [ ] **Canonical Trailing Slash:** Im Layout-`<head>` (`src/layouts/`) den Canonical-Tag auf `Astro.url.pathname` mit gesichertem Trailing Slash setzen: `href={new URL(Astro.url.pathname.replace(/\/?$/, '/'), Astro.site).href}`
- [ ] **BreadcrumbList Schema:** Im Layout eine Astro-Komponente `BreadcrumbSchema.astro` erstellen, die für alle Nicht-Homepage-Seiten automatisch BreadcrumbList-JSON-LD generiert.
- [ ] **WebP-Konvertierung:** In `src/` alle `<img>`-Tags auf Astros `<Image>`-Komponente umstellen (`import { Image } from 'astro:assets'`). Bilder aus `public/` nach `src/assets/` verschieben.
- [ ] **lastmod in Sitemap:** In `astro.config.mjs` das Sitemap-Plugin konfigurieren: `serialize(item) { item.lastmod = new Date().toISOString(); return item; }`
- [ ] **_headers für Cache-Control:** `/public/_headers` erstellen mit Long-Term-Caching für `/assets/*`, `/*.webp`, `/*.woff2`.
- [ ] **llms.txt:** `/public/llms.txt` mit strukturierten Unternehmensdaten anlegen.
- [ ] **Alt-Texte:** In allen Bild-Komponenten standortspezifische Alt-Texte ergänzen.
- [ ] **FAQPage auf Service-Seiten:** Existierende FAQ-Komponente (falls vorhanden) auf Service-Seiten einbinden mit themenbezogenen Fragen.
- [ ] **robots.txt:** Google-Extended und GPTBot aus der Blocklist entfernen (Cloudflare-Konfiguration oder `public/robots.txt`).
- [ ] **Review Schema:** 3–5 echte Kundenrezensionen als `Review`-Objekte in das LocalBusiness-Schema auf der Homepage aufnehmen.
- [ ] **Sitemap-Direktive in robots.txt:** Prüfen ob `Sitemap: https://www.limani-fliesenleger.de/sitemap-index.xml` in robots.txt vorhanden ist.

### Benötigt manuelle / externe Aktion (nicht im Code)

- [ ] **Non-www Redirect:** Cloudflare Dashboard → Rules → Redirect Rules → `limani-fliesenleger.de/*` → 301 → `https://www.limani-fliesenleger.de/$1`
- [ ] **Google Reviews sammeln:** Kunden nach Projektabschluss aktiv nach Google-Bewertung fragen. Ziel: 15–30 Bewertungen, um `reviewCount: 4` auf einen glaubwürdigen Wert zu bringen.
- [ ] **Google My Business Profil pflegen:** Öffnungszeiten, Fotos, Leistungen, Servicegebiet aktuell halten.
- [ ] **Content-Erstellung:** Die 400–800 fehlenden Wörter je Service-Seite müssen inhaltlich erarbeitet werden (Texte schreiben oder beauftragen).

---

*Audit erstellt am 16. Mai 2026 | Basis: Crawl-Daten limani-fliesenleger.de*
