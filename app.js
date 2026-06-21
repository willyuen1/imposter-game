'use strict';

/* =======================================================================
 * Imposter — a pass-the-phone party word game.
 * Everything runs locally in the browser. No server, no network.
 * ===================================================================== */

/* ---------- tiny DOM helper ----------
 * h('div', {class:'x', onclick: fn}, child1, child2, ...)
 * Strings become text nodes (so player names are always inserted safely). */
function h(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  attrs = attrs || {};
  for (const key in attrs) {
    const val = attrs[key];
    if (val == null || val === false) continue;
    if (key === 'class') node.className = val;
    else if (key.slice(0, 2) === 'on') node.addEventListener(key.slice(2).toLowerCase(), val);
    else if (val === true) node.setAttribute(key, '');
    else node.setAttribute(key, val);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    node.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

/* ---------- randomness ---------- */
const randInt = (n) => Math.floor(Math.random() * n);
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- online mode: Firebase Realtime Database (lazy-loaded) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCFFjzNoSf9WPJpy_A6bXzkgfLZL8FFS7A",
  authDomain: "imposter-game-5d657.firebaseapp.com",
  databaseURL: "https://imposter-game-5d657-default-rtdb.firebaseio.com",
  projectId: "imposter-game-5d657",
  storageBucket: "imposter-game-5d657.firebasestorage.app",
  messagingSenderId: "1083150009151",
  appId: "1:1083150009151:web:03d69e3cb16826cd3a498a"
};
let db = null;
let _fbPromise = null;
function ensureFirebase() {
  if (_fbPromise) return _fbPromise;
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.5/';
  const load = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('load failed: ' + src));
    document.head.appendChild(s);
  });
  _fbPromise = load(SDK + 'firebase-app-compat.js')
    .then(() => load(SDK + 'firebase-database-compat.js'))
    .then(() => { firebase.initializeApp(firebaseConfig); db = firebase.database(); return db; });
  return _fbPromise;
}
// stable per-device id so a reload rejoins as the same player (keeps your role)
function clientId() {
  let id = null;
  try { id = localStorage.getItem('imposter.cid'); } catch (e) {}
  if (!id) { id = 'c' + Math.random().toString(36).slice(2, 10); try { localStorage.setItem('imposter.cid', id); } catch (e) {} }
  return id;
}
function makeRoomCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous I L O 0 1
  let s = '';
  for (let i = 0; i < 4; i++) s += A[randInt(A.length)];
  return s;
}

/* ---------- game state ---------- */
const state = {
  screen: 'home',         // 'home' | 'setup' | 'menu' | 'card' | 'order' | 'reveal' | 'online'
  names: ['', '', ''],    // raw text fields on the setup screen
  numImposters: 1,
  players: [],            // [{ name, isImposter, seen }] — kept in entry order
  category: '',
  word: '',
  wordEmoji: '',          // emoji icon for the secret word (insider card)
  wordDef: '',            // short definition of the secret word (insider card)
  clue: '',               // the subtle one-word clue shown to the imposter
  order: [],              // randomised speaking order (array of player indices)
  activeCard: null,       // index of player currently viewing their card
  cardRevealed: false,    // two-step privacy gate on the card screen
  focusLast: false,       // focus the last name field after re-render
  online: { view: 'entry', ready: false, error: false, code: '', name: '', joinCode: '', joinError: '', room: null, sub: null, isHost: false, copied: false }
};

/* ---------- light persistence (remembers your roster) ---------- */
function saveSetup() {
  try {
    localStorage.setItem('imposter.setup', JSON.stringify({
      names: state.names, numImposters: state.numImposters
    }));
  } catch (e) { /* ignore */ }
}
function loadSetup() {
  try {
    const s = JSON.parse(localStorage.getItem('imposter.setup'));
    if (s && Array.isArray(s.names) && s.names.length >= 2) {
      state.names = s.names;
      state.numImposters = s.numImposters || 1;
    }
  } catch (e) { /* ignore */ }
}

