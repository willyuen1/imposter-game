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

/* ---------- game state ---------- */
const state = {
  screen: 'setup',        // 'setup' | 'menu' | 'card' | 'first' | 'reveal'
  names: ['', '', ''],    // raw text fields on the setup screen
  numImposters: 1,
  players: [],            // [{ name, isImposter, seen }] — kept in entry order
  category: '',
  word: '',
  clue: '',
  firstPlayer: null,      // index into players
  activeCard: null,       // index of player currently viewing their card
  cardRevealed: false,    // two-step privacy gate on the card screen
  focusLast: false        // focus the last name field after re-render
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
      const clues = item.clues || (item.clue ? [item.clue] : []);
      flat.push({ category, word: item.word, clues });
    }
  }
  const pick = flat[randInt(flat.length)];
  state.category = pick.category;
  state.word = pick.word;
  // each word has several possible clues — draw one at random for the imposter
  state.clue = pick.clues[randInt(pick.clues.length)] || '';

  // assign imposters to random positions, but keep players in entry order
  const positions = shuffle(names.map((_, i) => i));
  const imposterSet = new Set(positions.slice(0, state.numImposters));
  state.players = names.map((name, i) => ({
    name, isImposter: imposterSet.has(i), seen: false
  }));

  state.firstPlayer = null;
  state.activeCard = null;
  state.cardRevealed = false;
}

function pickFirstPlayer() {
  if (state.players.length <= 1) { state.firstPlayer = 0; return; }
  let i;
  do { i = randInt(state.players.length); } while (i === state.firstPlayer);
  state.firstPlayer = i;
}

/* ======================================================================
 * SCREENS
 * ==================================================================== */

function setupScreen() {
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
    }, 'Start game')
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
      onclick: () => { pickFirstPlayer(); state.screen = 'first'; render(); }
    }, allSeen ? 'Reveal who goes first  →' : 'Everyone needs to look first')
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
  const card = p.isImposter
    ? h('div', { class: 'card' },
        h('div', { class: 'big-emoji' }, '🕵️'),
        h('div', { class: 'role' }, 'You\'re the imposter'),
        h('span', { class: 'chip' }, state.category),
        h('div', { class: 'clue-label' }, 'Your only clue:'),
        h('div', { class: 'clue' }, '“' + state.clue + '”'),
        h('p', { class: 'note' }, 'Blend in. Figure out the word without giving yourself away.')
      )
    : h('div', { class: 'card' },
        h('div', { class: 'kicker' }, state.category),
        h('div', { class: 'word' }, state.word),
        h('p', { class: 'note' }, 'Drop hints subtle enough that the imposter can\'t guess it.')
      );

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

function firstPlayerScreen() {
  const p = state.players[state.firstPlayer];
  return h('div', { class: 'screen fade-in' },
    h('div', { class: 'spacer' }),
    h('div', { class: 'center' },
      h('div', { class: 'big-emoji' }, '🎤'),
      h('p', { class: 'subtitle' }, 'Goes first'),
      h('div', { class: 'reveal-name' }, p.name),
      h('p', { class: 'note' },
        'Say a word or two about the secret word. Insiders: prove you know it — without handing it to the imposter.')
    ),
    h('div', { class: 'spacer' }),
    h('button', {
      class: 'btn btn-secondary',
      onclick: () => { pickFirstPlayer(); render(); }
    }, '🔀  Pick someone else'),
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
    case 'menu':  screen = menuScreen(); break;
    case 'card':  screen = cardScreen(); break;
    case 'first': screen = firstPlayerScreen(); break;
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
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => { /* offline support optional */ });
  });
}
