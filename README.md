# Radture website

The redesigned marketing site for Radture (myradture.com). It's a static site with a tiny, dependency-free build step. The output in `dist/` can be hosted anywhere that serves HTML: Netlify, Vercel, Cloudflare Pages, S3 or cPanel.

## Run it

```bash
npm run build     # writes the site to dist/
npm run preview   # builds, then serves dist/ at http://localhost:4173
```

Node 18+ is the only requirement. You can also open `dist/index.html` directly in a browser.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `radture-core.html` | Radture Core (hospitals & imaging centers) |
| `radture-solo.html` | Radture Solo (independent specialists, waitlist) |
| `radture-link.html` | RadtureLink (patients & referring clinicians) |
| `security.html` | Security & compliance (`#standards` is the Compliance link) |
| `about.html` | About |
| `blog.html` | Blog (live Medium feed, with the three current articles as a fallback) |
| `contact.html` | Contact |
| `request-demo.html` | Demo request form |

**Keep old links working.** The previous site used extensionless URLs such as `/radture-core` and `/request-demo`. Turn on "clean URLs" / "pretty URLs" on your host, or add redirects from each old path to its `.html` file.

## Editing

```
src/
  pages/       one file per page; the comment at the top sets title, description and active nav item
  partials/    layout, header, footer, logo mark, arrow icon, the shared "Impression" call to action
  assets/
    css/site.css   the whole design system (tokens at the top)
    js/site.js     header, mobile menu, forms, blog feed
    img/           photos (1200 and 2400 px), scans, blog thumbnails, share image, favicons
build.mjs      assembles pages + partials into dist/
```

Inside a page or partial, `{{> name}}` includes a partial and `{{title}}` prints a page value. Don't edit `dist/` by hand, because the next build overwrites it.

## Design system

- **Grounds:** Film `#081721` / `#050D13` (the blue-black base of radiographic film) and Lightbox `#ECF2F2` (the cool light a film is read against).
- **Accent:** Signal `#3CCBBB` on dark and `#067268` on light, taken from the Radture mark. Amber and coral appear only as worklist states (STAT, in review).
- **Type:** Archivo (expanded) for headings, IBM Plex Sans for body text, IBM Plex Mono for clinical data and labels. All three load from Google Fonts.
- **Structure:** home-page sections follow the headings of a radiology report: Indication, Technique, Findings, Impression.
- Product visuals (the reading console, worklist, admin dashboard, phone and integration map) are built in HTML/SVG. They stay sharp at any size, and their data is marked as sample data.

## Forms

The settings are at the top of `src/assets/js/site.js`.

- **Request a demo** POSTs JSON to `https://staging.backend.myradture.com/request-demo`. This is the same endpoint and the same field names (`fullName`, `facility`, `jobTitle`, `email`, `country`, `state`, `facilityType`, `demoDate`, `demoTime`) as the previous site.
- **Solo waitlist** and **Contact** have no API yet. They open the visitor's email app, addressed to info@radture.com with the details filled in. To post them to an API instead, set `ENDPOINTS.waitlist` / `ENDPOINTS.contact`.

## Content to confirm before launch

- **Privacy policy:** the old footer linked to `/privacy-policy`, which returned a 404. The new footer leaves the link out until a real policy exists.
- **Phone number:** the old contact page showed +234 901 234 5678, which looks like a placeholder. The site now uses +234 905 291 6101 everywhere, as the old footer did.
- **Address:** the old footer had an "Address" label with no address. It has been removed.
- **Social links:** only LinkedIn had a real URL. The Facebook, X and Instagram icons weren't linked, so they were dropped.
- **About page claims:** "reduces dictation time by up to 50%", "over 60 minutes per shift" and "AI-assisted reporting" come from the old About page. No other page mentions AI, so confirm these are current.
- **RadtureLink:** "24/7 helpdesk" and "live chat support" are carried over from the old page. The old copy called the app "HIPAA-compliant"; the new copy says "secure" to match the home page's "aligned with" wording.
- **NDPR:** Nigeria's Data Protection Act (2023) now sits above the NDPR. Consider listing NDPA alongside it.
- **API host:** the demo form posts to a host named `staging`. Confirm that's the production API.

## Image credits

All images are free for commercial use.

- Photos from [Unsplash](https://unsplash.com/license), no attribution required: Accuray (team review, specialist reading, scanner suite, case discussion, co-reading, consult) and National Cancer Institute (clinician with phone).
- Radiographs and CT images from Wikimedia Commons by Mikael Häggström, M.D., released under **CC0** (public domain): normal PA and lateral chest radiographs, and normal CT brain and abdomen series.
- Blog thumbnails are the cover images of Ultradeck Labs' own Medium articles.
