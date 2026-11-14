/* ROD-R — one-page. Contenu : /content/*.json (édité via Pages CMS). */
(() => {
  const qs = new URLSearchParams(location.search);
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let LANG = qs.get("lang") || get("lang") || ((navigator.language || "fr").startsWith("fr") ? "fr" : "en");
  if (!["fr", "en"].includes(LANG)) LANG = "fr";
  document.documentElement.lang = LANG;

  const UI = {
    fr: { music: "Musique", dates: "Dates", live: "Live A/V", videos: "Vidéos", bio: "Bio", gallery: "Galerie", news: "News", contact: "Contact", store: "Store",
      menu: "Menu", close: "Fermer", info: "Info", tracklist: "Tracklist", listen: "Écouter", tickets: "Billets", noDates: "Nouvelles dates bientôt.",
      past: "Déjà joué", epk: "Presskit / EPK", press: "Presse", stay: "Reste dans la boucle.", nlText: "Sorties, dates, coulisses. Pas de spam.",
      email: "Ton e-mail", subscribe: "S'inscrire →", soon: "Newsletter bientôt — écris-nous →", releases: "sorties", upcoming: "à venir",
      liveText: "Un live en sept actes, joué sur machines analogiques et projeté sur tulle. Musique, typographie et visuels génératifs pensés comme un seul geste.",
      techsheet: "Fiche technique", minutes: "minutes", acts: "actes", screen: "tulle", play: "Lecture", drag: "Glisser →", rights: "Tous droits réservés",
      booking: "Booking · presse · contact", latest: "Nouveau" },
    en: { music: "Music", dates: "Dates", live: "Live A/V", videos: "Videos", bio: "Bio", gallery: "Gallery", news: "News", contact: "Contact", store: "Store",
      menu: "Menu", close: "Close", info: "Info", tracklist: "Tracklist", listen: "Listen", tickets: "Tickets", noDates: "New dates coming soon.",
      past: "Played", epk: "Press kit / EPK", press: "Press", stay: "Stay in the loop.", nlText: "Releases, shows, behind the scenes. No spam.",
      email: "Your email", subscribe: "Subscribe →", soon: "Newsletter coming soon — email us →", releases: "releases", upcoming: "upcoming",
      liveText: "A live show in seven acts, played on analogue machines and projected onto tulle. Music, typography and generative visuals conceived as one gesture.",
      techsheet: "Tech rider", minutes: "minutes", acts: "acts", screen: "tulle", play: "Play", drag: "Drag →", rights: "All rights reserved",
      booking: "Booking · press · contact", latest: "New" }
  };
  const t = k => UI[LANG][k] || k;
  const L = (o, k) => (o && (o[`${k}_${LANG}`] || o[`${k}_fr`] || o[k])) || "";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ext = u => /^https?:/.test(u || "") ? ' target="_blank" rel="noopener"' : "";
  const ytId = u => (String(u || "").match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1] || "";
  const dd = iso => { const d = new Date(iso + "T12:00:00"); return isNaN(d) ? { a: esc(iso), b: "" } : { a: String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0"), b: d.getFullYear() }; };
  const paras = s => String(s || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const split = s => [...s].map(c => `<span>${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
  const load = n => fetch(`/content/${n}.json`, { cache: "no-cache" }).then(r => r.json()).catch(() => ({}));

  const SECTIONS = [["musique", "music"], ["dates", "dates"], ["live", "live"], ["videos", "videos"], ["bio", "bio"], ["galerie", "gallery"], ["news", "news"], ["contact", "contact"]];
  const num = id => String(SECTIONS.findIndex(s => s[0] === id) + 1).padStart(2, "0");
  const head = (id, aside = "") => `<div class="sec-head"><span class="num">${num(id)}</span><h2 class="cond"><span>${esc(t(SECTIONS.find(s => s[0] === id)[1]))}</span></h2><span class="aside mono grey">${aside}</span></div>`;
  const cover = r => r.cover ? `<div class="cover"><img src="${esc(r.cover)}" alt="${esc(r.title)}" loading="lazy"></div>`
    : `<div class="cover ph"><span class="mono">ROD-R</span><strong>${esc(r.title)}</strong><span class="mono">${esc(r.type)} · ${esc(r.year)}</span></div>`;
  const btns = (links, cls = "btn") => (links || []).filter(l => l.url).map(l => `<a class="${cls}" href="${esc(l.url)}"${ext(l.url)}>${esc(l.name)} ↗</a>`).join("");
  const video = v => { const id = ytId(v.youtube); return id ? `<div class="v"><div class="video" data-yt="${id}" style="background-image:url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)" role="button" tabindex="0" aria-label="${esc(v.title)}"><span class="play">▶ ${t("play")}</span></div><div class="cap"><span class="mono">${esc(v.title)}</span></div></div>` : ""; };

  (async () => {
    const [site, rel, dates, vids, bio, gal, news, contact] = await Promise.all(["site", "releases", "dates", "videos", "bio", "gallery", "news", "contact"].map(load));
    const today = new Date().toISOString().slice(0, 10);
    const up = (dates.upcoming || []).filter(d => d.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    const releases = rel.items || [], videos = vids.items || [];
    const newsItems = (news.items || []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const store = site.bandcamp_url || site.linktree_url || "#";
    const latest = releases[0];

    // ticker
    const tick = [
      latest && `<a href="#musique">${t("latest")} — ${esc(latest.title)}</a>`,
      ...up.map(d => `<a href="#dates">${dd(d.date).a}.${dd(d.date).b} — ${esc(d.venue)}, ${esc(d.city)}</a>`),
      `<a href="#live">Live A/V</a>`, `<a href="mailto:${esc(site.email)}">Booking — ${esc(site.email)}</a>`
    ].filter(Boolean).map(x => x + "<em>✕</em>").join("");

    document.body.innerHTML = `
    <header class="nav">
      <a class="logo corner tl" href="#top">ROD<i>-</i>R</a>
      <a class="corner tc mid" href="mailto:${esc(site.email)}">Booking</a>
      <ul class="corner tr">${SECTIONS.map(([id, k], i) => `<li><a href="#${id}" data-s="${id}"><b>${String(i + 1).padStart(2, "0")}</b>${t(k)}</a></li>`).join("")}<li><a href="${esc(store)}"${ext(store)}>${t("store")} ↗</a></li></ul>
      <button class="burger corner tr" aria-expanded="false">${t("menu")}</button>
      <div class="corner bl socials">${(site.socials || []).map(s => `<a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)}</a>`).join("")}</div>
      <div class="corner br"><span class="where"><b>01</b> / ${String(SECTIONS.length).padStart(2, "0")}</span><button class="lang">${LANG === "fr" ? "<b>FR</b>&nbsp;/&nbsp;EN" : "FR&nbsp;/&nbsp;<b>EN</b>"}</button></div>
    </header>

    <main id="top">
      <section class="hero">
        <canvas aria-hidden="true"></canvas>
        <p class="hero-sub">Electronica · IDM · Live A/V</p>
        <h1 class="hero-title cond">${split("ROD-R")}</h1>

      </section>
      <div class="ticker"><div>${tick}${tick}</div></div>

      <section class="sec" id="musique">${head("musique", `${releases.length} ${t("releases")}`)}
        <div class="rels">${releases.map((r, i) => `<div class="rel${i === 0 ? " open" : ""}">
          <button class="rel-row" data-i="${i}" aria-expanded="${i === 0}"><span class="yr mono grey">${esc(r.year)}</span><span class="t">${esc(r.title)}</span><span class="ty mono grey">${esc(r.type)}</span><span class="lb mono grey">${esc(r.label)}</span><span class="pl">+</span></button>
          <div class="rel-body"><div><div class="rel-in">
            ${cover(r)}
            <div><p class="mono grey" style="margin-bottom:10px">${t("info")}</p><p style="font-size:19px;line-height:1.4;margin-bottom:24px">${esc(L(r, "text"))}</p><div class="row-btns">${btns(r.links, "btn fill")}</div></div>
            <div><p class="mono grey" style="margin-bottom:10px">${t("tracklist")}</p><ol class="tracks">${(r.tracks || []).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
          </div></div></div></div>`).join("")}</div>
        <div class="row-btns body" style="padding-top:28px;padding-bottom:28px">${btns(site.streaming)}</div>
      </section>

      <section class="sec" id="dates">${head("dates", `${up.length} ${t("upcoming")}`)}
        <div>${up.length ? up.map(d => { const x = dd(d.date); return `<div class="date rv"><span class="mono grey">${x.b}</span><span class="d">${x.a}</span><span class="v">${esc(d.venue)}</span><span class="grey">${esc(d.city)}${d.info ? " — " + esc(d.info) : ""}</span>${d.ticket_url ? `<a class="btn" href="${esc(d.ticket_url)}"${ext(d.ticket_url)}>${t("tickets")} ↗</a>` : "<span></span>"}</div>`; }).join("") : `<p class="body grey">${t("noDates")}</p>`}</div>
        ${(dates.past || []).length ? `<p class="mono grey" style="padding:44px var(--pad) 14px">${t("past")}</p><ul class="past">${dates.past.map(p => `<li><b>${esc(p.year)}</b><span><span style="color:var(--white)">${esc(p.venue)}</span> — ${esc(p.city)}</span></li>`).join("")}</ul>` : ""}
      </section>

      <section class="sec" id="live">${head("live", "45'")}
        <div class="live-band"><div class="bg" style="background-image:url('/images/live-typo.jpg')"></div>
          <div class="txt rv"><p class="big">${t("liveText")}</p>
            <div class="facts"><div><strong>45</strong><span class="mono grey">${t("minutes")}</span></div><div><strong>7</strong><span class="mono grey">${t("acts")}</span></div><div><strong>A/V</strong><span class="mono grey">${t("screen")}</span></div></div>
            <div class="row-btns"><a class="btn fill" href="mailto:${esc(site.email)}?subject=Booking%20ROD-R%20Live%20A%2FV">Booking ↗</a><a class="btn" href="/files/ROD-R_Fiche_technique_2026.pdf" target="_blank">${t("techsheet")} ↓</a></div></div></div>
      </section>

      <section class="sec" id="videos">${head("videos", `${videos.length}`)}
        <div class="vids">${videos.map(video).join("")}</div>
      </section>

      <section class="sec" id="bio">${head("bio")}
        <div class="bio">
          <div class="rv">${paras(L(bio, "bio")).slice(0, 1).map(p => `<p class="lead">${esc(p)}</p>`).join("")}
            ${bio.portrait ? `<div class="portrait"><img src="${esc(bio.portrait)}" alt="ROD-R" loading="lazy"></div>` : ""}</div>
          <div class="rv"><div class="prose">${paras(L(bio, "bio")).slice(1).map(p => `<p>${esc(p)}</p>`).join("")}</div>
            ${(bio.press || []).length ? `<p class="mono grey" style="margin-top:36px">${t("press")}</p><div class="tags">${bio.press.map(p => `<span>${esc(p)}</span>`).join("")}</div>` : ""}
            <p class="mono grey" id="epk" style="margin-top:44px">${t("epk")}</p><div class="dl">${(bio.downloads || []).map(d => `<a href="${esc(d.file)}" target="_blank" download>${esc(d.name)}<span>↓</span></a>`).join("")}</div></div>
        </div>
      </section>

      <section class="sec" id="galerie">${head("galerie", t("drag"))}
        <div class="strip">${(gal.items || []).map(g => `<figure><img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy" draggable="false">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ""}</figure>`).join("")}</div>
      </section>

      <section class="sec" id="news">${head("news")}
        <div class="news">${newsItems.map(n => { const tag = n.link ? "a" : "div"; const x = dd(n.date); return `<${tag} class="n rv"${n.link ? ` href="${esc(n.link)}"${ext(n.link)}` : ""}>${n.image ? `<div class="img"><img src="${esc(n.image)}" alt="" loading="lazy"></div>` : ""}<span class="mono red">${x.a}.${x.b}</span><h3>${esc(L(n, "title"))}</h3><p class="grey">${esc(L(n, "text"))}</p></${tag}>`; }).join("")}</div>
      </section>

      <section class="sec" id="contact">${head("contact", t("booking"))}
        <a class="bigmail" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
        <div class="contacts">${(contact.items || []).map(c => `<a href="mailto:${esc(c.email)}"><span class="mono grey">${esc(L(c, "role"))}</span><strong>${esc(c.name)}</strong><span class="mono">${esc(c.email)}</span></a>`).join("")}</div>
        <div class="nl"><h2 class="cond">${t("stay")}</h2><div style="display:flex;flex-direction:column;justify-content:flex-end;gap:16px"><p class="mono">${t("nlText")}</p>
          ${site.newsletter_url ? `<form action="${esc(site.newsletter_url)}" method="post" target="_blank"><input type="email" name="EMAIL" required placeholder="${t("email")}"><button type="submit">${t("subscribe")}</button></form>`
            : `<a class="soon" href="mailto:${esc(site.email)}?subject=Newsletter%20ROD-R">${t("soon")}</a>`}</div></div>
      </section>
    </main>

    <footer>
      <ul class="mono">${(site.socials || []).map(s => `<li><a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)} ↗</a></li>`).join("")}<li><a href="${esc(store)}"${ext(store)}>${t("store")} ↗</a></li></ul>
      <span class="mono grey">© ${new Date().getFullYear()} ROD-R — ${t("rights")}</span>
      <div class="foot-logo cond" aria-hidden="true">ROD-R</div>
    </footer>
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="grain-type" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="1" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="rough"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  9 0 0 0 -2.2" result="holes"/>
      <feComposite in="rough" in2="holes" operator="in"/>
    </filter></svg>
    <div class="preview" aria-hidden="true"></div>
    <div class="lightbox"><img alt=""></div>`;

    // nav
    const nav = document.querySelector(".nav"), ul = nav.querySelector("ul"), burger = nav.querySelector(".burger");
    burger.onclick = () => { const o = ul.classList.toggle("open"); burger.textContent = o ? t("close") : t("menu"); burger.setAttribute("aria-expanded", o); };
    ul.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { ul.classList.remove("open"); burger.textContent = t("menu"); }));
    nav.querySelector(".lang").onclick = () => { set("lang", LANG === "fr" ? "en" : "fr"); const u = new URL(location); u.searchParams.delete("lang"); location.href = u; };

    // active section + reveal
    const links = [...ul.querySelectorAll("a[data-s]")];
    if ("IntersectionObserver" in window) {
      const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.toggle("on", a.dataset.s === e.target.id)); const w = nav.querySelector(".where b"); if (w) w.textContent = num(e.target.id); } }), { rootMargin: "-45% 0px -50% 0px" });
      document.querySelectorAll("section.sec").forEach(s => so.observe(s));
      const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }), { threshold: .15 });
      document.querySelectorAll(".rv, .sec-head").forEach(el => ro.observe(el));
    } else document.querySelectorAll(".rv, .sec-head").forEach(el => el.classList.add("in"));

    // grain "boil" on the titles: reseed the noise a few times per second
    const turb = document.querySelector("#grain-type feTurbulence");
    if (turb && !matchMedia("(prefers-reduced-motion: reduce)").matches) { let sd = 1; setInterval(() => { sd = (sd % 7) + 1; turb.setAttribute("seed", sd); }, 140); }

    // cursor trail made of grain, over the whole site
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(pointer: fine)").matches) {
      const tc = document.createElement("canvas"); tc.className = "trail"; document.body.appendChild(tc);
      const tx = tc.getContext("2d"); let TW, TH, G = [], lx = null, ly = null;
      const ts = () => { const d = Math.min(devicePixelRatio || 1, 2); TW = innerWidth; TH = innerHeight; tc.width = TW * d; tc.height = TH * d; tx.setTransform(d, 0, 0, d, 0, 0); };
      ts(); addEventListener("resize", ts);
      addEventListener("pointermove", e => {
        const x = e.clientX, y = e.clientY;
        if (lx !== null) {
          const dx = x - lx, dy = y - ly, dist = Math.hypot(dx, dy), n = Math.min(Math.round(dist * 1.6), 60);
          for (let i = 0; i < n; i++) { const k = Math.random(); G.push({ x: lx + dx * k + (Math.random() - .5) * 10, y: ly + dy * k + (Math.random() - .5) * 10, vx: (Math.random() - .5) * .6 - dx * .01, vy: (Math.random() - .5) * .6 - dy * .01, life: 1, s: Math.random() < .85 ? 1 : 1.8, red: Math.random() < .12 }); }
          if (G.length > 2500) G.splice(0, G.length - 2500);
        }
        lx = x; ly = y;
      }, { passive: true });
      const tick = () => {
        tx.clearRect(0, 0, TW, TH);
        for (let i = G.length - 1; i >= 0; i--) {
          const g = G[i]; g.x += g.vx; g.y += g.vy; g.vy += 0.015; g.vx *= .97; g.vy *= .97; g.life -= 0.018;
          if (g.life <= 0) { G.splice(i, 1); continue; }
          tx.fillStyle = g.red ? `rgba(225,37,27,${g.life})` : `rgba(239,238,233,${g.life * .9})`;
          tx.fillRect(g.x, g.y, g.s, g.s);
        }
        requestAnimationFrame(tick);
      };
      tick();
    }

    // releases accordion + cursor cover preview
    const pv = document.querySelector(".preview");
    let pvRaf;
    document.querySelectorAll(".rel-row").forEach(b => {
      b.onclick = () => { const r = b.parentElement, o = r.classList.toggle("open"); b.setAttribute("aria-expanded", o); };
      b.addEventListener("mouseenter", () => { const r = releases[b.dataset.i]; if (b.parentElement.classList.contains("open")) return; pv.innerHTML = cover(r); pv.classList.add("on"); });
      b.addEventListener("mouseleave", () => pv.classList.remove("on"));
      b.addEventListener("mousemove", e => { cancelAnimationFrame(pvRaf); pvRaf = requestAnimationFrame(() => { pv.style.left = e.clientX + 170 + "px"; pv.style.top = e.clientY + "px"; }); });
      b.addEventListener("click", () => pv.classList.remove("on"));
    });

    // videos
    document.addEventListener("click", e => { const v = e.target.closest(".video[data-yt]"); if (v && !v.querySelector("iframe")) v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="YouTube"></iframe>`; });

    // gallery: drag to scroll + lightbox
    const strip = document.querySelector(".strip"), lb = document.querySelector(".lightbox"), lbi = lb.querySelector("img");
    let down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add("drag"); });
    addEventListener("pointermove", e => { if (!down) return; moved = Math.abs(e.clientX - sx); strip.scrollLeft = sl - (e.clientX - sx); });
    addEventListener("pointerup", () => { down = false; strip.classList.remove("drag"); });
    strip.querySelectorAll("img").forEach(img => img.addEventListener("click", () => { if (moved > 6) return; lbi.src = img.src; lb.classList.add("open"); }));
    lb.onclick = () => lb.classList.remove("open");
    addEventListener("keydown", e => e.key === "Escape" && lb.classList.remove("open"));

    // parallax on live band
    const band = document.querySelector(".live-band .bg");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) addEventListener("scroll", () => { const r = band.parentElement.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) band.style.transform = `translateY(${(r.top / innerHeight) * -60}px)`; }, { passive: true });

    // fit giant titles to the viewport width
    const fit = () => document.querySelectorAll(".foot-logo").forEach(el => {
      const host = el.classList.contains("hero-title") ? el : el.parentElement;
      const cs = getComputedStyle(host), pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const avail = (el.classList.contains("hero-title") ? innerWidth : host.clientWidth) - pad;
      const probe = document.createElement("span"); probe.className = "cond"; probe.textContent = "ROD-R";
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-size:100px";
      document.body.appendChild(probe); const w = probe.getBoundingClientRect().width; probe.remove();
      el.style.fontSize = Math.floor(100 * avail / w * 0.995) + "px";
    });
    fit(); (document.fonts && document.fonts.ready || Promise.resolve()).then(fit); addEventListener("resize", fit);

    // hero: a black hole at the centre emitting grain, disturbed by the pointer
    const hero = document.querySelector(".hero"), cv = hero.querySelector("canvas"), cx = cv.getContext("2d");
    const title = hero.querySelector(".hero-title");
    let W = 0, H = 0, CX = 0, CY = 0, R0 = 100, P = [], visible = true, tt = 0, surge = 0, nextSurge = 4;
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, on: false };
    const N = () => (innerWidth < 700 ? 4200 : 10000);
    const spawn = (p, fresh) => {
      const a = Math.random() * Math.PI * 2, r = R0 * (1 + Math.random() * 0.04);
      p.x = CX + Math.cos(a) * r; p.y = CY + Math.sin(a) * r;
      const out = 0.25 + Math.random() * 0.9;          // radial push
      p.vx = Math.cos(a) * out; p.vy = Math.sin(a) * out;
      p.max = R0 * (1.25 + Math.pow(Math.random(), 2.2) * 3.2); // most die close to the rim -> dense halo
      p.s = Math.random() < 0.9 ? 1 : 1.7; p.red = Math.random() < 0.03; p.spin = (Math.random() < 0.5 ? 1 : 1) * (0.6 + Math.random() * 0.8);
      if (fresh) { const k = Math.random(); const rr = R0 + (p.max - R0) * k; p.x = CX + Math.cos(a) * rr; p.y = CY + Math.sin(a) * rr; }
      return p;
    };
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
      CX = W / 2; CY = H / 2; R0 = Math.min(W, H) * (W < 700 ? 0.2 : 0.17);
      title.style.fontSize = Math.round(R0 * 0.42) + "px";
      P = Array.from({ length: N() }, () => spawn({}, true));
    };
    size(); addEventListener("resize", () => { clearTimeout(size.t); size.t = setTimeout(size, 200); });
    const setMouse = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (mouse.on) { mouse.vx = x - mouse.x; mouse.vy = y - mouse.y; } mouse.x = x; mouse.y = y; mouse.on = true; };
    hero.addEventListener("pointermove", setMouse);
    hero.addEventListener("pointerdown", e => { setMouse(e); surge = 1; });
    hero.addEventListener("pointerleave", () => { mouse.on = false; mouse.x = mouse.y = -9999; });
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(hero);
    const frame = () => {
      if (visible) {
        tt += 1 / 60; if (tt > nextSurge) { surge = 0.7; nextSurge = tt + 4 + Math.random() * 5; }  // spontaneous energy pulses
        surge *= 0.965;
        cx.fillStyle = "rgba(10,10,10,0.42)"; cx.fillRect(0, 0, W, H);   // short trails
        const MR = Math.min(W, H) * 0.22, MR2 = MR * MR, ms = Math.min(Math.hypot(mouse.vx, mouse.vy), 50);
        const breath = 1 + Math.sin(tt * 1.3) * 0.25;
        for (const p of P) {
          const dx = p.x - CX, dy = p.y - CY, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
          // flow: outward energy + swirl that weakens with distance
          const push = (0.035 + surge * 0.5) * breath * (R0 / d), swirl = 0.05 * p.spin * (R0 / d);
          p.vx += ux * push - uy * swirl; p.vy += uy * push + ux * swirl;
          if (mouse.on) {
            const mx = p.x - mouse.x, my = p.y - mouse.y, m2 = mx * mx + my * my;
            if (m2 < MR2) { const m = Math.sqrt(m2) || 1, f = (1 - m / MR); const f2 = f * f * (1.6 + ms * 0.09); p.vx += mx / m * f2 + my / m * f2 * 0.8; p.vy += my / m * f2 - mx / m * f2 * 0.8; }
          }
          p.vx *= 0.94; p.vy *= 0.94; p.x += p.vx; p.y += p.vy;
          const nd = Math.hypot(p.x - CX, p.y - CY);
          if (nd > p.max || nd < R0 * 0.92 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) { spawn(p); continue; }
          const life = 1 - (nd - R0) / (p.max - R0);
          const v = Math.min(Math.hypot(p.vx, p.vy) / 6, 1);
          cx.fillStyle = p.red || v > 0.6 ? `rgba(225,37,27,${0.5 + life * 0.5})` : `rgba(239,238,233,${0.15 + life * 0.85})`;
          cx.fillRect(p.x, p.y, p.s, p.s);
        }
        cx.fillStyle = "#0a0a0a"; cx.beginPath(); cx.arc(CX, CY, R0 * 0.985, 0, Math.PI * 2); cx.fill();   // the black hole
        mouse.vx *= 0.85; mouse.vy *= 0.85;
      }
      requestAnimationFrame(frame);
    };
    if (reduce) { cx.fillStyle = "#0a0a0a"; cx.fillRect(0, 0, W, H); P.forEach(p => { cx.fillStyle = `rgba(239,238,233,.6)`; cx.fillRect(p.x, p.y, p.s, p.s); }); cx.beginPath(); cx.arc(CX, CY, R0, 0, Math.PI * 2); cx.fill(); }
    else frame();
  })();
})();
