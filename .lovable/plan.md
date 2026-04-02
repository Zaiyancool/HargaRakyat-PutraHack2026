

# Remove Sign-In, Get Started & Auth-Related UI

## What Changes

Remove all authentication-related buttons and CTAs across the site since there's no auth system and no time to build one for the hackathon.

## Changes by File

### 1. `src/components/landing/TopNav.tsx`
- **Desktop**: Remove the "Sign In" button, "Get Started" button, and the Search icon button (lines 62-75)
- **Mobile**: Remove the auth buttons section at the bottom of the mobile drawer (lines 114-118)

### 2. `src/components/landing/HeroSection.tsx`
- Remove the entire email input + "Sign Up" button CTA block (lines 66-79 — the email input, button, and "Free to use" text)
- Replace with a simple "Explore Dashboard" button linking to `/dashboard`

### 3. `src/components/landing/ItemGrid.tsx`
- Remove the CTA block below the marquee (lines 118-124 — "Sign up to track price changes" text + button)

### 4. `src/components/landing/WhySection.tsx`
- Keep the "Get started with HargaRakyat" button since it just links to `/dashboard` — it's not auth-related
- Remove the "No sign up required" text on line 139 (no longer relevant)

## No other auth functionality found
No favourite/bookmark features, no protected routes, no auth state management exists in the codebase — just these UI buttons.