/* ---------- helpers ---------- */
const validNames = () => state.names.map((n) => n.trim()).filter(Boolean);

function dealRoles() {
  const names = validNames();

  // pick a random word from across all categories
  const flat = [];
  for (const category in WORD_PACK) {
    for (const item of WORD_PACK[category]) {
      const clues = item.clues || item.related || (item.clue ? [item.clue] : []);
      flat.push({ category, word: item.word, emoji: item.emoji || '', def: item.def || '', clues });
    }
  }
  const pick = flat[randInt(flat.length)];
  state.category = pick.category;
  state.word = pick.word;
  state.wordEmoji = pick.emoji;
  state.wordDef = pick.def;
  // each word has several one-word clues — draw one at random for the imposter
  state.clue = pick.clues[randInt(pick.clues.length)] || '';

  // assign imposters to random positions, but keep players in entry order
  const positions = shuffle(names.map((_, i) => i));
  const imposterSet = new Set(positions.slice(0, state.numImposters));
  state.players = names.map((name, i) => ({
    name, isImposter: imposterSet.has(i), seen: false
  }));

  state.order = [];
  state.activeCard = null;
  state.cardRevealed = false;
}

function pickOrder() {
  // a random permutation of all players: order[0] speaks first, then order[1], ...
  state.order = shuffle(state.players.map((_, i) => i));
}

/* ======================================================================
 * SCREENS
 * ==================================================================== */

function homeScreen() {
  let packTotal = 0;
  for (const c in WORD_PACK) packTotal += WORD_PACK[c].length;
  return h('div', { class: 'screen fade-in' },
    h('div', { class: 'spacer' }),
    h('div', { class: 'center' },
      h('div', { class: 'word-emoji' }, '🕵️'),
      h('h1', { class: 'title', style: 'font-size: 2.6rem; margin-top: 8px;' }, 'Imposter'),
      h('p', { class: 'subtitle' }, 'A party word game. How do you want to play?')
    ),
    h('div', { class: 'spacer' }),
    h('button', { class: 'btn btn-primary', onclick: () => { state.screen = 'setup'; render(); } }, '📱  Pass the phone'),
    h('p', { class: 'note', style: 'margin: -4px 0 8px; text-align: center;' }, 'One device, passed around. Works offline.'),
    h('button', { class: 'btn btn-secondary', onclick: enterOnline }, '🌐  Each on own device'),
    h('p', { class: 'note', style: 'margin: -4px 0 0; text-align: center;' }, 'Everyone joins on their own phone. Needs internet.'),
    h('div', { class: 'spacer' }),
    h('p', { class: 'buildtag' }, packTotal + ' words · ' + Object.keys(WORD_PACK).length + ' categories')
  );
}

function enterOnline() {
  state.screen = 'online';
  render();
  ensureFirebase()
    .then(() => {
      state.online.ready = true;
      if (!state.online.joinCode) { try { const s = localStorage.getItem('imposter.room'); if (s) state.online.joinCode = s; } catch (e) {} }
      render();
    })
    .catch(() => { state.online.error = true; render(); });
}

function subscribeRoom(code) {
  if (state.online.sub) state.online.sub();
  const ref = db.ref('rooms/' + code);
  const cb = ref.on('value', (snap) => {
    state.online.room = snap.val();
    if (state.screen === 'online') render();
  });
  state.online.sub = () => ref.off('value', cb);
}

function createRoom() {
  const name = (state.online.name || '').trim();
  if (!name) { state.online.joinError = 'Enter your name first.'; render(); return; }
  const code = makeRoomCode(), me = clientId(), TS = firebase.database.ServerValue.TIMESTAMP;
  state.online.code = code; state.online.isHost = true; state.online.joinError = '';
  db.ref('rooms/' + code).set({
    host: me, status: 'lobby', numImposters: 1, createdAt: TS,
    players: { [me]: { name: name, joinedAt: TS } }
  }).then(() => {
    db.ref('rooms/' + code + '/players/' + me).onDisconnect().remove();
    try { localStorage.setItem('imposter.room', code); } catch (e) {}
    subscribeRoom(code); render();
  });
}

