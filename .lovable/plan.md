

# Replace Video Mockup with Static Image

## What Changes
Replace the `<video>` element in the phone mockup with the uploaded PNG image. Compress the image for fast loading. Remove the video file.

## Steps

### 1. Copy and compress image
- Copy `user-uploads://mockup_phone_1.png` to `public/images/mockup_phone.webp`
- Convert to WebP format at ~80% quality for significant size reduction while maintaining visual quality

### 2. Update `src/components/landing/HeroSection.tsx`
Replace the `<video>` tag (lines 84-90) with an `<img>` tag:

```tsx
<img
  src="/images/mockup_phone.webp"
  alt="HargaRakyat app preview"
  loading="eager"
  className="h-full w-full scale-[1.12] object-cover object-center"
/>
```

### 3. Delete `public/videos/mockup_video.mp4`
No longer needed — saves ~1.7MB from the bundle.

## Files Changed

| File | Change |
|------|--------|
| `public/images/mockup_phone.webp` | New — compressed image |
| `src/components/landing/HeroSection.tsx` | `<video>` → `<img>` |
| `public/videos/mockup_video.mp4` | Deleted |

