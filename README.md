# ShotList

ShotList is a travel shot-list guide for cinematic Instagram Reels and TikToks. Pick a destination, a trip type, a reel style and a length, and it gives you an ordered list of shots to film, from packing your bag to saying goodbye.

> Example (Boracay, Cinematic, Flight): board the plane (POV) → window shot at takeoff → get off at **Godofredo P. Ramos Airport – Caticlan** with the sign visible → boat ride from **Caticlan Jetty Port** in slow-mo → first look at White Beach → … → paraw sailing at sunset → fire dancers at night.

Built with React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Router, lucide-react and vite-plugin-pwa. It has no backend.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks and builds into dist/
npm run preview    # serves the production build
```

### Install on iPhone

1. Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy.yml` (one-time setup: repo **Settings → Pages → Source: GitHub Actions**). The app is then at `https://haime-prog1.github.io/Maniniyot-/`. Any other static host works too: the build uses relative paths and hash routing.
2. Open the URL in Safari → **Share** → **Add to Home Screen**.
3. The app runs full-screen and works offline.

The in-app camera needs HTTPS (or `localhost`).

## Features

- **Discover**: search destinations, browse featured destinations, and continue your active trip.
- **Create Guide**: a 4-step sheet for destination, trip type, reel style and target length.
- **Shot List**: shots grouped by trip phase with sticky headers and a progress ring. Each shot has a captured check, swipe-left to skip, drag to reorder, and you can add custom shots.
- **Shot Detail**: a rule-of-thirds framing diagram, camera settings, the tip, the transition, notes and capture.
- **Capture**: use the native iPhone Camera, or Quick Capture in-app with a thirds grid, a ghost framing overlay, a countdown and a front/back camera toggle.
- **Insta360 Ace Pro 2 mode**: pick the camera in Settings or when creating a guide. Shot details then show Ace Pro 2 settings (mode, stabilisation, field of view, mounting), new guides add action-cam shots (underwater, chest-mount POV, selfie-stick follow, TimeShift), and Capture can import clips exported from the Insta360 app.
- **Vlog Script**: a spiel to say for each shot (short or long), in Taglish or Tagalog, with facts about the destination (Boracay has 13). Open it from the trip screen, copy or share it, and see each line under "Say this" in Shot Detail.
- **Reel Builder**: captured clips in order, with durations fitted to your target length, beat-snapped cuts, a beat-drop marker and a CapCut/VN checklist.
- **My Trips**: open, duplicate or delete trips.
- **Settings**: theme, export as text (copy or share), storage usage, delete all media, and reset.

## Privacy

**Your photos and videos never leave this device.**

- Captured clips and photos are stored only in this browser's IndexedDB (via `idb-keyval`), linked to the shot.
- ShotList has no server, no analytics and no third-party SDKs. Media is never uploaded or sent anywhere.
- Media leaves the device only when you tap **Share** and choose where it goes (Save to Photos, CapCut, AirDrop…).
- Camera permission is requested only when you tap **Quick Capture**, never when the app loads. The camera turns off as soon as you close the capture screen.
- ShotList asks the browser for persistent storage (`navigator.storage.persist()`) so iOS is less likely to clear it. Back up important clips with **Share → Save Video** anyway.
- **Settings → Delete all media** removes every stored clip at once.
- `.gitignore` blocks media files (`*.mp4`, `*.mov`, `*.jpg`, `*.png`, `*.heic`, `/media`) and `.env*` so they're never committed. Only the app icons in `public/icons` are allowed.

## Project structure

```
src/
  components/ui/   GlassCard, GlassButton, BottomSheet, SegmentedControl, ProgressRing,
                   LargeTitle, TabBar, Toggle, ListGroup, Background
  features/        home, create, shotlist, capture, reel, trips, settings
  data/            destinations, shots (seed data), options, cameraSettings
  services/        generateShotList (AI plug-in point), mediaStore (IndexedDB), exportText
  store/           useStore (persisted Zustand), useUI
  types/           shared TypeScript models
```

### Plugging in AI generation

`src/services/generateShotList.ts` exports `generateShotList(input)`. Right now it builds the list from the local seed data. To use an AI model, call your API there, validate the returned `Shot[]`, and pass it through `finalizeShots()`. Keep the local builder as the offline fallback.