function joinRoom() {
  const name = (state.online.name || '').trim();
  const code = (state.online.joinCode || '').trim().toUpperCase();
  if (!name) { state.online.joinError = 'Enter your name.'; render(); return; }
  if (code.length < 3) { state.online.joinError = 'Enter the room code.'; render(); return; }
  const me = clientId(), TS = firebase.database.ServerValue.TIMESTAMP;
  db.ref('rooms/' + code).get().then((snap) => {
    if (!snap.exists()) { state.online.joinError = 'No room called "' + code + '".'; render(); return; }
    state.online.code = code; state.online.isHost = (snap.val().host === me); state.online.joinError = '';
    db.ref('rooms/' + code + '/players/' + me).set({ name: name, joinedAt: TS }).then(() => {
      db.ref('rooms/' + code + '/players/' + me).onDisconnect().remove();
      try { localStorage.setItem('imposter.room', code); } catch (e) {}
      subscribeRoom(code); render();
    });
  }).catch(() => { state.online.joinError = 'Could not reach the room.'; render(); });
}

function leaveRoom() {
  const code = state.online.code, me = clientId();
  if (code) { try { db.ref('rooms/' + code + '/players/' + me).remove(); } catch (e) {} }
  if (state.online.sub) state.online.sub();
  try { localStorage.removeItem('imposter.room'); } catch (e) {}
  state.online = { view: 'entry', ready: true, error: false, code: '', name: state.online.name, joinCode: '', joinError: '', room: null, sub: null, isHost: false, copied: false };
  render();
}

function onlineSetImposters(delta) {
  const room = state.online.room; if (!room) return;
  const max = Math.max(1, Object.keys(room.players || {}).length - 1);
  let n = Math.min(Math.max(1, (room.numImposters || 1) + delta), max);
  db.ref('rooms/' + state.online.code + '/numImposters').set(n);
}

function onlineDeal() {
  const room = state.online.room, code = state.online.code;
  const ids = Object.keys(room.players || {});
  if (ids.length < 3) return;
  const flat = [];
  for (const c in WORD_PACK) for (const it of WORD_PACK[c]) {
    flat.push({ category: c, word: it.word, emoji: it.emoji || '', def: it.def || '', clues: it.clues || it.related || (it.clue ? [it.clue] : []) });
  }
  const pick = flat[randInt(flat.length)];
  const clue = pick.clues[randInt(pick.clues.length)] || '';
  const m = Math.min(Math.max(1, room.numImposters || 1), ids.length - 1);
  const impIds = shuffle(ids).slice(0, m);
  const imposters = {}; impIds.forEach((id) => { imposters[id] = true; });
  db.ref('rooms/' + code).update({
    status: 'playing',
    round: { category: pick.category, word: pick.word, emoji: pick.emoji, def: pick.def, clue: clue, imposters: imposters, order: shuffle(ids) }
  });
}

function onlineReveal() { db.ref('rooms/' + state.online.code + '/status').set('revealed'); }
function onlineBackToLobby() { db.ref('rooms/' + state.online.code).update({ status: 'lobby', round: null }); }

function shareRoom() {
  const url = location.origin + location.pathname + '?room=' + state.online.code;
  if (navigator.share) { navigator.share({ title: 'Imposter', text: 'Join my Imposter game (room ' + state.online.code + ')', url: url }).catch(() => {}); return; }
  try { navigator.clipboard.writeText(url); state.online.copied = true; render(); setTimeout(() => { state.online.copied = false; render(); }, 1500); } catch (e) {}
}

function onlineTop(label, onBack) {
  return h('div', { class: 'topbar' },
    h('button', { class: 'btn btn-ghost btn-small', onclick: onBack || (() => { state.screen = 'home'; render(); }) }, '← Back'),
    h('span', { class: 'brand' }, label)
  );
}

