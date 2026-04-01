# 🕵️ CyberCrossword – Setup Guide

A live multiplayer cybersecurity crossword for 1000+ concurrent players,
hosted on GitHub Pages with Firebase Realtime Database for live leaderboards.

---

## 📁 Files

```
crossword-game/
├── index.html          ← Main page (entry + game + complete screens)
├── style.css           ← All styles
├── game.js             ← Game logic + Firebase integration
├── puzzle.js           ← Crossword data (grid, clues, answers)
├── firebase-rules.json ← Paste into Firebase DB rules
└── README.md           ← This file
```

---

## 🔥 Step 1 – Set up Firebase

1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it (e.g. `cyber-crossword`)
3. Disable Google Analytics (not needed) → **Create project**
4. In the left sidebar: **Build → Realtime Database → Create database**
   - Choose a region close to your users (e.g. `asia-southeast1` for India)
   - Start in **test mode** (you'll lock it down in Step 3)
5. Go to **Project Settings** (gear icon) → scroll down to **Your apps**
6. Click **</>** (Web app) → register the app → copy the `firebaseConfig` object

---

## ⚙️ Step 2 – Add your Firebase config to game.js

Open `game.js` and replace the `FIREBASE_CONFIG` block:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIza...",
  authDomain:        "my-project.firebaseapp.com",
  databaseURL:       "https://my-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "my-project",
  storageBucket:     "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123"
};
```

---

## 🔒 Step 3 – Apply Firebase Security Rules

1. In Firebase Console → **Realtime Database → Rules tab**
2. Paste the contents of `firebase-rules.json`
3. Click **Publish**

This allows:
- ✅ Anyone to **read** the leaderboard
- ✅ Anyone to **write a new entry once** (no overwrites → prevents cheating)
- ❌ Blocks invalid data (score > 99999, names > 30 chars, etc.)

---

## 🚀 Step 4 – Deploy to GitHub Pages

```bash
# 1. Create a new GitHub repository (e.g. cyber-crossword)

# 2. Push all files
git init
git add .
git commit -m "Initial crossword game"
git remote add origin https://github.com/YOUR_USERNAME/cyber-crossword.git
git push -u origin main

# 3. Enable GitHub Pages
# Go to: Repo Settings → Pages → Source: Deploy from branch → main → / (root)
# Your URL will be: https://YOUR_USERNAME.github.io/cyber-crossword/
```

> **Important:** GitHub Pages serves static files, but `game.js` uses ES modules
> (`import`). This works natively in all modern browsers with no build step needed.

---

## 📱 Sharing with 1000+ users

1. Generate a QR code at **https://qr.io** pointing to your GitHub Pages URL
2. Display the QR on screen / projector at your event
3. Players scan → enter name → play!

The leaderboard updates live as scores come in. Firebase free tier (Spark plan)
supports **100k simultaneous connections** — more than enough.

---

## 🎨 Customizing

### Change puzzle clues/answers
Edit `puzzle.js` — all grid positions, clues, and answers are there.

### Change the event branding
- Edit the title in `index.html` (`CyberCrossword`, emoji, subtitle)
- Change CSS variables in `style.css` under `:root` for colors

### Scoring formula (in game.js)
```js
score += word.answer.length * 10 + Math.max(0, 300 - elapsedSeconds);
```
- 10 pts per letter in the word
- Time bonus: up to 300 pts (decays as time passes)

---

## ⚠️ Troubleshooting

| Issue | Fix |
|---|---|
| Blank page | Check browser console for Firebase config errors |
| Scores not saving | Verify `databaseURL` matches your DB region |
| CORS errors | Make sure you're serving via `https://` (GitHub Pages does this) |
| Grid looks wrong | Cross-check row/col values in `puzzle.js` against the image |

---

Good luck at your event! 🎉
