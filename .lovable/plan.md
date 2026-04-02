
# Fix Phone Mockup Video — Remove mix-blend-mode

## Problem
`mix-blend-mode: multiply` is making the white areas *inside* the video translucent. The user wants the video to play normally inside the phone frame — no transparency effects on the video content itself. The surrounding page background is already handled by the phone frame border.

## Fix
Simply remove `style={{ mixBlendMode: "multiply" }}` from the `<video>` element. The phone frame (dark border + rounded corners + overflow hidden) already clips the video correctly — no blend mode needed.

## Change

**`src/components/landing/HeroSection.tsx`** (line 88)
- Remove `style={{ mixBlendMode: "multiply" }}` from the video tag

```tsx
// Before
<video
  src="/videos/mockup_video.mp4"
  autoPlay loop muted playsInline
  className="h-full w-full object-cover"
  style={{ mixBlendMode: "multiply" }}
/>

// After
<video
  src="/videos/mockup_video.mp4"
  autoPlay loop muted playsInline
  className="h-full w-full object-cover"
/>
```

One line removed, one file changed.