function onlineScreen() {
  const o = state.online;
  if (o.error) {
    return h('div', { class: 'screen fade-in' }, onlineTop('Online'),
      h('div', { class: 'spacer' }),
      h('div', { class: 'center' }, h('div', { class: 'big-emoji' }, '📡'), h('p', { class: 'subtitle' }, 'Couldn\'t connect. Online mode needs internet.')),
      h('div', { class: 'spacer' }),
      h('button', { class: 'btn btn-secondary', onclick: () => { o.error = false; render(); ensureFirebase().then(() => { o.ready = true; render(); }).catch(() => { o.error = true; render(); }); } }, 'Try again'));
  }
  if (!o.ready) return h('div', { class: 'screen fade-in' }, onlineTop('Online'), h('div', { class: 'spacer' }), h('p', { class: 'subtitle center' }, 'Connecting…'), h('div', { class: 'spacer' }));
  if (o.code && !o.room) return h('div', { class: 'screen fade-in' }, onlineTop('Joining…'), h('div', { class: 'spacer' }), h('p', { class: 'subtitle center' }, 'Joining room…'), h('div', { class: 'spacer' }));
  if (!o.code) return onlineEntryScreen();
  const st = o.room.status;
  if (st === 'playing') return onlinePlayScreen();
  if (st === 'revealed') return onlineRevealScreen();
  return onlineLobbyScreen();
}

function onlineEntryScreen() {
  const o = state.online;
  return h('div', { class: 'screen fade-in' },
    onlineTop('Each on own device'),
    h('h1', { class: 'title' }, 'Play together'),
    h('p', { class: 'subtitle' }, 'Create a room and share the code, or join one your friend made.'),
    h('div', { class: 'section-label' }, 'Your name'),
    h('input', { class: 'name-input', type: 'text', value: o.name, placeholder: 'Your name', autocapitalize: 'words', autocomplete: 'off', oninput: (e) => { o.name = e.target.value; } }),
    o.joinError ? h('p', { class: 'note warn' }, o.joinError) : null,
    h('button', { class: 'btn btn-primary', onclick: createRoom }, 'Create a room'),
    h('p', { class: 'note center', style: 'margin: 8px 0;' }, 'or join an existing one'),
    h('div', { class: 'name-row' },
      h('input', { class: 'name-input', type: 'text', value: o.joinCode, placeholder: 'Room code', autocapitalize: 'characters', autocomplete: 'off', maxlength: '6', oninput: (e) => { o.joinCode = e.target.value.toUpperCase(); } }),
      h('button', { class: 'btn btn-secondary', style: 'width: auto;', onclick: joinRoom }, 'Join')
    )
  );
}

function onlineLobbyScreen() {
  const o = state.online, room = o.room, me = clientId();
  const ids = Object.keys(room.players || {});
  const isHost = room.host === me;
  const maxImp = Math.max(1, ids.length - 1);
  const numImp = Math.min(room.numImposters || 1, maxImp);
  const canStart = ids.length >= 3;
  return h('div', { class: 'screen fade-in' },
    onlineTop('Lobby', leaveRoom),
    h('p', { class: 'subtitle center', style: 'margin-bottom: 0;' }, 'Room code'),
    h('div', { class: 'roomcode' }, o.code),
    h('button', { class: 'btn btn-ghost btn-small', style: 'display: block; margin: 0 auto 6px;', onclick: shareRoom }, o.copied ? 'Link copied ✓' : '🔗  Share link'),
    h('div', { class: 'section-label' }, ids.length + (ids.length === 1 ? ' player' : ' players')),
    h('div', { class: 'roster' }, ids.map((id) => h('div', { class: 'row' },
      h('span', null, ((room.players[id] && room.players[id].name) || '?') + (id === me ? ' (you)' : '')),
      id === room.host ? h('span', { class: 'tag ins' }, 'Host') : null
    ))),
    h('div', { class: 'spacer' }),
    isHost ? h('div', { class: 'stepper' },
      h('div', { class: 'label' }, h('span', { class: 'big' }, numImp + (numImp === 1 ? ' imposter' : ' imposters')), h('span', { class: 'hint' }, 'of ' + ids.length + ' players')),
      h('div', { class: 'controls' },
        h('button', { class: 'round-btn', disabled: numImp <= 1, onclick: () => onlineSetImposters(-1) }, '−'),
        h('span', { class: 'count' }, String(numImp)),
        h('button', { class: 'round-btn', disabled: numImp >= maxImp, onclick: () => onlineSetImposters(1) }, '+')
      )
    ) : null,
    isHost
      ? h('button', { class: 'btn btn-primary', disabled: !canStart, onclick: onlineDeal }, canStart ? 'Start game' : 'Need at least 3 players')
      : h('p', { class: 'note center' }, 'Waiting for the host to start…')
  );
}

