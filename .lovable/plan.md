# Replace Phone Mockup with Video

## What Changes

Replace the static HTML phone mockup content (trending items, mini chart) with the uploaded `mockup_video.mp4` playing inside the phone frame. Use CSS `mix-blend-mode: multiply` to blend away the white background from the video. make the video responsive and efficiency, reduce the video storage size

## Steps

### 1. Copy video to project

Copy `user-uploads://mockup_video.mp4` to `public/videos/mockup_video.mp4`

### 2. Update `src/components/landing/HeroSection.tsx`

Replace lines 80-136 (the phone frame inner content — notch, app header, trending section, mini chart) with a single `<video>` element:

```tsx
<div className="relative mx-auto h-[520px] w-[260px] overflow-hidden rounded-[2.5rem] border-[7px] border-gray-900 shadow-2xl md:h-[580px] md:w-[290px]">
  <video
    src="/videos/mockup_video.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="h-full w-full object-cover"
    style={{ mixBlendMode: "multiply" }}
  />
</div>
```

- `mix-blend-mode: multiply` makes white areas transparent, blending the video naturally into whatever is behind the phone frame
- `autoPlay loop muted playsInline` ensures silent autoplay on all browsers
- Remove the `bg-white` from the phone container so the blend works against the page background
- Keep the glow behind phone, the border frame, and rounded corners

## Files Changed


| File                                     | Change                                           |
| ---------------------------------------- | ------------------------------------------------ |
| `public/videos/mockup_video.mp4`         | New — copied from upload                         |
| `src/components/landing/HeroSection.tsx` | Replace static mockup content with video element |
