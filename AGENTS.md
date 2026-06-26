# AGENTS.md

## Cursor Cloud specific instructions

This is a single React + Vite static site (`yiruimusic_react`) — a harpist's portfolio + student booking app. There is no backend service in this repo; it talks directly to Firebase (Auth + Firestore) and EmailJS from the browser.

### Services / commands
There is only one service (the Vite frontend). Standard commands live in `package.json`:
- `npm run dev` — start the dev server (Vite, defaults to http://localhost:5173).
- `npm run build` — production build; runs `vite build` then `node scripts/postbuild.js` (SEO pre-rendering + asset compression).
- `npm run lint` — ESLint.
- `npm run preview` — serve the built `dist/`.

### Non-obvious notes
- The app runs and the **public site works without any env vars**: `src/firebase.js` intentionally skips Firebase init when `VITE_FIREBASE_*` vars are missing (see the `initializationError` handling). Home/Portfolio/Repertoire/Journey all render fine. Auth-gated features (Login/Register/Dashboard/Booking/Admin) and email sending will not function until secrets are provided.
- To enable Firebase/EmailJS features locally, create a `.env` (gitignored) with the `VITE_FIREBASE_*` and `VITE_EMAILJS_*` keys referenced in `.github/workflows/deploy.yml`. These are not committed and must be supplied as Cursor secrets if auth/booking flows need testing.
- `npm run lint` currently reports pre-existing errors/warnings (e.g. `react-hooks/set-state-in-effect`, an unused var in `Login.jsx`). These are existing code issues, not environment problems — do not treat a non-zero lint exit as a setup failure.
- `scripts/seedSlots.js` is a standalone Node admin script (reads `process.env.VITE_FIREBASE_*` via `dotenv`) used to seed Firestore booking slots; it is not part of the dev server.