function onlinePlayScreen() {
  const o = state.online, room = o.room, me = clientId(), r = room.round, isHost = room.host === me;
  const order = r.order || [];
  const amImp = !!(r.imposters && r.imposters[me]);
  const inRound = amImp || order.indexOf(me) !== -1;
  if (!inRound) {
    return h('div', { class: 'screen fade-in' }, onlineTop('Round in progress', leaveRoom),
      h('div', { class: 'spacer' }),
      h('p', { class: 'subtitle center' }, 'You joined mid-round — you\'ll be dealt in on the next one.'),
      h('div', { class: 'spacer' }));
  }
  return h('div', { class: 'screen fade-in' },
    onlineTop('Round', leaveRoom),
    secretCard({ isImposter: amImp, category: r.category, word: r.word, emoji: r.emoji, def: r.def, clue: r.clue }),
    h('div', { class: 'section-label' }, 'Speaking order'),
    h('div', { class: 'order-list' }, order.map((id, idx) => h('div', { class: 'order-row' + (idx === 0 ? ' first' : '') },
      h('span', { class: 'order-num' }, String(idx + 1)),
      h('span', null, (room.players[id] && room.players[id].name) || '(left)'),
      idx === 0 ? h('span', { class: 'first-tag' }, '🎤 starts') : null
    ))),
    h('div', { class: 'spacer' }),
    isHost ? h('button', { class: 'btn btn-primary', onclick: () => { if (confirm('Reveal the word and imposter(s) to everyone?')) onlineReveal(); } }, 'Reveal the answer')
           : h('p', { class: 'note center' }, 'When everyone\'s done talking, the host reveals.'),
    isHost ? h('button', { class: 'btn btn-ghost', onclick: onlineDeal }, '↻ New round') : null
  );
}

function onlineRevealScreen() {
  const o = state.online, room = o.room, me = clientId(), r = room.round, isHost = room.host === me;
  const ids = Object.keys(room.players || {});
  const impNames = ids.filter((id) => r.imposters && r.imposters[id]).map((id) => (room.players[id] && room.players[id].name) || '?');
  return h('div', { class: 'screen fade-in' },
    onlineTop('Reveal', leaveRoom),
    h('h1', { class: 'title' }, 'The reveal'),
    secretCard({ isImposter: false, category: r.category, word: r.word, emoji: r.emoji, def: r.def, clue: r.clue }),
    h('div', { class: 'section-label' }, impNames.length === 1 ? 'The imposter was' : 'The imposters were'),
    h('div', { class: 'reveal-name center' }, impNames.join(', ') || '—'),
    h('div', { class: 'spacer' }),
    isHost ? h('button', { class: 'btn btn-primary', onclick: onlineDeal }, '↻ Play again') : h('p', { class: 'note center' }, 'Waiting for the host…'),
    isHost ? h('button', { class: 'btn btn-ghost', onclick: onlineBackToLobby }, 'Back to lobby') : null
  );
}

