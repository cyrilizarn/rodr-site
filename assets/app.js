/* ROD-R — site statique. Le contenu vient de /content/*.json (édité via Pages CMS). */
(() => {
  const PAGE = document.body.dataset.page || "home";
  const params = new URLSearchParams(location.search);
  let LANG = params.get("lang") || safeGet("lang") || ((navigator.language || "fr").startsWith("fr") ? "fr" : "en");
  if (!["fr", "en"].includes(LANG)) LANG = "fr";
  document.documentElement.lang = LANG;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  const UI = {
    fr: {
      music: "Musique", live: "Live", bio: "Bio", gallery: "Galerie", news: "News", contact: "Contact", store: "Store",
      menu: "Menu", close: "Fermer", latest: "Dernière sortie", listen: "Écouter", upcoming: "Prochaines dates",
      allDates: "Toutes les dates", allMusic: "Toute la discographie", allNews: "Toutes les news", videos: "Vidéos",
      discography: "Discographie", info: "Info", tracklist: "Tracklist", noDates: "Nouvelles dates bientôt.",
      tickets: "Billets", past: "Dates passées", liveTitle: "Le live", epk: "Presskit / EPK", press: "Presse",
      stayTuned: "Reste dans la boucle.", nlText: "Sorties, dates, coulisses. Pas de spam.", email: "Ton e-mail",
      subscribe: "S'inscrire", nlSoon: "Newsletter bientôt — écris-nous", follow: "Suivre", links: "Liens",
      rights: "Tous droits réservés", booking: "Booking · Presse · Contact", readMore: "Lire", watch: "Voir",
      liveText: "45 minutes en sept actes, jouées sur machines analogiques et projetées sur tulle. Musique, typographie et visuels génératifs pensés comme un seul geste.",
      heroLabel: "Electronica · IDM · Live A/V", single: "Single"
    },
    en: {
      music: "Music", live: "Live", bio: "Bio", gallery: "Gallery", news: "News", contact: "Contact", store: "Store",
      menu: "Menu", close: "Close", latest: "Latest release", listen: "Listen", upcoming: "Upcoming shows",
      allDates: "All dates", allMusic: "Full discography", allNews: "All news", videos: "Videos",
      discography: "Discography", info: "Info", tracklist: "Tracklist", noDates: "New dates coming soon.",
      tickets: "Tickets", past: "Past shows", liveTitle: "The live show", epk: "Press kit / EPK", press: "Press",
      stayTuned: "Stay in the loop.", nlText: "Releases, shows, behind the scenes. No spam.", email: "Your email",
      subscribe: "Subscribe", nlSoon: "Newsletter coming soon — email us", follow: "Follow", links: "Links",
      rights: "All rights reserved", booking: "Booking · Press · Contact", readMore: "Read", watch: "Watch",
      liveText: "45 minutes in seven acts, played on analogue machines and projected onto tulle. Music, typography and generative visuals conceived as one gesture.",
      heroLabel: "Electronica · IDM · Live A/V", single: "Single"
    }
  };
  const t = k => UI[LANG][k] || k;
  const L = (o, k) => (o && (o[`${k}_${LANG}`] || o[`${k}_fr`] || o[k])) || "";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ext = u => /^https?:/.test(u || "") ? ' target="_blank" rel="noopener"' : "";
  const fmtDate = (iso, opts = { day: "2-digit", month: "2-digit", year: "numeric" }) => {
    const d = new Date(iso + "T12:00:00"); return isNaN(d) ? esc(iso) : d.toLocaleDateString(LANG === "fr" ? "fr-FR" : "en-GB", opts).replace(/\//g, ".");
  };
  const ytId = u => { const m = String(u || "").match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ""; };
  const paras = s => String(s || "").split(/\n\s*\n/).map(p => `<p>${esc(p.trim())}</p>`).join("");

  const cache = {};
  const load = name => cache[name] || (cache[name] = fetch(`/content/${name}.json`, { cache: "no-cache" }).then(r => r.json()).catch(() => ({})));

  /* ---------- Shell ---------- */
  function shell(site) {
    const store = site.bandcamp_url || site.linktree_url || "#";
    const items = [["music", "/musique/"], ["live", "/live/"], ["bio", "/bio/"], ["gallery", "/galerie/"], ["news", "/news/"], ["contact", "/contact/"]];
    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML = `<div class="wrap nav-in">
      <a class="logo" href="/">ROD<span>-</span>R</a>
      <button class="burger" aria-expanded="false">${t("menu")}</button>
      <nav class="menu">
        ${items.map(([k, h]) => `<a href="${h}" class="${PAGE === k ? "active" : ""}">${t(k)}</a>`).join("")}
        <a href="${esc(store)}"${ext(store)}>${t("store")} ↗</a>
        <button class="lang" title="Langue / Language">${LANG === "fr" ? "<b>FR</b> / EN" : "FR / <b>EN</b>"}</button>
      </nav></div>`;
    document.body.prepend(nav);
    const burger = nav.querySelector(".burger"), menu = nav.querySelector(".menu");
    burger.onclick = () => { const o = menu.classList.toggle("open"); burger.textContent = o ? t("close") : t("menu"); burger.setAttribute("aria-expanded", o); };
    nav.querySelector(".lang").onclick = () => { safeSet("lang", LANG === "fr" ? "en" : "fr"); const u = new URL(location); u.searchParams.delete("lang"); location.href = u; };
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 30 || PAGE !== "home");
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    const nlAction = site.newsletter_url;
    const nl = document.createElement("section");
    nl.className = "newsletter";
    nl.innerHTML = `<div class="wrap">
      <h2>${t("stayTuned")}</h2>
      <div>
        <p class="mono" style="margin-bottom:18px">${t("nlText")}</p>
        ${nlAction
          ? `<form class="nl-form" action="${esc(nlAction)}" method="post" target="_blank"><input type="email" name="EMAIL" required placeholder="${t("email")}"><button type="submit">${t("subscribe")} →</button></form>`
          : `<a class="nl-form" href="mailto:${esc(site.email)}?subject=Newsletter%20ROD-R" style="padding:14px 0;font-size:20px;font-weight:500">${t("nlSoon")} →</a>`}
      </div></div>`;
    const footer = document.createElement("footer");
    footer.innerHTML = `<div class="wrap">
      <div class="foot">
        <div><a class="logo" href="/">ROD<span>-</span>R</a></div>
        <div><p class="label">${t("links")}</p><ul>${items.slice(0, 4).map(([k, h]) => `<li><a href="${h}">${t(k)}</a></li>`).join("")}<li><a href="${esc(store)}"${ext(store)}>${t("store")} ↗</a></li></ul></div>
        <div><p class="label">${t("follow")}</p><ul>${(site.socials || []).map(s => `<li><a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)} ↗</a></li>`).join("")}</ul></div>
        <div><p class="label">${t("contact")}</p><ul><li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li><li><a href="/bio/#epk">${t("epk")}</a></li></ul></div>
      </div>
      <div class="legal label"><span>© ${new Date().getFullYear()} ROD-R — ${t("rights")}</span><span>Tarn, France</span></div></div>`;
    document.body.append(nl, footer);
  }

  /* ---------- Blocks ---------- */
  const coverHTML = r => r.cover
    ? `<div class="cover"><img src="${esc(r.cover)}" alt="${esc(r.title)}" loading="lazy"></div>`
    : `<div class="cover ph"><span class="mono">ROD-R</span><strong>${esc(r.title)}</strong><span class="mono">${esc(r.type)} · ${esc(r.year)}</span></div>`;
  const linksHTML = (links, cls = "btn") => (links || []).filter(l => l.url).map(l => `<a class="${cls}" href="${esc(l.url)}"${ext(l.url)}>${esc(l.name)} ↗</a>`).join("");
  const videoHTML = v => { const id = ytId(v.youtube); return id ? `<div class="card rv"><div class="video" data-yt="${id}" style="background-image:url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)" role="button" aria-label="${esc(v.title)}"><span class="play"></span></div><p class="label">${esc(v.title)}</p></div>` : ""; };
  const dateRow = d => `<div class="date rv"><span class="d">${fmtDate(d.date)}</span><span class="v">${esc(d.venue)}<small>${esc(d.city)}</small></span><span class="i">${esc(d.info)}</span>${d.ticket_url ? `<a class="btn" href="${esc(d.ticket_url)}"${ext(d.ticket_url)}>${t("tickets")} ↗</a>` : "<span></span>"}</div>`;
  const newsCard = n => { const h = n.link || ""; const tag = h ? "a" : "div"; return `<${tag} class="card rv" ${h ? `href="${esc(h)}"${ext(h)}` : ""}>${n.image ? `<div class="img"><img src="${esc(n.image)}" alt="" loading="lazy"></div>` : ""}<p class="label red">${fmtDate(n.date)}</p><h3>${esc(L(n, "title"))}</h3><p class="muted">${esc(L(n, "text"))}</p></${tag}>`; };
  const upcomingOf = dates => (dates.upcoming || []).filter(d => d.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date));

  /* ---------- Pages ---------- */
  const pages = {
    async home(main, site) {
      const [rel, dates, vids, news] = await Promise.all([load("releases"), load("dates"), load("videos"), load("news")]);
      const r = (rel.items || [])[0], up = upcomingOf(dates).slice(0, 3), v = (vids.items || [])[0];
      const ns = (news.items || []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
      main.innerHTML = `
      <section class="hero"><div class="hero-bg" style="background-image:url('${esc(site.hero_image)}')"></div>
        <div class="wrap"><p class="label" style="color:var(--white)">${t("heroLabel")}</p>
          <h1 class="display">ROD-R</h1>
          <div class="hero-row"><p class="lead">${esc(L(site, "tagline"))}</p><div class="stream">${linksHTML(site.streaming)}</div></div></div></section>
      ${r ? `<section class="block"><div class="wrap feature">
        <a class="rv" href="/musique/">${coverHTML(r)}</a>
        <div class="txt rv"><p class="label red">${t("latest")} · ${esc(r.type)} · ${esc(r.year)}</p><h2 class="title">${esc(r.title)}</h2><p class="lead muted">${esc(L(r, "text"))}</p><div class="stream">${linksHTML(r.links, "btn red")}</div><a class="more" href="/musique/">${t("allMusic")} →</a></div></div></section>` : ""}
      <section class="block"><div class="wrap"><div class="head"><h2 class="title rv">${t("upcoming")}</h2><a class="more" href="/live/">${t("allDates")} →</a></div>
        <div class="dates">${up.length ? up.map(dateRow).join("") : `<p class="muted" style="padding:24px 0">${t("noDates")}</p>`}</div></div></section>
      ${v ? `<section class="block"><div class="wrap"><div class="head"><h2 class="title rv">${t("live")}</h2><p class="label">${esc(v.title)}</p></div>${videoHTML(v).replace('<p class="label">' + esc(v.title) + "</p>", "")}</div></section>` : ""}
      ${ns.length ? `<section class="block"><div class="wrap"><div class="head"><h2 class="title rv">${t("news")}</h2><a class="more" href="/news/">${t("allNews")} →</a></div><div class="grid g3">${ns.map(newsCard).join("")}</div></div></section>` : ""}`;
    },
    async music(main) {
      const [rel, vids] = await Promise.all([load("releases"), load("videos")]);
      main.innerHTML = `<section class="page-top"><div class="wrap"><p class="label red rv">${t("discography")}</p><h1 class="display rv" style="margin:16px 0 clamp(48px,7vw,96px)">${t("music")}</h1>
        ${(rel.items || []).map(r => `<article class="release rv">
          <div>${coverHTML(r)}</div>
          <div class="info"><p class="label">${esc(r.type === "Single" ? t("single") : r.type)} · ${esc(r.year)}${r.label ? " · " + esc(r.label) : ""}</p><h2>${esc(r.title)}</h2>
            <div class="cols"><div><p class="label" style="margin-bottom:10px">${t("info")}</p><p class="muted">${esc(L(r, "text"))}</p></div>
            <div><p class="label" style="margin-bottom:10px">${t("tracklist")}</p><ol class="tracks">${(r.tracks || []).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div></div>
            ${(r.links || []).some(l => l.url) ? `<div class="stream">${linksHTML(r.links)}</div>` : ""}</div></article>`).join("")}</div></section>
      <section class="block"><div class="wrap"><div class="head"><h2 class="title rv">${t("videos")}</h2></div><div class="grid g2">${(vids.items || []).map(videoHTML).join("")}</div></div></section>`;
    },
    async live(main) {
      const [dates, vids] = await Promise.all([load("dates"), load("videos")]);
      const up = upcomingOf(dates), v = (vids.items || [])[0];
      main.innerHTML = `<section class="page-top"><div class="wrap"><p class="label red rv">Tour</p><h1 class="display rv" style="margin:16px 0 clamp(48px,7vw,96px)">${t("live")}</h1>
        <div class="dates">${up.length ? up.map(dateRow).join("") : `<p class="muted" style="padding:24px 0">${t("noDates")}</p>`}</div></div></section>
        <section class="block"><div class="wrap feature"><div class="txt rv"><p class="label red">${t("liveTitle")}</p><h2 class="title">Live A/V</h2><p class="lead muted">${t("liveText")}</p><a class="more" href="/files/ROD-R_Fiche_technique_2026.pdf" target="_blank">Fiche technique ↗</a></div>
        <div class="rv">${v ? videoHTML(v) : ""}</div></div></section>
        ${(dates.past || []).length ? `<section class="block"><div class="wrap"><div class="head"><h2 class="title rv">${t("past")}</h2></div><ul class="past">${dates.past.map(p => `<li><b>${esc(p.year)}</b><span><span style="color:var(--white)">${esc(p.venue)}</span> — ${esc(p.city)}</span></li>`).join("")}</ul></div></section>` : ""}`;
    },
    async bio(main) {
      const b = await load("bio");
      main.innerHTML = `<section class="page-top"><div class="wrap"><p class="label red rv">Biographie</p><h1 class="display rv" style="margin:16px 0 clamp(48px,7vw,96px)">${t("bio")}</h1>
        <div class="bio"><div class="portrait rv">${b.portrait ? `<img src="${esc(b.portrait)}" alt="ROD-R">` : ""}</div>
        <div><div class="prose rv">${paras(L(b, "bio"))}</div>
          ${(b.press || []).length ? `<p class="label" style="margin:48px 0 14px">${t("press")}</p><div class="tags">${b.press.map(p => `<span>${esc(p)}</span>`).join("")}</div>` : ""}
          <div id="epk" style="scroll-margin-top:100px"><p class="label" style="margin:56px 0 14px">${t("epk")}</p><div class="dl">${(b.downloads || []).map(d => `<a href="${esc(d.file)}" download target="_blank">${esc(d.name)}<span>↓</span></a>`).join("")}</div></div>
        </div></div></div></section>`;
    },
    async gallery(main) {
      const g = await load("gallery");
      main.innerHTML = `<section class="page-top"><div class="wrap"><p class="label red rv">Photos</p><h1 class="display rv" style="margin:16px 0 clamp(48px,7vw,96px)">${t("gallery")}</h1>
        <div class="masonry">${(g.items || []).map(i => `<figure class="rv"><img src="${esc(i.image)}" alt="${esc(i.caption)}" loading="lazy">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ""}</figure>`).join("")}</div></div></section>
        <div class="lightbox"><img alt=""></div>`;
      const lb = main.querySelector(".lightbox"), li = lb.querySelector("img");
      main.querySelectorAll(".masonry img").forEach(img => img.onclick = () => { li.src = img.src; lb.classList.add("open"); });
      lb.onclick = () => lb.classList.remove("open");
      addEventListener("keydown", e => e.key === "Escape" && lb.classList.remove("open"));
    },
    async news(main) {
      const n = await load("news");
      const items = (n.items || []).sort((a, b) => b.date.localeCompare(a.date));
      main.innerHTML = `<section class="page-top"><div class="wrap"><p class="label red rv">Actualités</p><h1 class="display rv" style="margin:16px 0 clamp(48px,7vw,96px)">${t("news")}</h1>
        <div class="grid g3">${items.map(newsCard).join("")}</div></div></section>`;
    },
    async contact(main, site) {
      const c = await load("contact");
      main.innerHTML = `<section class="page-top"><div class="wrap"><p class="label red rv">${t("booking")}</p><h1 class="display rv" style="margin:16px 0 clamp(40px,6vw,80px)">${t("contact")}</h1>
        <a class="bigmail rv" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
        <div class="contacts" style="margin-top:clamp(56px,8vw,110px)">${(c.items || []).map(x => `<a class="rv" href="mailto:${esc(x.email)}"><span class="label">${esc(L(x, "role"))}</span><span class="n">${esc(x.name)}</span><span class="mono">${esc(x.email)}</span></a>`).join("")}</div></div></section>`;
    }
  };

  /* ---------- Boot ---------- */
  (async () => {
    const site = await load("site");
    shell(site);
    const main = document.querySelector("main");
    await (pages[PAGE] || pages.home)(main, site);
    // video click-to-play
    document.addEventListener("click", e => {
      const v = e.target.closest(".video[data-yt]");
      if (v && !v.querySelector("iframe")) v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="YouTube"></iframe>`;
    });
    // reveal
    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .12 }) : null;
    document.querySelectorAll(".rv").forEach(el => io ? io.observe(el) : el.classList.add("in"));
  })();
})();
