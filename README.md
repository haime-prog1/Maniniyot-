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
- **Collage Studio** (Premium features): IG Story, 4:5 post, square and seamless carousel collages from your trip shots or Photo Library. See the Collage Studio section below.
- **Reel Builder**: captured clips in order, with durations fitted to your target length, beat-snapped cuts, a beat-drop marker and a CapCut/VN checklist.
- **My Trips**: open, duplicate or delete trips.
- **Settings**: theme, export as text (copy or share), storage usage, delete all media, and reset.

## Collage Studio

Open it from the **Images** icon on Home, or **Collage** on a trip. Collages autosave to this device and appear in **My Collages**.

- **Formats**: IG Story 1080×1920, Post 4:5 1080×1350, Square 1080×1080, and Seamless carousel (2–10 slides of 1080×1350). A carousel is one long canvas. On export it is cut into `slide-01.jpg`, `slide-02.jpg`…, so photos that cross a slide border line up when people swipe.
- **Editing**: tap a frame to add a photo. With a photo selected, drag inside it to pan, pinch to zoom, and use the handles to move, resize and rotate. Snap guides show canvas and slide edges and centers. **Adjust** has sliders for the same edits.
- **Export**: rendered on the device from the original photos, as JPG (quality 0.92) or PNG. Phones get the share sheet (Save Images, Instagram…). Desktop downloads the file, or a ZIP for carousels.
- **Code**: `src/features/collage/`. One renderer (`render.ts`) draws the editor, thumbnails and export, so they always match.

### Adding a template

Templates are data in `src/features/collage/templates.json`. Add an object to the array, with no code changes:

```json
{
  "id": "my-template",
  "name": "My template",
  "formats": ["story", "post"],
  "premium": false,
  "style": { "gap": 16, "radius": 12, "background": { "type": "solid", "color": "#ffffff" } },
  "frames": [
    { "x": 0, "y": 0, "w": 1, "h": 0.6, "inset": true },
    { "x": 0.1, "y": 0.62, "w": 0.5, "h": 0.33, "rotation": -4, "inset": false,
      "matte": { "color": "#ffffff", "pad": 24, "bottom": 90 } }
  ],
  "texts": [{ "preset": "location", "x": 0.06, "y": 0.9, "w": 0.6, "size": 40, "align": "left" }]
}
```

- **Units**: `x` and `w` are in slides (1 = one 1080 px slide), and `y` and `h` are fractions of the height (0–1). For a carousel template, set `"formats": ["carousel"]` and `"panels": 3`. A frame such as `"x": 0.6, "w": 1` then crosses from slide 1 into slide 2.
- **Frame options**:
  - `inset: true` frames get the adjustable spacing around them, which suits grids.
  - `matte` draws a polaroid border.
  - `rotation` is in degrees.
- **Style**: `gap`, `radius`, `borderWidth`, `borderColor`, `background` (`solid`, `gradient` with `from`/`to`/`angle`, or `blur` with `dim`) and `decor` (`"sprockets"` for film).
- **Texts**: `preset` is `location`, `date`, `title` or `caption`. You can override `text`, `size`, `align`, `pairId` (a font pair id from `fonts.ts`), `role` (`title`/`body`), `color`, `shadow`, `outline` and `bg`.

Font pairs (`fonts.ts`) and filters (`filters.ts`) are plain config arrays as well. Add an entry to offer a new one.

### Premium

- **Flags**: templates, font pairs and filters can set `"premium": true`. Free users still see them, with a **PRO** badge. Tapping one opens the upgrade sheet instead of applying it. Free exports include a small "made with ShotList" watermark, and Premium can turn it off.
- **One module decides access**: `src/services/entitlements.ts`.
  - `isPremium()` / `usePremium()`: is the user premium?
  - `isLocked(item)`: is this flagged item off-limits for the current user?
  - `requirePremium(item, reason)`: returns true if allowed, otherwise opens the upgrade sheet.
  - `purchasePremium()` / `restorePurchases()`: **placeholders**. Today, "Unlock Premium" grants Premium on the device so you can test.
- **To add real payments**: replace the body of `purchasePremium()` with your provider's checkout (Stripe, RevenueCat, App Store…). Call `useEntitlements.getState().grant('purchase')` once the purchase is verified, and implement `restorePurchases()` with the same provider. Nothing else needs to change. For testing, Settings has **Switch back to Free**.

## Privacy

**Your photos and videos never leave this device.**

- Captured clips and photos are stored only in this browser's IndexedDB (via `idb-keyval`), linked to the shot. Collage photos and projects are stored the same way, and collages are rendered and exported on the device.
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
