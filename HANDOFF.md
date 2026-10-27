Here is the comprehensive handoff document detailing the remaining tasks, production preparation, and known issues for the Golden State Barbershop 3D Immersive Redesign.

You can copy and paste the text below directly into a file named `HANDOFF_PRODUCTION.md` in your project root.

***

# 🏗️ Handoff: Golden State Barbershop Production Prep & Final Polish

## 🔗 Project Links
*   **GitHub Repository:** [https://github.com/o87enterprises-ai/golden-state-barbershop](https://github.com/o87enterprises-ai/golden-state-barbershop)
*   **Local Directory:** `C:\Users\there\o87DevMobile\Specs\GoldenGate`

## ✅ Current State (Completed)
1.  **Unified Scroll Experience:** Merged `ScrollVideo.tsx` into `ClipperBreakdown.tsx`. The background video now scrubs perfectly in sync with the GSAP timeline that dissects and orbits the 3D clipper model.
2.  **Graceful Degradation:** Added `WebGLFallback.tsx`. If a user's browser blocks WebGL (like the current Firefox setup), the page no longer crashes and the `<Hero />` section remains intact.
3.  **Build Stability:** Resolved severe Node.js OOM (Out of Memory) crashes by switching dev server to Webpack (`next dev --webpack`), pinning Turbopack's root, and increasing Node memory limits via `cross-env`.
4.  **Layout:** The bold "PRECISION ENGINEERED" text overlays the left side, while the placeholder 3D model renders on the right over the video background.

---

## ⏭️ Task 1: Replace Placeholder Geometry with Real `.glb` Model
Currently, the 3D scene uses primitive shapes (`boxGeometry`, `cylinderGeometry`). You must swap these for the final artist-provided model.

### Instructions:
1.  Place the final model file at `C:\Users\there\o87DevMobile\Specs\GoldenGate\public\clipper.glb`.
2.  Open `C:\Users\there\o87DevMobile\Specs\GoldenGate\components\3d\ClipperScene.tsx`.
3.  Replace the primitive meshes with the `useGLTF` loader. Ensure the 3D artist named the individual parts `Blade`, `Motor`, and `Coil` in Blender to make targeting them easier.

**Required `ClipperScene.tsx` changes:**
```tsx
import { useGLTF } from '@react-three/drei';
useGLTF.preload('/clipper.glb');

// Inside the component:
const { scene } = useGLTF('/clipper.glb');
// Replace the three <mesh> tags with:
<primitive object={scene} />
```

4.  Open `C:\Users\there\o87DevMobile\Specs\GoldenGate\components\ClipperBreakdown.tsx`.
5.  Update the GSAP timeline. You can no longer rely on array indexes (`parts[0]`). You must target the named nodes.
```tsx
const blade = group.getObjectByName('Blade');
const motor = group.getObjectByName('Motor');
const coil = group.getObjectByName('Coil');
if (!blade || !motor || !coil) return;

// Update the GSAP timeline to target blade.position, motor.rotation, etc.
```

---

## ⏭️ Task 2: Video Optimization (Critical for Production)
Scrubbing a standard `.mp4` via GSAP (`currentTime`) is notoriously laggy on mobile devices and Safari. The browser has to decode video frames on the fly, which causes massive frame drops.

### Instructions:
1.  **Compress the Video:** Ensure `/clippers.mp4` is compressed using H.264 (or better, WebM/VP9) and is no larger than 5MB. Ideally, remove the audio track entirely using a tool like Handbrake.
2.  **Mobile Fallback (Optional but recommended):** On mobile devices (under 768px), consider disabling the video scrub. Instead of scrubbing, let the video play normally, or replace the video background with a static high-res image to save battery and prevent crashes.
3.  **Image Sequence Alternative:** If scrubbing the MP4 still stutters on high-end devices, convert the video into an image sequence (e.g., 60 JPEGs) and preload them. You can then swap the background image `src` based on the GSAP scroll progress.

---

## ⏭️ Task 3: Responsive Design Adjustments
The current layout places the 3D model on the right, but on mobile screens (320px - 425px), the model will likely clip off the screen or overlap with the text.

### Instructions:
1.  Open `C:\Users\there\o87DevMobile\Specs\GoldenGate\components\ClipperBreakdown.tsx`.
2.  Adjust the text container. On mobile, center the text and push it to the top or bottom.
```tsx
// Change the text container classes to:
<div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-start pt-24 md:justify-center px-6 md:px-24">
```
3.  Open `C:\Users\there\o87DevMobile\Specs\GoldenGate\components\3d\ClipperScene.tsx`.
4.  Adjust the `ResponsiveGroup` X-position. On mobile, you want the model centered (`x = 0`), but on desktop, offset to the right.
```tsx
// Update the x calculation:
const x = viewport.width < 5 ? 0 : Math.min(viewport.width * 0.3, 3.5);
```

---

## ⏭️ Task 4: WebGL & Firefox Compatibility
During testing, Firefox threw a `WebGL context could not be created` error, which halted React hydration and caused the `<Hero />` to vanish.

### Current Status:
We added `components/3d/WebGLFallback.tsx`. If WebGL fails, it catches the error and displays a static message ("Hardware Acceleration Required") so the rest of the site works perfectly.

### Remaining Actions:
1.  **Test on Real Devices:** Open the site on an iPhone and an Android device to ensure the 3D scene loads or falls back gracefully.
2.  **Check `prefers-reduced-motion`:** In `ClipperBreakdown.tsx`, ensure the `gsap.matchMedia` block is working. If a user has reduced motion enabled in their OS, the 3D model should remain static, the video should not scrub, and the section should not pin.
3.  **Document the Firefox Issue:** If clients report they can't see the 3D model in Firefox, advise them to check `about:support` -> Graphics. If it says `Blocked`, they need to update their graphics drivers.

---

## ⏭️ Task 5: Pre-Flight Checks & Production Deployment
Before merging to `main` and deploying to Cloudflare Pages or Vercel, run through this checklist.

### 1. Fix Missing Image `sizes` Prop
The console currently warns about `Image with src "/logo.png" has "fill" but is missing "sizes" prop`. This hurts Lighthouse performance scores.
*   Open `C:\Users\there\o87DevMobile\Specs\GoldenGate\components\Hero.tsx` (or wherever the logo is).
*   Add a `sizes` prop to the `<Image />` component: `sizes="(max-width: 768px) 100vw, 50vw"`.

### 2. Clean Up Lockfiles
You currently have `package-lock.json` from an earlier NPM install, but you are using `pnpm`.
*   Run: `Remove-Item C:\Users\there\o87DevMobile\Specs\GoldenGate\package-lock.json`

### 3. Ensure Environment Variables are Set
Since the project uses Prisma and Stripe, ensure the production environment variables are set in your hosting provider's dashboard (Cloudflare/Vercel):
*   `DATABASE_URL`
*   `STRIPE_SECRET_KEY`
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4. Run a Production Build Locally
Run the build command locally to catch any TypeScript errors that Webpack development mode ignores. Because `build` uses Turbopack (which crashed before), we need to verify it works with the new memory settings.
```powershell
cd C:\Users\there\o87DevMobile\Specs\GoldenGate
pnpm build
```

---

## 🚀 Final Git Commit & Push Sequence
Once all tasks above are completed and `pnpm build` succeeds, run the following to deploy:

```powershell
cd C:\Users\there\o87DevMobile\Specs\GoldenGate

# 1. Ensure you are on the feature branch
git checkout feature/3d-immersive-scroll

# 2. Stage all changes
git add .

# 3. Commit the final production-ready code
git commit -m "feat: finalize 3D asset integration, responsive layouts, and production optimizations"

# 4. Push to GitHub
git push origin feature/3d-immersive-scroll
```

Once pushed, go to GitHub and merge the Pull Request into `main`. Your Cloudflare Pages integration should automatically trigger a production deploy.