function setupScreen() {
  let packTotal = 0;
  for (const c in WORD_PACK) packTotal += WORD_PACK[c].length;
  const trimmed = state.names.map((n) => n.trim());
  const count = trimmed.filter(Boolean).length;
  const maxImp = Math.max(1, count - 1);
  if (state.numImposters > maxImp) state.numImposters = maxImp;
  if (state.numImposters < 1) state.numImposters = 1;

  const canStart = count >= 3 && state.numImposters <= count - 1;

  const rows = state.names.map((name, i) =>
    h('div', { class: 'name-row' },
      h('input', {
        class: 'name-input',
        type: 'text',
        value: name,
        placeholder: 'Player ' + (i + 1),
        autocapitalize: 'words',
        autocomplete: 'off',
        oninput: (e) => { state.names[i] = e.target.value; updateStartButton(); }
      }),
      state.names.length > 2 && h('button', {
        class: 'remove-btn',
        'aria-label': 'Remove player',
        onclick: () => { state.names.splice(i, 1); saveSetup(); render(); }
      }, '×')
    )
  );

  return h('div', { class: 'screen fade-in' },
    h('div', { class: 'topbar' },
      h('button', { class: 'btn btn-ghost btn-small', onclick: () => { state.screen = 'home'; render(); } }, '← Modes'),
      h('span', { class: 'brand' }, 'Pass the phone')
    ),
    h('h1', { class: 'title' }, 'Imposter'),
    h('p', { class: 'subtitle' },
      'Add everyone playing, choose how many imposters, then pass the phone around.'),

    h('div', { class: 'section-label' }, 'Players'),
    h('div', { class: 'name-list' }, rows),
    h('button', {
      class: 'btn btn-secondary',
      onclick: () => { state.names.push(''); state.focusLast = true; saveSetup(); render(); }
    }, '＋  Add player'),

    h('div', { class: 'section-label' }, 'Imposters'),
    h('div', { class: 'stepper' },
      h('div', { class: 'label' },
        h('span', { class: 'big' },
          state.numImposters + (state.numImposters === 1 ? ' imposter' : ' imposters')),
        h('span', { class: 'hint' }, count >= 1 ? ('of ' + count + ' players') : 'add players first')
      ),
      h('div', { class: 'controls' },
        h('button', {
          class: 'round-btn',
          disabled: state.numImposters <= 1,
          onclick: () => { state.numImposters--; saveSetup(); render(); }
        }, '−'),
        h('span', { class: 'count' }, String(state.numImposters)),
        h('button', {
          class: 'round-btn',
          disabled: state.numImposters >= maxImp,
          onclick: () => { state.numImposters++; saveSetup(); render(); }
        }, '+')
      )
    ),

    h('div', { class: 'spacer' }),
    h('p', { id: 'start-hint', class: 'note' + (canStart ? '' : ' warn') },
      canStart ? 'Ready! Pass the phone after you press start.'
               : 'Enter at least 3 player names to start.'),
    h('button', {
      id: 'start-btn',
      class: 'btn btn-primary',
      disabled: !canStart,
      onclick: () => { saveSetup(); dealRoles(); state.screen = 'menu'; render(); }
    }, 'Start game'),
    h('p', { class: 'buildtag' }, packTotal + ' words · ' + Object.keys(WORD_PACK).length + ' categories')
  );
}

// Toggle the Start button live while typing names (no full re-render = keeps focus).
function updateStartButton() {
  const count = validNames().length;
  const canStart = count >= 3 && state.numImposters <= count - 1;
  const btn = document.getElementById('start-btn');
  const hint = document.getElementById('start-hint');
  if (btn) btn.disabled = !canStart;
  if (hint) {
    hint.textContent = canStart
      ? 'Ready! Pass the phone after you press start.'
      : 'Enter at least 3 player names to start.';
    hint.className = 'note' + (canStart ? '' : ' warn');
  }
}

