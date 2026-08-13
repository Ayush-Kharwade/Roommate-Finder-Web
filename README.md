# RoommateFinder

Find rooms, PGs and compatible flatmates across India — no brokers.

A React + Vite front end talking directly to Firebase (Auth, Firestore, Storage),
with Cloudinary for listing photos and OpenCage for geocoding.

```
client/     React app — this is the deployable front end
server/     Express + MongoDB stub (see "About server/" below)
firestore.rules, storage.rules, firestore.indexes.json, firebase.json
```

## Running locally

```bash
cd client && npm install && npm run dev
```

Copy `client/.env.example` to `client/.env` first and fill in the values.
The dev server runs over HTTPS on port 5173 via `@vitejs/plugin-basic-ssl`,
so expect a self-signed certificate warning on first load.

Lint the whole repo from the root:

```bash
npx eslint .
```

## About `server/`

`server/` is a stub: it boots Express, connects to MongoDB and serves a health
check, but has no routes, models or controllers, and the client never calls it.
All application data lives in Firestore. You do not need to deploy it.

It is kept in the tree because `server/scripts/backfillRentNumber.js` is a
useful one-off Firestore migration (it coerces string `rent` values to numbers).
That script needs `server/scripts/serviceAccountKey.json`, which is a **Firebase
admin private key** — gitignored, and it must stay that way.

---

# Deployment checklist

Work top to bottom. The first section is not optional — the app is a
client-side Firebase app, so without rules the database is world-writable.

## 1. Security rules (blocking)

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # select your Firebase project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Then confirm in the Firebase console that Firestore is **not** in test mode
(test-mode rules expire and fall back to open access).

Verify the two rules that matter most, from a signed-in browser console:

- Writing `{ isAdmin: true }` to your own `users/{uid}` document must be denied.
- Reading another user's `chats/{chatId}` document must be denied.

## 2. Rotate and restrict credentials (blocking)

- **MongoDB Atlas** — rotate both database user passwords. The old connection
  strings were sitting in plaintext in `server/.env`, including in comments.
  Also set the Atlas IP allowlist to something narrower than `0.0.0.0/0`.
- **Cloudinary** — the upload preset is *unsigned*, meaning anyone who reads the
  bundle can upload to your account. In Settings → Upload → Upload presets,
  restrict it to: images only, max 2 MB, formats `png,jpg,webp`, and set the
  allowed origins to your domain. Consider enabling a moderation queue.
- **OpenCage** — restrict the key to your production domain and set a daily cap.
  It is in the bundle and is billable per request.
- **Firebase web API key** — in Google Cloud console → APIs & Services →
  Credentials, add an HTTP referrer restriction for your domain. This key is not
  a secret, but restricting it limits quota abuse.
- Confirm `client/.env`, `server/.env` and `serviceAccountKey.json` are absent
  from `git ls-files`.

## 3. Firebase console settings

- **Authentication → Settings → Authorized domains**: add your production
  domain, remove any you do not control.
- **Authentication → Templates**: customise the password-reset email (the login
  page now sends these).
- **App Check**: strongly recommended. Register the site with reCAPTCHA
  Enterprise and enforce App Check on Firestore and Storage — this is what stops
  someone scripting the public `properties` and `seekers` collections.
- **Budget alerts**: set one on the Firebase/GCP billing account. Public reads
  on `properties` are unmetered by the rules.

## 4. Grant yourself admin

`/admin/reports` checks `isAdmin` on your user document, and the rules forbid
users from setting it themselves. Set it once from the Firebase console:
open `users/{your-uid}` in Firestore and add the boolean field `isAdmin: true`.

## 5. Build and host

```bash
cd client && npm run build     # outputs client/dist
firebase deploy --only hosting
```

`firebase.json` already configures SPA rewrites, long-lived caching for
`/assets/**`, and security headers (CSP, HSTS, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`).

If you host somewhere else (Netlify, Vercel, Cloudflare Pages), you must
reproduce two things yourself — neither is automatic:

- a rewrite of all paths to `/index.html`, or every deep link 404s;
- the response headers from the `hosting.headers` block in `firebase.json`.

## 6. Post-deploy smoke test

- Sign up → the `users/{uid}` document is created.
- Add a listing with 3 photos → they reach Cloudinary; a 4th or a 3 MB file is
  rejected with a message.
- Search a city on the homepage → the listings page geocodes it and the radius
  slider filters both the Rooms and Roommates tabs.
- Open another account's `/edit-listing/:id` → bounced to `/my-listings`.
- Send a chat message → the recipient's notification badge increments.
- Check the browser console for Firestore "requires an index" errors; if any
  appear, follow the link in the error and add the index to
  `firestore.indexes.json` too.

## Known gaps

Not bugs, but worth deciding on before a wide launch:

- **No email verification.** Anyone can sign up with an address they do not own.
  Consider gating listing creation behind `emailVerified`.
- **Deleting a listing leaves its photos in Cloudinary** and does not clean up
  saves, chats or notifications that reference it. Fine at small scale; needs a
  Cloud Function later.
- **Seeker profiles are publicly readable** (that is what makes the Roommates
  tab work logged out). They carry no email or phone number, but they do carry a
  name, city and coordinates. App Check is the main mitigation against bulk
  scraping.
- **`client/src/components/AnimatedSection.jsx` is unused** — wire it up or
  delete it along with the `react-intersection-observer` dependency.
