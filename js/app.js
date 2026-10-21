/* NOVA TV - logique : navigation spatiale, écrans, lecteur, préférences. JS natif, sans dépendance. */
(() => {
  const N = window.NOVA, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ACC = { Ambre: '#FFB547', Turquoise: '#35E0C2', Violet: '#A596FF', Rose: '#FF7AAE' };
  const SIZES = [['Normale', 1], ['Grande', 1.12], ['Très grande', 1.25]];
  let P = { accent: 'Ambre', size: 0, motion: 1, h24: 1, vol: 0.8 };
  try { Object.assign(P, JSON.parse(localStorage.getItem('nova-prefs') || '{}')); } catch (e) {}
  try { if (!localStorage.getItem('nova-prefs') && (navigator.hardwareConcurrency || 4) <= 2) P.motion = 0; } catch (e) {}
  const save = () => { try { localStorage.setItem('nova-prefs', JSON.stringify(P)); } catch (e) {} };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function apply() {
    const r = document.documentElement.style;
    r.setProperty('--accent', ACC[P.accent]);
    r.fontSize = `calc(min(100vw/96,100vh/54)*${SIZES[P.size][1]})`;
    document.body.classList.toggle('calm', !P.motion);
  }
  const put = (el, t) => { if (el.textContent !== t) el.textContent = t; };
  function tick() {
    const d = new Date(), h = d.getHours();
    put($('#time'), d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: !P.h24 }));
    put($('#date'), cap(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })));
    put($('#hello'), (h < 5 || h >= 18 ? 'Bonsoir' : h < 12 ? 'Bonjour' : 'Bon après-midi') + ', bienvenue sur NOVA TV');
  }
  function net() {
    const on = navigator.onLine, p = $('#net');
    p.className = 'pill ' + (on ? 'on' : 'off');
    p.textContent = on ? 'En ligne' : 'Hors ligne : mode démo';
  }
  let toastT;
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3800); }

  const hist = ['home'], R = {};
  let cur = 'home', local = [];
  function go(id, push = true) {
    $$('.screen').forEach(s => s.hidden = s.id !== id);
    if (push && hist[hist.length - 1] !== id) hist.push(id);
    cur = id;
    $('#top').classList.toggle('mini', id !== 'home');
    document.body.classList.toggle('sub', id !== 'home');
    (id === 'youtube' || id === 'spotify' || id === 'media') && readLib();
    R[id] && R[id]();
    focusAt(0);
  }
  function back() {
    if (!$('#emb').hidden) return closeEmbed();
    if (!$('#player').hidden) return closePlayer();
    if (hist.length > 1) { hist.pop(); go(hist[hist.length - 1], false); }
  }
  const items = () => $$('[data-f]', $('#' + cur)).filter(e => e.offsetParent);
  function focusAt(i) { const l = items(); const x = l[Math.min(i, l.length - 1)]; x && x.focus(); }

  R.home = () => {
    const s = $('#shelf');
    if (s.children.length) return;
    s.innerHTML = N.apps.map(a => `<button class="card" data-f data-id="${a.id}" style="--c:${a.c}"><span class="ico"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${a.icon}</svg></span><span class="lbl">${a.name}</span><small>${a.d}</small></button>`).join('');
  };
  function openApp(a) {
    if (a.screen) return go(a.screen);
    if (a.web) return openEmbed('web', a.web, a.name);
    if (!navigator.onLine) { toast(a.name + ' nécessite Internet : affichage des contenus de démonstration'); return go('media'); }
    return launchApp(a);
  }
  /* Lancement d'une vraie application : liste fixe définie dans data.js (launch), jamais une adresse libre. */
  async function launchApp(a) {
    if (window.top !== window.self) return toast('Aperçu intégré : le lancement d’applications y est bloqué. Ouvre NOVA TV dans un vrai navigateur.');
    const L = a.launch || {}, ua = navigator.userAgent;
    if (window.NOVA_SHELL && window.NOVA_SHELL.launch) {
      if (await window.NOVA_SHELL.launch(a.id).catch(() => false)) return toast('Lancement de l’application ' + a.name + '…');
    } else {
      let uri = null;
      if (/Android|AFT|Silk/i.test(ua) && L.pkg) uri = `intent://${L.host}#Intent;scheme=https;package=${/AFT|Silk/i.test(ua) && L.pkgFire ? L.pkgFire : L.pkg};end`;
      else if (/Windows|Macintosh/i.test(ua) && L.win) uri = L.win;
      if (uri) { toast('Lancement de l’application ' + a.name + '…'); return void (location.href = uri); }
    }
    if (a.url) { toast('Aucune application ' + a.name + ' détectée ici : ouverture du site à la place'); return void setTimeout(() => { location.href = a.url; }, 1500); }
    toast('Aucune application ' + a.name + ' ne peut être lancée depuis cet appareil : installe-la, ou utilise le lecteur intégré');
  }
  const poster = (t, s, g, attrs, badge) => `<button class="poster" data-f ${attrs} style="--g1:${g[0]};--g2:${g[1]}"><b>${esc(t)}</b><small>${esc(s)}</small>${badge ? '<i>Démo</i>' : ''}</button>`;
  R.media = () => {
    const L = links().media, v = view;
    $('#media').innerHTML = `<h1>Médias</h1>
      <h3>Importer</h3><div class="row">
      <button class="poster" data-f data-imp="dir" style="--g1:#334155;--g2:#0f172a"><b>Importer un dossier</b><small>Clé USB, disque, dossier</small></button>
      <button class="poster" data-f data-imp="files" style="--g1:#334155;--g2:#0f172a"><b>Importer des fichiers</b><small>Vidéos, musiques, photos</small></button></div>
      <h3>Ma bibliothèque</h3><div class="row">${L.length ? L.map((c, i) => poster(c.name, c.files.length + ' fichier(s)' + (c.kind === 'dir' ? ', dossier' : ''), ['#1d4ed8', '#312e81'], `data-m="${i}"`)).join('') : '<p class="empty">Rien d’importé pour l’instant. Les fichiers restent sur ton appareil ; la liste est enregistrée dans le fichier JSON choisi dans Paramètres.</p>'}</div>
      ${v ? `<h3>${esc(v.name)}</h3><div class="row">${v.items.map((f, i) => poster(f.name, f.type + (f.h || f.file ? '' : ', à relier'), ['#0f766e', '#1e3a8a'], `data-mf="${i}"`)).join('')}</div>` : ''}
      <h3>Démonstration</h3><div class="row">${N.demo.map((d, i) => poster(d.t, d.s, d.g, `data-d="${i}"`, 1)).join('')}</div>
      <p class="note">Suppr retire une collection de la bibliothèque (tes fichiers ne sont pas supprimés).</p>`;
  };
  R.browser = () => {
    $('#browser').innerHTML = `<h1>Navigateur</h1><h3>Sites favoris, ouverts dans cet onglet</h3>
      <div class="row">${N.sites.map((s, i) => poster(s.n, s.u.replace(/^https?:\/\//, ''), [s.c, '#0f172a'], `data-s="${i}"`)).join('')}
      <button class="poster" data-f data-url style="--g1:#334155;--g2:#0f172a"><b>Saisir une adresse</b><small>Clavier à l’écran ou du PC</small></button></div>`;
  };
  R.settings = () => {
    const rows = [['Couleur d’accent', P.accent, 'accent'], ['Taille du texte', SIZES[P.size][0], 'size'], ['Animations', P.motion ? 'Activées' : 'Réduites', 'motion'], ['Format de l’heure', P.h24 ? '24 h' : '12 h', 'h24'], ['Fichier bibliothèque : créer', fh ? fh.name : 'Aucun', 'libnew'], ['Fichier bibliothèque : charger', '', 'libload'], ['Réinitialiser les réglages', '', 'reset'], ['Tout réinitialiser (bibliothèque, médias, JSON)', '', 'resetall']];
    $('#settings').innerHTML = `<h1>Paramètres</h1><div class="list">${rows.map(r => `<button class="rowbtn" data-f data-k="${r[2]}"><span>${r[0]}</span><span>${r[1]}</span></button>`).join('')}</div>
      <p class="note">NOVA TV ${N.version}. Les réglages sont mémorisés dans ce navigateur. Réseau : ${navigator.onLine ? 'connecté' : 'hors ligne'}.</p>`;
  };
  let confirmReset = 0;
  function setting(k, idx) {
    if (k === 'resetall') {
      if (!confirmReset) { confirmReset = 1; setTimeout(() => { confirmReset = 0; }, 5000); return toast('Appuie encore sur Entrée dans les 5 s pour tout réinitialiser : bibliothèque, médias, liens, réglages et fichier JSON lié'); }
      confirmReset = 0; return resetAll();
    }
    if (k === 'libnew') return libCreate();
    if (k === 'libload') return libLoad();
    const keys = Object.keys(ACC);
    if (k === 'accent') P.accent = keys[(keys.indexOf(P.accent) + 1) % keys.length];
    if (k === 'size') P.size = (P.size + 1) % SIZES.length;
    if (k === 'motion') P.motion = P.motion ? 0 : 1;
    if (k === 'h24') P.h24 = P.h24 ? 0 : 1;
    if (k === 'reset') P = { accent: 'Ambre', size: 0, motion: 1, h24: 1, vol: 0.8 };
    save(); apply(); tick(); R.settings(); focusAt(idx);
  }

  /* ---------- YouTube et Spotify : lecteurs officiels intégrés ---------- */
  /* ---------- bibliothèque : liens et médias enregistrés, fichier JSON sur le PC ---------- */
  const emptyLib = () => ({ app: 'NOVA TV', version: 1, yt: [], sp: [], media: [] });
  let LIB = null, fh = null, asked = 0;
  const norm = j => { j.media = (j.media || []).filter(m => m && m.id && Array.isArray(m.files)); return j; };
  const links = () => LIB || (LIB = (() => { try { return norm(Object.assign(emptyLib(), JSON.parse(localStorage.getItem('nova-links')))); } catch (e) { return emptyLib(); } })());
  const idb = (mode, fn) => new Promise((ok, ko) => { const r = indexedDB.open('nova', 1); r.onupgradeneeded = () => r.result.createObjectStore('k'); r.onerror = ko; r.onsuccess = () => { const t = r.result.transaction('k', mode), q = fn(t.objectStore('k')); t.oncomplete = () => { r.result.close(); ok(q && q.result); }; t.onerror = ko; }; });
  const JT = [{ description: 'Bibliothèque NOVA TV', accept: { 'application/json': ['.json'] } }];
  const perm = async m => (await fh.queryPermission({ mode: m })) === 'granted';
  async function persistLib() {
    const txt = JSON.stringify(links(), null, 2);
    try { if (fh && await perm('readwrite')) { const w = await fh.createWritable(); await w.write(txt); await w.close(); return toast('Bibliothèque enregistrée dans ' + fh.name); } } catch (e) {}
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = 'nova-tv-bibliotheque.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('Fichier nova-tv-bibliotheque.json téléchargé : il contient tes liens et médias enregistrés');
  }
  const saveLinks = L => { LIB = L; try { localStorage.setItem('nova-links', JSON.stringify(L)); } catch (e) {} persistLib(); };
  function applyLib(txt) {
    try {
      const j = norm(Object.assign(emptyLib(), JSON.parse(txt.trim() || '{}')));
      if (JSON.stringify(j) === JSON.stringify(links())) return;
      LIB = j; try { localStorage.setItem('nova-links', JSON.stringify(j)); } catch (e) {}
      if (view && !j.media.some(m => m.id === view.id)) view = null;
      if (R[cur]) { R[cur](); document.activeElement === document.body && focusAt(0); }
      toast('Bibliothèque chargée depuis le fichier');
    } catch (e) { toast('Fichier bibliothèque non valide'); }
  }
  async function readLib() { try { if (fh && await perm('read')) applyLib(await (await fh.getFile()).text()); } catch (e) { if (e && e.name === 'NotFoundError') toast('Fichier bibliothèque introuvable : choisis-le à nouveau dans Paramètres'); } }
  async function libCreate() {
    if (!window.showSaveFilePicker) return toast('Ce navigateur ne peut pas écrire dans un fichier : il en télécharge un à chaque enregistrement');
    try { fh = await showSaveFilePicker({ suggestedName: 'nova-tv-bibliotheque.json', types: JT }); idb('readwrite', s => s.put(fh, 'fh')); await persistLib(); R.settings(); focusAt(0); } catch (e) {}
  }
  async function resetAll() {
    try { if (fh && await perm('readwrite')) { const w = await fh.createWritable(); await w.write(JSON.stringify(emptyLib(), null, 2)); await w.close(); } } catch (e) {}
    try { localStorage.removeItem('nova-links'); localStorage.removeItem('nova-prefs'); } catch (e) {}
    try { await idb('readwrite', s => s.clear()); } catch (e) {}
    LIB = null; fh = null; view = null; P = { accent: 'Ambre', size: 0, motion: 1, h24: 1, vol: 0.8 };
    apply(); tick(); R.settings(); focusAt(0);
    toast('NOVA TV réinitialisée : bibliothèque, liens, médias, réglages et fichier JSON lié vidés');
  }
  async function libLoad() {
    try {
      if (window.showOpenFilePicker) { [fh] = await showOpenFilePicker({ types: JT }); idb('readwrite', s => s.put(fh, 'fh')); await fh.requestPermission({ mode: 'readwrite' }); await readLib(); R.settings(); focusAt(0); }
      else { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = async () => applyLib(await i.files[0].text()); i.click(); }
    } catch (e) {}
  }
  const ytList = () => N.youtube.concat(links().yt), spList = () => N.spotify.concat(links().sp);
  function ytEmbed(u) {
    const v = (u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1], l = (u.match(/[?&]list=([\w-]+)/) || [])[1];
    if (!v && !l) return null;
    return 'https://www.youtube.com/embed/' + (v || 'videoseries') + '?' + (l ? 'list=' + l + '&' : '') + 'autoplay=1&enablejsapi=1&rel=0&playsinline=1&vq=hd1080' + (/^https?:/.test(location.protocol) ? '&origin=' + location.origin : '');
  }
  const spUri = u => { const m = u.match(/spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist|episode|show)\/(\w+)/); return m ? `${m[1]}/${m[2]}` : null; };
  const vid = u => (u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
  let ytRes = [], ytTitle = '', ytLoaded = false;
  async function ytApi(path, title) {
    try {
      const j = await (await fetch('https://www.googleapis.com/youtube/v3/' + path + '&key=' + N.ytApiKey)).json();
      ytRes = (j.items || []).map(i => ({ n: i.snippet.title, u: 'https://www.youtube.com/watch?v=' + (i.id.videoId || i.id) }));
      ytTitle = title;
      if (cur === 'youtube') { R.youtube(); if (document.activeElement === document.body) focusAt(0); }
    } catch (e) { toast('YouTube : chargement impossible (réseau ou clé)'); }
  }
  function ytSearch() { const q = prompt('Rechercher sur YouTube :'); if (q) ytApi('search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' + encodeURIComponent(q), 'Résultats pour ' + q); }
  const ytCard = (l, attr) => { const v = vid(l.u); return `<button class="poster thumb" data-f ${attr} style="background-image:linear-gradient(transparent 35%,#000d),${v ? `url(https://i.ytimg.com/vi/${v}/hqdefault.jpg),` : ''}linear-gradient(135deg,#7f1d1d,#0f172a)"><b>${esc(l.n)}</b>${l.t ? `<small>${esc(l.t)}</small>` : ''}</button>`; };
  R.youtube = () => {
    if (N.ytApiKey && !ytLoaded && navigator.onLine) { ytLoaded = true; ytApi('videos?part=snippet&chart=mostPopular&regionCode=FR&maxResults=12', 'Tendances en France'); }
    $('#youtube').innerHTML = `<h1>YouTube</h1>
      ${ytRes.length ? `<h3>${esc(ytTitle)}</h3><div class="row">${ytRes.map((l, i) => ytCard(l, `data-yr="${i}"`)).join('')}</div>` : ''}
      <h3>Sélection</h3><div class="row">${ytList().map((l, i) => ytCard(l, `data-yt="${i}"`)).join('')}
      <button class="poster" data-f data-add="yt" style="--g1:#334155;--g2:#0f172a"><b>Ajouter un lien</b><small>Colle l’adresse d’une vidéo</small></button>
      <button class="poster" data-f data-launch="youtube" style="--g1:#7f1d1d;--g2:#0f172a"><b>Lancer l’appli</b><small>Application YouTube</small></button>
      ${N.ytApiKey ? '<button class="poster" data-f data-add="ytq" style="--g1:#7f1d1d;--g2:#0f172a"><b>Rechercher</b><small>Dans NOVA TV</small></button>' : ''}
      ${window.NOVA_SHELL ? '<button class="poster" data-f data-web="https://www.youtube.com/tv" style="--g1:#7f1d1d;--g2:#0f172a"><b>YouTube TV</b><small>Vrai site (Shell protégé)</small></button><button class="poster" data-f data-web="https://www.youtube.com" style="--g1:#7f1d1d;--g2:#0f172a"><b>YouTube classique</b><small>Si le mode TV échoue</small></button><button class="poster" data-f data-web="https://www.youtube.com/account" style="--g1:#1e3a8a;--g2:#0f172a"><b>Mon compte</b><small>Compte et connexion YouTube</small></button>' : ''}</div>
      <p class="note">${N.ytApiKey ? '' : 'Pour les tendances et la recherche ici, ajoute une clé gratuite YouTube Data API dans js/data.js (ytApiKey). '}Suppr efface un lien ajouté.${window.NOVA_SHELL ? '' : ' Le vrai site YouTube n’est proposé que dans NOVA TV Shell (sandbox).'}</p>`;
  };
  R.spotify = () => {
    $('#spotify').innerHTML = `<h1>Spotify</h1><h3>Lecteur officiel intégré : playlists, albums, titres</h3><div class="row">
      ${spList().map((l, i) => poster(l.n, 'Spotify', ['#15803d', '#0f172a'], `data-sp="${i}"`)).join('')}
      <button class="poster" data-f data-add="sp" style="--g1:#334155;--g2:#0f172a"><b>Ajouter un lien</b><small>Playlist, album ou titre</small></button>
      <button class="poster" data-f data-launch="spotify" style="--g1:#14532d;--g2:#0f172a"><b>Lancer l’appli</b><small>Application Spotify</small></button>
      <button class="poster" data-f data-back style="--g1:#334155;--g2:#0f172a"><b>← Retour</b><small>Accueil</small></button></div>
      <p class="note">Sans compte connecté dans ce navigateur, Spotify ne joue que des extraits.</p>`;
  };
  function addLink(k) {
    const u = prompt(k === 'yt' ? 'Lien YouTube (vidéo ou playlist) :' : 'Lien Spotify (playlist, album, titre) :', 'https://');
    if (!u) return;
    if (!(k === 'yt' ? ytEmbed(u) : spUri(u))) return toast('Lien non reconnu');
    const L = links(); L[k].push({ n: prompt('Nom à afficher :', 'Mon lien') || 'Mon lien', u });
    saveLinks(L); R[cur](); focusAt(0);
  }
  let emb = null, ytOn = true, embPrev = null, idleT, qSet = 0;
  const wake = el => { el.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => el.classList.add('idle'), 5000); };
  const SB = 'sandbox="allow-scripts allow-same-origin allow-presentation"', SBW = 'sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"';
  const embCmd = (msg, origin) => { const i = $('#emb iframe'); i && i.contentWindow.postMessage(msg, origin); };
  const ytMsg = (f, a) => JSON.stringify({ event: 'command', func: f, args: a || [] });
  const HINT = { yt: 'Entrée : pause   Gauche et droite : vidéo précédente ou suivante   F : plein écran   Page↑ / Page↓ : volume   Échap : fermer', sp: 'Entrée : lecture ou pause   Échap : fermer   Volume : celui de l’appareil', web: 'Si la page reste vide, le site refuse l’intégration.   Tab : entrer dans le site   Échap : fermer' };
  function openEmbed(kind, src, title) {
    if (kind === 'web') {
      if (!navigator.onLine) return toast(title + ' nécessite Internet');
      if (!window.NOVA_SHELL) toast(title + ' interdit l’intégration dans une page : ouverture du vrai site dans cet onglet (Alt + ← pour revenir)');
      return void setTimeout(() => { location.href = src; }, window.NOVA_SHELL ? 0 : 1200);
    }
    if (!navigator.onLine) return toast(title + ' nécessite Internet');
    if (!/^https?:/.test(location.protocol)) return toast('Les lecteurs intégrés demandent un serveur : lance « py -m http.server 8080 » ou héberge sur Vercel');
    embPrev = document.activeElement; embPrev && embPrev.blur(); window.focus();
    emb = kind; ytOn = true; qSet = 0; const E = $('#emb'), f = $('.frame', E);
    E.className = kind; $('h2', E).textContent = title; E.hidden = false; $('p', E).textContent = HINT[kind];
    f.innerHTML = kind === 'yt' ? `<iframe ${SB} src="${src}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`
      : kind === 'sp' ? `<iframe ${SB} src="https://open.spotify.com/embed/${src}?theme=0" allow="autoplay; encrypted-media; clipboard-write" style="max-width:70rem;height:352px"></iframe>`
      : `<iframe ${SBW} src="${src}" allow="autoplay; encrypted-media; fullscreen; clipboard-write" allowfullscreen></iframe>`;
    if (kind === 'yt') { const i = $('iframe', f); i.onload = () => i.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); }
    wake(E);
  }
  function closeEmbed() {
    clearTimeout(idleT); $('#emb').hidden = true; $('#emb .frame').innerHTML = ''; emb = null;
    embPrev ? embPrev.focus() : focusAt(0);
  }
  function embKey(e) {
    wake($('#emb'));
    if (e.key === 'Escape') return closeEmbed();
    if (emb === 'web') return;
    if (e.key === 'Backspace') return closeEmbed();
    if (e.key === 'Enter' || e.key === ' ') {
      if (emb === 'yt') { embCmd(ytMsg(ytOn ? 'pauseVideo' : 'playVideo'), '*'); ytOn = !ytOn; }
      else embCmd({ command: 'toggle' }, 'https://open.spotify.com');
    }
    if (emb === 'yt' && e.key === 'ArrowRight') embCmd(ytMsg('nextVideo'), '*');
    if (emb === 'yt' && e.key === 'ArrowLeft') embCmd(ytMsg('previousVideo'), '*');
    if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  }
  addEventListener('message', e => {
    if (!/youtube\.com$/.test(e.origin)) return;
    try {
      const d = JSON.parse(e.data);
      if (d.event === 'onError') toast('YouTube refuse cette lecture intégrée (code ' + d.info + ') : essaie une autre vidéo, ou le vrai site');
      const s = d.info.playerState;
      if (s !== undefined) ytOn = s === 1 || s === 3;
      if (s === 1 && !qSet) { qSet = 1; embCmd(ytMsg('setPlaybackQuality', ['hd1080']), '*'); embCmd(ytMsg('setVolume', [Math.round(P.vol * 100)]), '*'); }
    } catch (x) {}
  });

  let media = null, demoT = null, paused = false, prevFocus = null, url = null;
  function openPlayer(title, o) {
    prevFocus = document.activeElement; prevFocus && prevFocus.blur();
    const pv = $('.pv'), bar = $('.trk i'); pv.innerHTML = ''; bar.style.width = '0'; paused = false;
    $('#player h2').textContent = title; $('#player').hidden = false; wake($('#player'));
    if (o.file) {
      url = URL.createObjectURL(o.file); const t = o.kind || o.file.type.split('/')[0];
      if (t === 'image') pv.innerHTML = `<img src="${url}" alt="">`;
      else {
        if (t === 'audio') pv.innerHTML = '<div class="demo" style="--g1:#312e81;--g2:#0f172a"><b>♪</b></div>';
        media = document.createElement(t === 'audio' ? 'audio' : 'video'); media.src = url; media.autoplay = true; media.volume = P.vol; pv.appendChild(media);
        media.ontimeupdate = () => bar.style.width = (media.currentTime / (media.duration || 1) * 100) + '%';
      }
      $('#player p').textContent = 'Entrée : pause   Gauche et droite : 10 s   Page↑ / Page↓ : volume   Échap : fermer';
    } else {
      pv.innerHTML = `<div class="demo" style="--g1:${o.g[0]};--g2:${o.g[1]}"><b>${esc(title)}</b><span>Lecture de démonstration : aucun contenu réel</span></div>`;
      let p = 0; demoT = setInterval(() => { if (!paused) { p += .4; bar.style.width = p + '%'; if (p >= 100) closePlayer(); } }, 200);
      $('#player p').textContent = 'Entrée : pause   Échap : fermer';
    }
  }
  function closePlayer() {
    clearInterval(demoT); if (media) { media.pause(); media = null; } if (url) { URL.revokeObjectURL(url); url = null; }
    $('#player').hidden = true; $('.pv').innerHTML = ''; prevFocus ? prevFocus.focus() : focusAt(0);
  }
  function playerKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { paused = !paused; if (media) paused ? media.pause() : media.play(); }
    if (media && e.key === 'ArrowRight') media.currentTime += 10;
    if (media && e.key === 'ArrowLeft') media.currentTime -= 10;
  }

  function move(d) {
    const l = items(), c = document.activeElement;
    if (!l.includes(c)) return focusAt(0);
    const a = c.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bs = 1e9;
    l.forEach(el => {
      if (el === c) return;
      const b = el.getBoundingClientRect(), dx = b.left + b.width / 2 - ax, dy = b.top + b.height / 2 - ay;
      const main = d === 'r' ? dx : d === 'l' ? -dx : d === 'd' ? dy : -dy, side = d === 'l' || d === 'r' ? Math.abs(dy) : Math.abs(dx);
      if (main > 8 && main + side * 2.5 < bs) { bs = main + side * 2.5; best = el; }
    });
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'center', behavior: P.motion ? 'smooth' : 'auto' }); }
  }
  const KEYS = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' };
  let volT;
  function setVol(v) {
    if (emb === 'sp') return toast('Le lecteur Spotify intégré ne permet pas de régler son volume depuis NOVA TV : utilise le volume de l’appareil');
    P.vol = Math.max(0, Math.min(1, Math.round(v * 20) / 20)); save();
    if (media) media.volume = P.vol;
    if (emb === 'yt') embCmd(ytMsg('setVolume', [Math.round(P.vol * 100)]), '*');
    const o = $('#vol'); o.innerHTML = `Volume ${Math.round(P.vol * 100)} %<i><b style="width:${P.vol * 100}%"></b></i>`;
    o.classList.add('show'); clearTimeout(volT); volT = setTimeout(() => o.classList.remove('show'), 1600);
  }
  addEventListener('keydown', e => {
    const dv = { PageUp: 1, PageDown: -1, '+': 1, '-': -1 }[e.key];
    if (dv) { e.preventDefault(); return setVol(P.vol + dv * 0.05); }
    if (!$('#emb').hidden) { if (!(emb === 'web' && e.key === 'Tab')) e.preventDefault(); return embKey(e); }
    if (!$('#player').hidden) {
      wake($('#player'));
      if (e.key === 'Escape' || e.key === 'Backspace') closePlayer(); else playerKey(e);
      return e.preventDefault();
    }
    if (e.key === 'Delete') {
      const D = document.activeElement.dataset || {}, L = links(), nY = N.youtube.length, nS = N.spotify.length;
      if (D.yt >= nY) L.yt.splice(D.yt - nY, 1); else if (D.sp >= nS) L.sp.splice(D.sp - nS, 1);
      else if (D.m !== undefined) { const c = L.media.splice(+D.m, 1)[0]; if (c) idb('readwrite', s => s.delete('h:' + c.id)).catch(() => {}); if (view && c && view.id === c.id) view = null; }
      else return;
      saveLinks(L); R[cur](); focusAt(0);
    } else if (KEYS[e.key]) { e.preventDefault(); move(KEYS[e.key]); }
    else if (['Escape', 'Backspace', 'GoBack', 'BrowserBack'].includes(e.key) || e.keyCode === 461 || e.keyCode === 10009) { e.preventDefault(); back(); }
  });
  document.addEventListener('focusin', e => {
    const c = e.target.style && e.target.style.getPropertyValue('--c');
    if (c) document.documentElement.style.setProperty('--amb', c);
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-f]'); if (!t) return;
    const D = t.dataset;
    if (D.id) openApp(N.apps.find(a => a.id === D.id));
    else if (D.d) openPlayer(N.demo[D.d].t, { g: N.demo[D.d].g });
    else if (D.imp) D.imp === 'dir' ? importDir() : importFiles();
    else if (D.m !== undefined) openColl(+D.m);
    else if (D.mf !== undefined) playItem(+D.mf);
    else if (D.launch) launchApp(N.apps.find(a => a.id === D.launch));
    else if (D.back !== undefined) back();
    else if (D.s) { const s = N.sites[D.s]; navigator.onLine ? (location.href = s.u) : toast(s.n + ' nécessite Internet'); }
    else if (D.url !== undefined) { const u = prompt('Adresse du site :', 'https://'); if (u) location.href = /^https?:/.test(u) ? u : 'https://' + u; }
    else if (D.web) openEmbed('web', D.web, 'YouTube');
    else if (D.yr) { const l = ytRes[D.yr], s = ytEmbed(l.u); s && openEmbed('yt', s, l.n); }
    else if (D.yt) { const l = ytList()[D.yt], s = ytEmbed(l.u); s ? openEmbed('yt', s, l.n) : toast('Lien YouTube non reconnu'); }
    else if (D.sp) { const l = spList()[D.sp], u = spUri(l.u); u ? openEmbed('sp', u, l.n) : toast('Lien Spotify non reconnu'); }
    else if (D.add) D.add === 'ytq' ? ytSearch() : addLink(D.add);
    else if (D.full) location.href = D.full;
    else if (D.k) setting(D.k, items().indexOf(t));
  });
  /* ---------- médias importés : liste dans le JSON, accès aux fichiers mémorisé par le navigateur ---------- */
  let view = null;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
  const MEDIA_RE = /\.(mp4|m4v|webm|mkv|mov|mp3|m4a|aac|wav|ogg|flac|jpe?g|png|gif|webp)$/i;
  const mtype = n => /\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(n) ? 'audio' : /\.(jpe?g|png|gif|webp)$/i.test(n) ? 'image' : 'video';
  const getH = async id => { try { return await idb('readonly', s => s.get('h:' + id)); } catch (e) { return null; } };
  const putH = (id, h) => idb('readwrite', s => s.put(h, 'h:' + id)).catch(() => {});
  const toItem = f => ({ name: f.name, path: f.webkitRelativePath || f.name, type: mtype(f.name), size: f.size, file: f });
  async function scanDir(h, base = '', depth = 0, out = []) {
    for await (const [n, e] of h.entries()) {
      if (e.kind === 'file' && MEDIA_RE.test(n)) { const f = await e.getFile(); out.push({ name: n, path: base + n, type: mtype(n), size: f.size, h: e }); }
      else if (e.kind === 'directory' && depth < 2) await scanDir(e, base + n + '/', depth + 1, out);
    }
    return out;
  }
  function pickInput(dir, cb) {
    const i = document.createElement('input'); i.type = 'file'; i.multiple = true; if (dir) i.setAttribute('webkitdirectory', '');
    i.onchange = () => cb([...i.files].filter(f => MEDIA_RE.test(f.name))); i.click();
  }
  function addColl(meta, items) {
    if (!items.length) return toast('Aucun média trouvé');
    const L = links();
    L.media.push(Object.assign({ added: new Date().toISOString() }, meta, { files: items.map(f => ({ name: f.name, path: f.path, type: f.type, size: f.size })) }));
    view = { id: meta.id, name: meta.name, items }; saveLinks(L); R.media(); focusViewOrTop();
  }
  const focusViewOrTop = () => { const f = $('#media [data-mf]'); f ? f.focus() : focusAt(0); };
  async function importDir() {
    if (!window.showDirectoryPicker) return pickInput(true, fs => addColl({ id: uid(), kind: 'dir', name: ((fs[0] && fs[0].webkitRelativePath) || '').split('/')[0] || 'Dossier' }, fs.map(toItem)));
    try { const h = await showDirectoryPicker({ mode: 'read' }), id = uid(); await putH(id, h); addColl({ id, kind: 'dir', name: h.name }, await scanDir(h)); } catch (e) {}
  }
  async function importFiles() {
    if (!window.showOpenFilePicker) return pickInput(false, fs => addColl({ id: uid(), kind: 'files', name: fs[0].name + (fs.length > 1 ? ' +' + (fs.length - 1) : '') }, fs.map(toItem)));
    try {
      const hs = (await showOpenFilePicker({ multiple: true })).filter(h => MEDIA_RE.test(h.name)), id = uid();
      const items = await Promise.all(hs.map(async h => { const f = await h.getFile(); return { name: h.name, path: h.name, type: mtype(h.name), size: f.size, h }; }));
      if (items.length) await putH(id, hs);
      addColl({ id, kind: 'files', name: items.length ? items[0].name + (items.length > 1 ? ' +' + (items.length - 1) : '') : 'Fichiers' }, items);
    } catch (e) {}
  }
  async function openColl(idx) {
    const c = links().media[idx]; if (!c) return;
    const names = () => c.files.map(f => ({ name: f.name, path: f.path, type: f.type, size: f.size })), hs = await getH(c.id);
    if (!hs) { view = { id: c.id, name: c.name, items: names() }; R.media(); focusViewOrTop(); return toast('Liste retrouvée, mais les fichiers ne sont pas reliés sur cet appareil : appuie sur un fichier pour les relier'); }
    try {
      const probe = c.kind === 'dir' ? hs : hs[0];
      if ((await probe.queryPermission({ mode: 'read' })) !== 'granted' && (await probe.requestPermission({ mode: 'read' })) !== 'granted') throw 0;
      const items = c.kind === 'dir' ? await scanDir(hs) : await Promise.all(hs.map(async h => { const f = await h.getFile(); return { name: h.name, path: h.name, type: mtype(h.name), size: f.size, h }; }));
      view = { id: c.id, name: c.name, items };
    } catch (e) { view = { id: c.id, name: c.name, items: names() }; toast('Dossier déplacé ou accès refusé : appuie sur un fichier pour le relier'); }
    R.media(); focusViewOrTop();
  }
  async function relinkView() {
    const L = links(), idx = L.media.findIndex(m => view && m.id === view.id); if (idx < 0) return;
    const c = L.media[idx];
    try {
      if (c.kind === 'dir' && window.showDirectoryPicker) await putH(c.id, await showDirectoryPicker({ mode: 'read' }));
      else if (window.showOpenFilePicker) await putH(c.id, (await showOpenFilePicker({ multiple: true })).filter(h => MEDIA_RE.test(h.name)));
      else return pickInput(c.kind === 'dir', fs => { view = { id: c.id, name: c.name, items: fs.map(toItem) }; R.media(); focusViewOrTop(); });
      openColl(idx);
    } catch (e) {}
  }
  async function playItem(i) {
    const it = view && view.items[i]; if (!it) return;
    if (!it.file && !it.h) return relinkView();
    try { openPlayer(it.name, { file: it.file || await it.h.getFile(), kind: it.type }); } catch (e) { toast('Fichier introuvable : il a peut-être été déplacé'); }
  }

  $('#embBack').onclick = () => closeEmbed();
  addEventListener('online', net); addEventListener('offline', net);
  idb('readonly', s => s.get('fh')).then(h => { if (h) { fh = h; readLib(); } }).catch(() => {});
  const ask = async () => { if (asked || !fh) return; asked = 1; try { if (!(await perm('readwrite'))) await fh.requestPermission({ mode: 'readwrite' }); readLib(); } catch (e) {} };
  addEventListener('keydown', ask); addEventListener('click', ask);
  apply(); tick(); net(); setInterval(tick, 1000);
  go('home');
})();
