/* ROD-R — one-page. Contenu : /content/*.json (édité via Pages CMS). */
(() => {
  const qs = new URLSearchParams(location.search);
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let LANG = qs.get("lang") || get("lang") || ((navigator.language || "fr").startsWith("fr") ? "fr" : "en");
  if (!["fr", "en"].includes(LANG)) LANG = "fr";
  document.documentElement.lang = LANG;

  const UI = {
    fr: { about: "À propos", disco: "Discographie", music: "Musique", dates: "Dates", live: "Live", videos: "Vidéos", bio: "Bio", gallery: "Galerie", news: "News", contact: "Contact / Pro", store: "Store", pro: "Espace pro", proText: "Presskit, bio, fiche technique et visuels pour programmateurs, bookers et journalistes.", photosHD: "Photos HD & logos — sur demande", upcomingT: "À venir", captation: "Captation live",
      menu: "Menu", close: "Fermer", info: "Info", tracklist: "Tracklist", listen: "Écouter", tickets: "Billets", noDates: "Nouvelles dates bientôt.",
      past: "Déjà joué", epk: "Presskit / EPK", press: "Presse", stay: "Reste dans la boucle.", nlText: "Sorties, dates, coulisses. Pas de spam.",
      email: "Ton e-mail", subscribe: "S'inscrire →", soon: "Newsletter bientôt — écris-nous →", releases: "sorties", upcoming: "à venir",
      liveText: "Un live en sept actes, joué sur machines analogiques et projeté sur tulle. Musique, typographie et visuels génératifs pensés comme un seul geste.",
      techsheet: "Fiche technique", minutes: "minutes", acts: "actes", screen: "tulle", play: "Lecture", drag: "Glisser →", rights: "Tous droits réservés",
      booking: "Booking · presse · contact", latest: "Nouveau" },
    en: { about: "About", disco: "Discography", music: "Music", dates: "Dates", live: "Live", videos: "Videos", bio: "Bio", gallery: "Gallery", news: "News", contact: "Contact / Pro", store: "Store", pro: "Pro area", proText: "Press kit, bio, tech rider and visuals for promoters, bookers and journalists.", photosHD: "HD photos & logos — on request", upcomingT: "Upcoming", captation: "Live recording",
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

  const SECTIONS = [["about", "about"], ["discography", "disco"], ["live", "live"], ["videos", "videos"], ["news", "news"], ["gallery", "gallery"], ["contact", "contact"]];
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
      latest && `<a href="#discography">${t("latest")} — ${esc(latest.title)}</a>`,
      ...up.map(d => `<a href="#live">${dd(d.date).a}.${dd(d.date).b} — ${esc(d.venue)}, ${esc(d.city)}</a>`),
      `<a href="#live">Live A/V</a>`, `<a href="mailto:${esc(site.email)}">Booking — ${esc(site.email)}</a>`
    ].filter(Boolean).map(x => x + "<em>✕</em>").join("");

    document.body.innerHTML = `
    <header class="nav">
      <a class="logo corner tl" href="#top">ROD<i>-</i>R</a>
      <ul class="corner tr">${SECTIONS.map(([id, k], i) => `<li><a href="#${id}" data-s="${id}">${t(k)}</a></li>`).join("")}<li><a href="${esc(store)}"${ext(store)}>${t("store")} ↗</a></li></ul>
      <button class="burger corner tr" aria-expanded="false">${t("menu")}</button>
      <div class="corner bl socials">${(site.socials || []).map(s => `<a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)}</a>`).join("")}</div>
      <div class="corner br"><span class="progress" aria-hidden="true"><i></i></span><button class="lang">${LANG === "fr" ? "<b>FR</b>&nbsp;/&nbsp;EN" : "FR&nbsp;/&nbsp;<b>EN</b>"}</button></div>
    </header>

    <main id="top">
      <div class="intro">
      <section class="hero">
        <canvas aria-hidden="true"></canvas>
        <p class="hero-sub">Electronica · IDM · Live A/V</p>
        <h1 class="hero-title" aria-label="ROD-R"><span class="hole-cross" aria-hidden="true"></span></h1>
        <p class="hero-type cond" aria-hidden="true">ROD-R<br>Wandering<br>Sounds</p>

      </section>
      <section class="reel-sec" aria-label="Live">
        <div class="reel-pin"><div class="reel"><div class="reel-in" data-yt="${esc(ytId((videos[0] || {}).youtube) || "SXqtCKVxDpY")}"></div></div></div>
      </section>
      </div>

      <section class="sec" id="about">${head("about")}
        <div class="bio">
          <div class="rv">${paras(L(bio, "bio")).slice(0, 1).map(p => `<p class="lead">${esc(p)}</p>`).join("")}
            ${bio.portrait ? `<div class="portrait"><img src="${esc(bio.portrait)}" alt="ROD-R" loading="lazy"></div>` : ""}</div>
          <div class="rv"><div class="prose">${paras(L(bio, "bio")).slice(1).map(p => `<p>${esc(p)}</p>`).join("")}</div>
            ${(bio.press || []).length ? `<p class="mono grey" style="margin-top:36px">${t("press")}</p><div class="tags">${bio.press.map(p => `<span>${esc(p)}</span>`).join("")}</div>` : ""}</div>
        </div>
      </section>

      <section class="sec" id="discography">${head("discography", `${releases.length} ${t("releases")}`)}
        <div class="rels">${releases.map((r, i) => `<div class="rel${i === 0 ? " open" : ""}">
          <button class="rel-row" data-i="${i}" aria-expanded="${i === 0}"><span class="yr mono grey">${esc(r.year)}</span><span class="t">${esc(r.title)}</span><span class="ty mono grey">${esc(r.type)}</span><span class="lb mono grey">${esc(r.label)}</span><span class="pl">+</span></button>
          <div class="rel-body"><div><div class="rel-in">
            ${cover(r)}
            <div><p class="mono grey" style="margin-bottom:10px">${t("info")}</p><p style="font-size:19px;line-height:1.4;margin-bottom:24px">${esc(L(r, "text"))}</p><div class="row-btns">${btns(r.links, "btn fill")}</div></div>
            <div><p class="mono grey" style="margin-bottom:10px">${t("tracklist")}</p><ol class="tracks">${(r.tracks || []).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
          </div></div></div></div>`).join("")}</div>
        <div class="row-btns body" style="padding-top:28px;padding-bottom:28px">${btns(site.streaming)}</div>
      </section>

      <section class="sec" id="live">${head("live", `${up.length} ${t("upcoming")}`)}
        <div class="live-band"><div class="bg" style="background-image:url('/images/live-typo.jpg')"></div>
          <div class="txt rv"><p class="big">${t("liveText")}</p>
            <div class="facts"><div><strong>45</strong><span class="mono grey">${t("minutes")}</span></div><div><strong>7</strong><span class="mono grey">${t("acts")}</span></div><div><strong>A/V</strong><span class="mono grey">${t("screen")}</span></div></div>
            <div class="row-btns"><a class="btn fill" href="mailto:${esc(site.email)}?subject=Booking%20ROD-R%20Live%20A%2FV">Booking ↗</a><a class="btn" href="/files/ROD-R_Fiche_technique_2026.pdf" target="_blank">${t("techsheet")} ↓</a></div></div></div>
        <div class="live-dates">
          <p class="mono">${t("upcomingT")}</p>
          <div>${up.length ? up.map(d => { const x = dd(d.date); return `<div class="date rv"><span class="mono grey">${x.b}</span><span class="d">${x.a}</span><span class="v">${esc(d.venue)}</span><span class="grey">${esc(d.city)}${d.info ? " — " + esc(d.info) : ""}</span>${d.ticket_url ? `<a class="btn" href="${esc(d.ticket_url)}"${ext(d.ticket_url)}>${t("tickets")} ↗</a>` : "<span></span>"}</div>`; }).join("") : `<p class="grey">${t("noDates")}</p>`}</div>
          ${(dates.past || []).length ? `<p class="mono">${t("past")}</p><ul class="past">${dates.past.map(p => `<li><b>${esc(p.year)}</b><span><span style="color:var(--white)">${esc(p.venue)}</span> — ${esc(p.city)}</span></li>`).join("")}</ul>` : ""}
        </div>
      </section>

      <section class="sec" id="videos">${head("videos", `${videos.length}`)}
        <div class="vids">${videos.map(video).join("")}</div>
      </section>

      <section class="sec" id="news">${head("news")}
        <div class="news">${newsItems.map(n => { const tag = n.link ? "a" : "div"; const x = dd(n.date); return `<${tag} class="n rv"${n.link ? ` href="${esc(n.link)}"${ext(n.link)}` : ""}>${n.image ? `<div class="img"><img src="${esc(n.image)}" alt="" loading="lazy"></div>` : ""}<span class="mono red">${x.a}.${x.b}</span><h3>${esc(L(n, "title"))}</h3><p class="grey">${esc(L(n, "text"))}</p></${tag}>`; }).join("")}</div>
      </section>

      <section class="sec" id="gallery">${head("gallery", t("drag"))}
        <div class="strip">${(gal.items || []).map(g => `<figure><img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy" draggable="false">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ""}</figure>`).join("")}</div>
      </section>

      <section class="sec" id="contact">${head("contact", t("booking"))}
        <a class="bigmail" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
        <div class="contacts">${(contact.items || []).map(c => `<a href="mailto:${esc(c.email)}"><span class="mono grey">${esc(L(c, "role"))}</span><strong>${esc(c.name)}</strong><span class="mono">${esc(c.email)}</span></a>`).join("")}</div>
        <div class="pro" id="pro">
          <div><h3 class="cond">${t("pro")}</h3><p class="grey">${t("proText")}</p></div>
          <div class="dl">${(bio.downloads || []).map(d => `<a href="${esc(d.file)}" target="_blank" download>${esc(d.name)}<span>↓</span></a>`).join("")}<a href="mailto:${esc(site.email)}?subject=Photos%20HD%20%2F%20logos%20ROD-R">${t("photosHD")}<span>↗</span></a></div>
        </div>
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
    const bar = nav.querySelector(".progress i");
    const prog2 = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    addEventListener("scroll", prog2, { passive: true }); addEventListener("resize", prog2); prog2();
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
    if (false) {   // cursor trail disabled
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

    // live reel: rises from below on scroll, autoplays muted, sound toggle
    const reelSec = document.querySelector(".reel-sec"), reel = reelSec.querySelector(".reel"), reelIn = reelSec.querySelector(".reel-in");
    let reelFrame = null;
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); const id = reelIn.dataset.yt;
      reelIn.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&start=20" allow="autoplay; encrypted-media" title="ROD-R live" tabindex="-1"></iframe>`;
      reelFrame = reelIn.querySelector("iframe"); setTimeout(() => reelIn.classList.add("on"), 2600); } }, { rootMargin: "400px" }).observe(reelSec);
    const reelScroll = () => { const r = reelSec.getBoundingClientRect(); const k = Math.min(Math.max((innerHeight - r.top) / (innerHeight * 0.95), 0), 1); const e = 1 - Math.pow(1 - k, 3);
      reel.style.transform = `translateY(${(1 - e) * 160}px) scale(${0.86 + 0.14 * e})`; reel.style.opacity = 0.2 + 0.8 * e; };
    addEventListener("scroll", reelScroll, { passive: true }); reelScroll();

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

    if (qs.get("hero") === "video") {
      // TEST: live video (La Boule Noire) at 80%, grain title, mouse parallax
      const hero = document.querySelector(".hero"); hero.classList.add("video-mode");
      const id = ytId((videos[0] || {}).youtube) || "SXqtCKVxDpY";
      const box = document.createElement("div"); box.className = "hero-video";
      box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&cc_load_policy=0&start=20" allow="autoplay; encrypted-media" title="ROD-R live" tabindex="-1"></iframe>`;
      hero.prepend(box);
      setTimeout(() => box.classList.add("on"), 2600);   // reveal after YouTube's loading UI has gone
      const more = document.createElement("button"); more.className = "hero-sound"; more.textContent = LANG === "fr" ? "Voir le live complet ↗" : "Watch the full live ↗";
      more.onclick = () => document.querySelector("#videos").scrollIntoView(); hero.appendChild(more);

      // big title rebuilt from grain
      const cv = hero.querySelector("canvas"), cx = cv.getContext("2d");
      let W = 0, H = 0, P = [], visible = true;
      const m = { x: -9999, y: -9999, nx: 0, ny: 0, vx: 0, vy: 0, on: false }, par = { x: 0, y: 0 };
      const build = () => {
        const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
        const fs = Math.min(W * 0.2, H * 0.36), off = document.createElement("canvas"); off.width = W; off.height = H;
        const oc = off.getContext("2d"); oc.fillStyle = "#fff"; oc.textAlign = "center"; oc.textBaseline = "middle";
        oc.font = `700 ${fs}px "Px Grotesk", "Helvetica Neue", Arial, sans-serif`; oc.fillText("ROD-R", W / 2, H / 2);
        const data = oc.getImageData(0, 0, W, H).data, step = W < 700 ? 2 : 2; P = [];
        for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128 && Math.random() < 0.62) P.push({ hx: x, hy: y, x: x + (Math.random() - .5) * 400, y: y + (Math.random() - .5) * 400, vx: 0, vy: 0, k: .05 + Math.random() * .05, s: Math.random() < .85 ? 1.4 : 2.2 });
        }
        hero.querySelector(".hero-sub").style.top = `calc(50% + ${fs * 0.55}px)`;
      };
      (document.fonts ? document.fonts.load('700 100px "Px Grotesk"').catch(() => {}) : Promise.resolve()).then(build);
      addEventListener("resize", () => { clearTimeout(build.t); build.t = setTimeout(build, 200); });
      hero.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (m.on) { m.vx = x - m.x; m.vy = y - m.y; } m.x = x; m.y = y; m.on = true; m.nx = x / W - .5; m.ny = y / H - .5; });
      hero.addEventListener("pointerleave", () => { m.on = false; m.x = m.y = -9999; m.nx = m.ny = 0; });
      new IntersectionObserver(es => visible = es[0].isIntersecting).observe(hero);
      const frame = () => {
        if (visible) {
          par.x += (m.nx - par.x) * .06; par.y += (m.ny - par.y) * .06;
          box.style.transform = `translate(calc(-50% + ${par.x * -24}px), calc(-50% + ${par.y * -16}px))`;
          const ox = par.x * 46, oy = par.y * 30;   // title moves the other way: depth
          cx.clearRect(0, 0, W, H);
          const R = Math.min(W, H) * .16, R2 = R * R, ms = Math.min(Math.hypot(m.vx, m.vy), 60);
          for (const p of P) {
            p.vx += (p.hx + ox - p.x) * p.k; p.vy += (p.hy + oy - p.y) * p.k;
            if (m.on) { const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy; if (d2 < R2) { const dd = Math.sqrt(d2) || 1, f = 1 - dd / R, f2 = f * f * (2.6 + ms * .12); p.vx += dx / dd * f2 - dy / dd * f2 * .6; p.vy += dy / dd * f2 + dx / dd * f2 * .6; } }
            p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
            const v = Math.hypot(p.vx, p.vy);
            cx.fillStyle = v > 4 ? "rgba(225,37,27,.95)" : "rgba(239,238,233,.95)";
            cx.fillRect(p.x, p.y, p.s, p.s);
          }
          m.vx *= .8; m.vy *= .8;
        }
        requestAnimationFrame(frame);
      };
      frame();
    } else if (qs.get("hero") === "photo") {
      // TEST: live photo rebuilt from interactive grain
      const hero = document.querySelector(".hero"), cv = hero.querySelector("canvas"), cx = cv.getContext("2d");
      hero.classList.add("photo-mode");
      let W = 0, H = 0, P = [], visible = true, tt = 0, shock = null;
      const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, on: false };
      const img = new Image();
      const build = () => {
        const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
        if (!img.naturalWidth) return;
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight), iw = img.naturalWidth * s, ih = img.naturalHeight * s, ox = (W - iw) / 2, oy = (H - ih) / 2;
        const step = W < 700 ? 4 : 3, gw = Math.ceil(W / step), gh = Math.ceil(H / step);
        const off = document.createElement("canvas"); off.width = gw; off.height = gh;
        const oc = off.getContext("2d"); oc.drawImage(img, ox / step, oy / step, iw / step, ih / step);
        const data = oc.getImageData(0, 0, gw, gh).data, max = W < 700 ? 9000 : 26000; P = [];
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
          const i = (y * gw + x) * 4, r = data[i], g = data[i + 1], b = data[i + 2], e = Math.max(r, g, b) / 255;
          if (Math.random() < Math.pow(e, 1.6) * 1.1) {
            const hx = x * step + Math.random() * step, hy = y * step + Math.random() * step;
            P.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, c: `rgb(${Math.min(255, r * 1.8) | 0},${Math.min(255, g * 1.4) | 0},${Math.min(255, b * 1.4) | 0})`, k: 0.03 + Math.random() * 0.04, ph: Math.random() * 6.28, s: Math.random() < 0.9 ? 1.2 : 2 });
          }
        }
        if (P.length > max) { for (let i = P.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [P[i], P[j]] = [P[j], P[i]]; } P.length = max; }
        P.forEach(p => { p.x = p.hx + (Math.random() - 0.5) * W * 0.6; p.y = p.hy + (Math.random() - 0.5) * H * 0.6; });
      };
      img.onload = build; addEventListener("resize", () => { clearTimeout(build.t); build.t = setTimeout(build, 200); });
      const setMouse = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (mouse.on) { mouse.vx = x - mouse.x; mouse.vy = y - mouse.y; } mouse.x = x; mouse.y = y; mouse.on = true; };
      hero.addEventListener("pointermove", setMouse);
      hero.addEventListener("pointerdown", e => { setMouse(e); shock = { x: mouse.x, y: mouse.y, t: 0 }; });
      hero.addEventListener("pointerleave", () => { mouse.on = false; mouse.x = mouse.y = -9999; });
      new IntersectionObserver(es => visible = es[0].isIntersecting).observe(hero);
      const frame = () => {
        if (visible && P.length) {
          tt += 0.016; cx.clearRect(0, 0, W, H);
          const R = Math.min(W, H) * 0.2, R2 = R * R, ms = Math.min(Math.hypot(mouse.vx, mouse.vy), 60);
          if (shock) shock.t += 16;
          for (const p of P) {
            // grain lives on its own: slight shimmer around home position
            const bx = p.hx + Math.sin(tt * 1.7 + p.ph) * 0.9, by = p.hy + Math.cos(tt * 1.3 + p.ph) * 0.9;
            p.vx += (bx - p.x) * p.k; p.vy += (by - p.y) * p.k;
            if (mouse.on) { const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy; if (d2 < R2) { const d = Math.sqrt(d2) || 1, f = 1 - d / R, f2 = f * f * (2.4 + ms * 0.1); p.vx += dx / d * f2 - dy / d * f2 * 0.7; p.vy += dy / d * f2 + dx / d * f2 * 0.7; } }
            if (shock) { const dx = p.x - shock.x, dy = p.y - shock.y, d = Math.hypot(dx, dy) || 1, band = Math.abs(d - shock.t); if (band < 50) { const f = (1 - band / 50) * 7; p.vx += dx / d * f; p.vy += dy / d * f; } }
            p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
            const v = Math.hypot(p.vx, p.vy);
            cx.fillStyle = v > 3 ? "#efeee9" : p.c; cx.globalAlpha = v > 3 ? Math.min(1, 0.4 + v / 12) : 1;
            cx.fillRect(p.x, p.y, p.s, p.s);
          }
          cx.globalAlpha = 1;
          if (shock && shock.t > Math.max(W, H) * 1.2) shock = null;
          mouse.vx *= 0.82; mouse.vy *= 0.82;
        }
        requestAnimationFrame(frame);
      };
      frame();
      img.src = "/images/live-red-screen.jpg";
    } else {
    // hero: a black hole at the centre emitting grain, disturbed by the pointer
    const hero = document.querySelector(".hero"), cv = hero.querySelector("canvas"), cx = cv.getContext("2d");
    const title = hero.querySelector(".hero-title"), sub = hero.querySelector(".hero-sub");
    const PORTAL = qs.get("hero") === "portal";
    let pv = null, prog = 0, R0base = 100;
    if (PORTAL) {
      // TEST: the black hole is a window onto the live; scrolling opens it to full screen
      hero.classList.add("portal");
      const stage = document.createElement("div"); stage.className = "portal-stage";
      const id = ytId((videos[0] || {}).youtube) || "SXqtCKVxDpY";
      pv = document.createElement("div"); pv.className = "portal-video";
      pv.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&start=20" allow="autoplay; encrypted-media" title="ROD-R live" tabindex="-1"></iframe>`;
      stage.append(pv, cv, title, sub); hero.prepend(stage);
      const hint = document.createElement("p"); hint.className = "portal-hint"; hint.textContent = LANG === "fr" ? "Entrer dans le live ↓" : "Enter the live ↓"; stage.appendChild(hint);
      setTimeout(() => pv.classList.add("on"), 2600);
      const onScroll = () => { const r = hero.getBoundingClientRect(), span = hero.offsetHeight - innerHeight; prog = Math.min(Math.max(-r.top / span, 0), 1); };
      addEventListener("scroll", onScroll, { passive: true }); onScroll();
      hero.addEventListener("click", () => { if (prog < 0.95) scrollTo({ top: hero.offsetTop + hero.offsetHeight - innerHeight, behavior: "smooth" }); });
    }
    let W = 0, H = 0, CX = 0, CY = 0, R0 = 100, P = [], visible = true, tt = 0, surge = 0, nextSurge = 4;
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, on: false };
    const N = () => (innerWidth < 700 ? 7000 : 17000);
    const spawn = (p, fresh) => {
      const a = Math.random() * Math.PI * 2, r = R0 * (1 + Math.random() * 0.04);
      p.x = CX + Math.cos(a) * r; p.y = CY + Math.sin(a) * r;
      p.rim = Math.random() < 0.42;                     // slow grains keep the rim sharp
      const out = p.rim ? 0.1 + Math.random() * 0.35 : 5 + Math.random() * 7;   // others burst out fast
      const da = a + (Math.random() - 0.5) * (p.rim ? 1.2 : 0.75);   // random spread in direction
      p.vx = Math.cos(da) * out; p.vy = Math.sin(da) * out;
      // irregular outer edge: slow angular modulation + per-grain randomness, so the halo is never a perfect circle
      const lobe = 1 + 0.32 * Math.sin(3 * a + tt * 0.4) + 0.18 * Math.sin(7 * a - tt * 0.9) + 0.1 * Math.sin(13 * a + tt * 1.7);
      // lifetime in frames (random), so grains fade out at scattered distances instead of on a circle
      p.age = 0; p.ttl = p.rim ? 14 + Math.random() * 46 : 3 + Math.pow(Math.random(), 1.4) * 34 * lobe * (0.35 + Math.random() * 1.3);
      p.max = p.rim ? R0 * (1.03 + Math.random() * 0.25) : Infinity;   // no outer distance cap: grains fade by lifetime only
      p.drag = p.rim ? 0.94 : 0.86 + Math.random() * 0.1;   // varied friction -> grains stop at different distances
      p.s = Math.random() < 0.9 ? 1 : 1.7; p.red = Math.random() < 0.03; p.spin = (Math.random() < 0.5 ? 1 : 1) * (0.6 + Math.random() * 0.8);
      if (fresh) { p.age = Math.random() * p.ttl; const rr = R0 * (1 + Math.random() * 0.12); p.x = CX + Math.cos(a) * rr; p.y = CY + Math.sin(a) * rr; }
      return p;
    };
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
      CX = W / 2; CY = H / 2; R0 = R0base = Math.min(W, H) * (W < 700 ? 0.4 : 0.34);
      title.style.fontSize = Math.round(R0base * 0.95) + "px";
      P = Array.from({ length: N() }, () => spawn({}, true));
    };
    size(); addEventListener("resize", () => { clearTimeout(size.t); size.t = setTimeout(size, 200); });
    // red glyphs flickering very fast at the centre of the hole
    const GL = "ROD-R0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@*+=/<>?!", gEl = title.querySelector(".glyph");
    if (gEl && !reduce && false) setInterval(() => { gEl.textContent = GL[(Math.random() * GL.length) | 0]; }, 45);
    const setMouse = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (mouse.on) { mouse.vx = x - mouse.x; mouse.vy = y - mouse.y; } mouse.x = x; mouse.y = y; mouse.on = true; };
    hero.addEventListener("pointermove", setMouse);
    hero.addEventListener("pointerdown", e => { setMouse(e); surge = 1; });
    hero.addEventListener("pointerleave", () => { mouse.on = false; mouse.x = mouse.y = -9999; });
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(hero);
    const frame = () => {
      if (visible) {
        tt += 1 / 60; if (tt > nextSurge) { surge = 0.7; nextSurge = tt + 4 + Math.random() * 5; }  // spontaneous energy pulses
        surge *= 0.965;
        let fade = 1;
        if (PORTAL) {
          const e = prog < .5 ? 4 * prog ** 3 : 1 - (-2 * prog + 2) ** 3 / 2;           // ease in-out
          R0 = R0base + (Math.hypot(W, H) / 2 + 40 - R0base) * e; fade = 1 - e;
          pv.style.clipPath = `circle(${R0}px at 50% 50%)`; pv.style.opacity = pv.classList.contains("on") ? 0.45 + 0.55 * e : 0;
          title.style.opacity = sub.style.opacity = Math.max(0, 1 - e * 2.5);
          hero.querySelector(".portal-hint").style.opacity = Math.max(0, 1 - e * 4);
        }
        cx.save(); cx.globalCompositeOperation = "destination-out"; cx.fillStyle = "rgba(0,0,0,0.42)"; cx.fillRect(0, 0, W, H); cx.restore();   // short trails, fading to transparent
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
          p.vx *= p.drag || 0.94; p.vy *= p.drag || 0.94; p.x += p.vx; p.y += p.vy;
          const nd = Math.hypot(p.x - CX, p.y - CY);
          p.age++; p.vx += (Math.random() - 0.5) * 0.5; p.vy += (Math.random() - 0.5) * 0.5;   // jitter
          if (p.age > p.ttl || nd > p.max || nd < R0 * 0.92 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) { spawn(p); continue; }
          const life = Math.pow(1 - p.age / p.ttl, 0.8);
          const v = Math.min(Math.hypot(p.vx, p.vy) / 11, 1);
          cx.fillStyle = p.red || v > 0.7 ? `rgba(225,37,27,${(0.5 + life * 0.5) * fade})` : `rgba(239,238,233,${(0.15 + life * 0.85) * fade})`;
          cx.fillRect(p.x, p.y, p.s, p.s);
        }
        if (PORTAL) { cx.save(); cx.globalCompositeOperation = "destination-out"; cx.beginPath(); cx.arc(CX, CY, R0 * 0.985, 0, Math.PI * 2); cx.fill(); cx.restore(); }   // window onto the live
        else { cx.fillStyle = "#0a0a0a"; cx.beginPath(); cx.arc(CX, CY, R0 * 0.985, 0, Math.PI * 2); cx.fill(); }   // the black hole
        mouse.vx *= 0.85; mouse.vy *= 0.85;
      }
      requestAnimationFrame(frame);
    };
    if (reduce) { cx.fillStyle = "#0a0a0a"; cx.fillRect(0, 0, W, H); P.forEach(p => { cx.fillStyle = `rgba(239,238,233,.6)`; cx.fillRect(p.x, p.y, p.s, p.s); }); cx.beginPath(); cx.arc(CX, CY, R0, 0, Math.PI * 2); cx.fill(); }
    else frame();
    }
  })();
})();
