/* Radture site behaviour: header state, mobile menu, forms and the blog feed. */
(() => {
  "use strict";

  // Demo requests post to the same API the previous site used. The waitlist
  // and contact forms have no API yet, so they open the visitor's email app
  // with the message filled in. Set an endpoint here to switch a form to POST.
  const API_BASE = "https://staging.backend.myradture.com";
  const ENDPOINTS = {
    demo: `${API_BASE}/request-demo`,
    waitlist: null,
    contact: null,
  };
  const CONTACT_EMAIL = "info@radture.com";
  const MEDIUM_FEED =
    "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://medium.com/feed/@ultradecklabs");

  /* ---------- Header ---------- */

  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");

  const setScrolled = () => header?.toggleAttribute("data-scrolled", window.scrollY > 8);
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  const setMenu = (open) => {
    if (!header || !toggle) return;
    toggle.setAttribute("aria-expanded", String(open));
    header.toggleAttribute("data-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  document.querySelectorAll("#site-nav a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.matchMedia("(min-width: 1101px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  /* ---------- Country selects ---------- */

  const PINNED = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"];
  const COUNTRIES = (
    "Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|" +
    "Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|" +
    "Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|" +
    "Chile|China|Colombia|Comoros|Congo|Costa Rica|Côte d’Ivoire|Croatia|Cuba|Cyprus|Czechia|" +
    "Democratic Republic of the Congo|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|" +
    "Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|" +
    "Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hong Kong|Hungary|Iceland|India|Indonesia|" +
    "Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|" +
    "Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|" +
    "Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|" +
    "Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|" +
    "North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|" +
    "Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|" +
    "San Marino|São Tomé and Príncipe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|" +
    "Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|" +
    "Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|" +
    "Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|" +
    "Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe"
  ).split("|");

  document.querySelectorAll("select[data-countries]").forEach((select) => {
    const group = (label, names) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = label;
      names.forEach((name) => optgroup.append(new Option(name, name)));
      return optgroup;
    };
    select.append(new Option("Select country", ""), group("Common", PINNED), group("All countries", COUNTRIES));
  });

  /* ---------- Forms ---------- */

  const LABELS = {
    fullName: "Name",
    email: "Email",
    phone: "Phone",
    specialty: "Specialty",
    country: "Country",
    organization: "Organization",
    topic: "Topic",
    message: "Message",
  };

  document.querySelectorAll("form[data-form]").forEach((form) => {
    const kind = form.dataset.form;
    const status = form.querySelector("[data-status]");
    const success = form.parentElement.querySelector("[data-success]");
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.hidden = true;
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const buttonLabel = button.innerHTML;
      button.disabled = true;
      button.textContent = "Sending…";

      try {
        const endpoint = ENDPOINTS[kind];
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        } else {
          const subject = kind === "waitlist" ? "Radture Solo waitlist" : `Website enquiry: ${data.topic || "General"}`;
          const body = Object.entries(data)
            .filter(([, value]) => value)
            .map(([key, value]) => `${LABELS[key] || key}: ${value}`)
            .join("\n");
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus();
        }
      } catch (error) {
        status.textContent = `We couldn’t send your request. Check your connection and try again, or email ${CONTACT_EMAIL}.`;
        status.hidden = false;
      } finally {
        button.disabled = false;
        button.innerHTML = buttonLabel;
      }
    });
  });

  /* ---------- Blog feed ---------- */

  const feed = document.querySelector("[data-medium-feed]");
  if (feed) {
    const escape = (value) =>
      String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const arrow = feed.querySelector(".i-arrow")?.outerHTML ?? "";

    fetch(MEDIUM_FEED)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((result) => {
        if (result.status !== "ok" || !result.items?.length) return;
        feed.innerHTML = result.items
          .map((item) => {
            const doc = new DOMParser().parseFromString(item.description || "", "text/html");
            const image = item.thumbnail || doc.querySelector("img")?.getAttribute("src") || "";
            const excerpt = (doc.body.textContent || "").replace(/\s+/g, " ").trim().slice(0, 220);
            const date = new Date(`${item.pubDate.replace(" ", "T")}Z`).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return `<a class="post" href="${escape(item.link.split("?")[0])}" target="_blank" rel="noopener">
  <div class="post__media">${image ? `<img src="${escape(image)}" alt="" loading="lazy">` : ""}</div>
  <div class="post__body">
    <p class="post__meta">${escape(item.author)} · ${date}</p>
    <h3 class="h3">${escape(item.title)}</h3>
    <p class="post__excerpt">${escape(excerpt)}</p>
    <span class="post__more">Continue on Medium ${arrow}</span>
  </div>
</a>`;
          })
          .join("");
      })
      .catch(() => {
        // Keep the articles already in the page.
      });
  }
})();
