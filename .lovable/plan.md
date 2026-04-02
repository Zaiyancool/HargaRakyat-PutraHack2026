

# Fix: Remove Fake Phone Frame, Use Mockup Image Directly

## Problem
The uploaded image (`mockup_phone.webp`) already contains a realistic iPhone mockup with its own bezels and frame. But the code wraps it inside a **second fake phone frame** — a `div` with `border-[7px] border-black bg-black rounded-[2.5rem]` and fixed dimensions. This creates a black rectangle around the already-framed phone image.

## Fix — `src/components/landing/HeroSection.tsx`

Remove the fake phone container div entirely. Display the image directly with natural sizing:

```tsx
{/* Right — phone mockup */}
<div className="flex justify-center">
  <div className="relative">
    {/* Glow behind phone */}
    <div className="absolute inset-0 scale-90 rounded-[3rem] bg-primary/15 blur-2xl" />

    <img
      src="/images/mockup_phone.webp"
      alt="HargaRakyat app preview"
      loading="eager"
      className="relative h-[520px] w-auto drop-shadow-2xl md:h-[580px]"
    />
  </div>
</div>
```

**What changes:**
- Remove the wrapper `div` with `border-black bg-black overflow-hidden rounded-[2.5rem]`
- Remove `scale-[1.12]` and `object-cover` (no longer cropping to fit a fake frame)
- Use `h-[520px] w-auto` so the image scales naturally at its aspect ratio
- Add `drop-shadow-2xl` for depth (replaces the old `shadow-2xl` on the container)
- Keep the blue glow behind

**One file changed, ~3 lines replaced.**