function menuScreen() {
  const seenCount = state.players.filter((p) => p.seen).length;
  const allSeen = seenCount === state.players.length;

  const list = state.players.map((p, i) =>
    h('button', {
      class: 'name-btn' + (p.seen ? ' seen' : ''),
      disabled: p.seen,
      onclick: () => { state.activeCard = i; state.cardRevealed = false; state.screen = 'card'; render(); }
    },
      h('span', null, p.name),
      p.seen ? h('span', { class: 'tick' }, '✓ seen')
             : h('span', { class: 'arrow' }, '›')
    )
  );

  return h('div', { class: 'screen fade-in' },
    h('div', { class: 'topbar' },
      h('span', { class: 'brand' }, 'Imposter'),
      h('button', {
        class: 'btn btn-ghost btn-small',
        onclick: () => {
          if (confirm('Leave this round and edit players?')) { state.screen = 'setup'; render(); }
        }
      }, '↺ Edit players')
    ),
    h('h1', { class: 'title' }, 'Pass the phone'),
    h('p', { class: 'subtitle' }, 'Tap your name to see your secret. Hide it from everyone else, then pass it on.'),
    h('div', { class: 'progress' }, seenCount + ' of ' + state.players.length + ' have looked'),
    h('div', { class: 'name-list' }, list),
    h('div', { class: 'spacer' }),
    h('button', {
      class: 'btn btn-primary',
      disabled: !allSeen,
      onclick: () => { pickOrder(); state.screen = 'order'; render(); }
    }, allSeen ? 'Reveal the speaking order  →' : 'Everyone needs to look first')
  );
}

// a simple stable hue from a string, for letter avatars
function hashHue(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 360;
  return n;
}

// the visual for a word: its emoji if it has one, else a coloured initial avatar
function imageNode(word, emoji) {
  if (emoji) return h('div', { class: 'word-emoji' }, emoji);
  const letter = (word || '?').trim().charAt(0).toUpperCase();
  return h('div', { class: 'avatar', style: 'background: hsl(' + hashHue(word) + ', 55%, 45%)' }, letter);
}

// the secret card, shared by single-device and online modes
function secretCard(o) {
  return o.isImposter
    ? h('div', { class: 'card' },
        h('div', { class: 'big-emoji' }, '🕵️'),
        h('div', { class: 'role' }, 'You\'re the imposter'),
        h('span', { class: 'chip' }, o.category),
        h('div', { class: 'clue-label' }, 'Your one-word clue:'),
        h('div', { class: 'word' }, o.clue),
        h('p', { class: 'note' }, 'Use it to blend in. Work out the word without giving yourself away.')
      )
    : h('div', { class: 'card' },
        imageNode(o.word, o.emoji),
        h('div', { class: 'kicker' }, o.category),
        h('div', { class: 'word' }, o.word),
        o.def ? h('p', { class: 'def' }, o.def) : null,
        h('p', { class: 'note' }, 'Drop hints subtle enough that the imposter can\'t guess it.')
      );
}

function cardScreen() {
  const p = state.players[state.activeCard];

  // Step 1: privacy gate — make sure only this player is looking.
  if (!state.cardRevealed) {
    return h('div', { class: 'screen fade-in' },
      h('div', { class: 'spacer' }),
      h('div', { class: 'center' },
        h('p', { class: 'subtitle' }, 'This is for'),
        h('div', { class: 'reveal-name' }, p.name),
        h('p', { class: 'note' }, 'Make sure nobody else can see the screen.')
      ),
      h('div', { class: 'spacer' }),
      h('button', {
        class: 'btn btn-primary',
        onclick: () => { state.cardRevealed = true; render(); }
      }, 'Reveal my secret'),
      h('button', {
        class: 'btn btn-ghost',
        onclick: () => { state.activeCard = null; state.screen = 'menu'; render(); }
      }, '← That\'s not me')
    );
  }

  // Step 2: show the secret. Same layout for both roles so onlookers
  // can't tell the imposter apart by glancing at the colors.
  const card = secretCard({ isImposter: p.isImposter, category: state.category, word: state.word, emoji: state.wordEmoji, def: state.wordDef, clue: state.clue });

  return h('div', { class: 'screen fade-in' },
    h('div', { class: 'spacer' }),
    card,
    h('div', { class: 'spacer' }),
    h('button', {
      class: 'btn btn-primary',
      onclick: () => {
        state.players[state.activeCard].seen = true;
        state.activeCard = null;
        state.cardRevealed = false;
        state.screen = 'menu';
        render();
      }
    }, 'Done — hide & pass on')
  );
}

