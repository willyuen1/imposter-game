# Imposter — a pass-the-phone party word game

One phone, secret roles. Everyone sees the **category**; the *insiders* also see the
secret **word**; the *imposter(s)* see only a subtle **clue**. Pass the phone around so
each person peeks at their own screen, then talk it out and catch the imposter.

It's a single, self-contained web app — no server, no accounts, no internet needed once
loaded. It runs in any browser and installs to your iPhone home screen like a real app.

---

## Files

| File | What it is |
|------|------------|
| `index.html` | The page + all styling |
| `app.js` | Game logic and screens |
| `words.js` | **The word pack — edit this to add your own words/clues** |
| `manifest.webmanifest`, `service-worker.js` | Make it installable + work offline |
| `icons/` | App icon |

---

## How to play it on your iPhone

### Option A — quick try over Wi-Fi (no hosting)
Run a tiny local web server on this Mac and open it from your phone on the same Wi-Fi.

```sh
cd /Users/unicorn/ClaudeSpace/imposter-game
python3 -m http.server 8000
```

Then on your iPhone's Safari, go to:

```
http://<this-mac-ip>:8000
```

(Find the Mac's IP with `ipconfig getifaddr en0`.) Stop the server with `Ctrl-C`.
Note: over plain Wi-Fi like this the game works fully, but the *offline/installable*
features only fully activate when served over **https** (see Option B).

### Option B — host it for free on GitHub Pages (permanent link, works offline)
This gives you a real URL you can open anywhere, then **Add to Home Screen** so it
launches full-screen with its own icon and works with no internet.

```sh
cd /Users/unicorn/ClaudeSpace/imposter-game
gh auth switch -u willyuen1     # IMPORTANT: use willyuen1, not polarisestrella1
gh auth status                  # confirm "Active account: true" is willyuen1
git init && git add -A && git commit -m "Imposter game"
gh repo create imposter-game --public --source=. --push   # needs the GitHub CLI
```

Then on github.com: **repo → Settings → Pages → Source: Deploy from a branch →
`main` / root → Save.** After a minute your game is live at
`https://<your-username>.github.io/imposter-game/`.

**Add to Home Screen:** open that link in Safari → tap **Share** → **Add to Home
Screen**. Done — it's now an app icon on your phone.

---

## Editing the words

Open `words.js`. Each entry is:

```js
{ word: "Elephant", related: ["Rhino", "Hippo", "Giraffe"] }
```

- `word` — what the insiders see.
- `related` — decoy words the imposter might see (the game shows one at random).
  Pick close cousins (usually same category) so the imposter can bluff, but
  specific clues still give them away.

Add lines to a category, or add a whole new `"Category": [ ... ]` block.
If you host on GitHub Pages, commit + push and the live version updates.

---

## Turning this into a real App Store app later

Because it's a clean, self-contained web app, you can wrap it natively with
[**Capacitor**](https://capacitorjs.com) and reuse ~all of this code:

```sh
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init Imposter com.example.imposter --web-dir .
npx cap add ios
npx cap open ios     # opens Xcode → Run on your iPhone / submit to the App Store
```

Shipping to the App Store needs a Mac with Xcode (you have the Mac) and an Apple
Developer account ($99/yr). Not required to just play it via Add to Home Screen.