function orderScreen() {
  return h('div', { class: 'screen fade-in' },
    h('h1', { class: 'title' }, 'Speaking order'),
    h('p', { class: 'subtitle' },
      'Take turns in this order, then keep going around. Say a word or two about the secret word — insiders, show you know it without handing it to the imposter.'),
    h('div', { class: 'order-list' },
      state.order.map((pi, idx) =>
        h('div', { class: 'order-row' + (idx === 0 ? ' first' : '') },
          h('span', { class: 'order-num' }, String(idx + 1)),
          h('span', null, state.players[pi].name),
          idx === 0 ? h('span', { class: 'first-tag' }, '🎤 starts') : null
        )
      )
    ),
    h('div', { class: 'spacer' }),
    h('button', {
      class: 'btn btn-secondary',
      onclick: () => { pickOrder(); render(); }
    }, '🔀  Reshuffle order'),
    h('button', {
      class: 'btn btn-primary',
      onclick: () => {
        if (confirm('Reveal the word and who the imposter was?')) { state.screen = 'reveal'; render(); }
      }
    }, 'Reveal the answer'),
    h('button', {
      class: 'btn btn-ghost',
      onclick: () => { dealRoles(); state.screen = 'menu'; render(); }
    }, '↻ Play again (same players)')
  );
}

function revealScreen() {
  const imposters = state.players.filter((p) => p.isImposter).map((p) => p.name);

  const roster = h('div', { class: 'roster' },
    state.players.map((p) =>
      h('div', { class: 'row' },
        h('span', null, p.name),
        h('span', { class: 'tag ' + (p.isImposter ? 'imp' : 'ins') },
          p.isImposter ? 'Imposter' : 'Knew the word')
      )
    )
  );

  return h('div', { class: 'screen fade-in' },
    h('h1', { class: 'title' }, 'The reveal'),
    h('div', { class: 'card' },
      h('div', { class: 'kicker' }, state.category),
      h('div', { class: 'word' }, state.word)
    ),
    h('div', { class: 'section-label' },
      imposters.length === 1 ? 'The imposter was' : 'The imposters were'),
    h('div', { class: 'reveal-name center' }, imposters.join(', ')),
    h('div', { class: 'section-label' }, 'Everyone'),
    roster,
    h('div', { class: 'spacer' }),
    h('button', {
      class: 'btn btn-primary',
      onclick: () => { dealRoles(); state.screen = 'menu'; render(); }
    }, '↻ Play again (same players)'),
    h('button', {
      class: 'btn btn-ghost',
      onclick: () => { state.screen = 'setup'; render(); }
    }, '👥 New game / edit players')
  );
}

/* ======================================================================
 * RENDER
 * ==================================================================== */
function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  let screen;
  switch (state.screen) {
    case 'home':  screen = homeScreen(); break;
    case 'online': screen = onlineScreen(); break;
    case 'menu':  screen = menuScreen(); break;
    case 'card':  screen = cardScreen(); break;
    case 'order': screen = orderScreen(); break;
    case 'reveal': screen = revealScreen(); break;
    default:      screen = setupScreen(); break;
  }
  root.appendChild(screen);

  // focus a freshly-added name field
  if (state.screen === 'setup' && state.focusLast) {
    state.focusLast = false;
    const inputs = root.querySelectorAll('.name-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }
}

/* ---------- boot ---------- */
loadSetup();
let _roomParam = null;
try { _roomParam = new URLSearchParams(location.search).get('room'); } catch (e) {}
if (_roomParam) { state.online.joinCode = _roomParam.toUpperCase(); enterOnline(); }
else { render(); }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => { /* offline support optional */ });
  });
}
