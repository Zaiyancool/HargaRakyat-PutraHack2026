# Lovable Environment Secrets Fix

## Problem Summary
The Lovable platform blocks certain keywords in secret names:
- ❌ Blocks "vite" keyword  
- ❌ Blocks "supabase" keyword
- This causes naming like `VITE_SUPABASE_URL` and `SUPABASE_URL` to be rejected

## What's Wrong
❌ **REJECTED by Lovable** (contain blocked keywords):
- `VITE_SUPABASE_URL` (contains both "vite" and "supabase")
- `SUPABASE_URL` (contains "supabase")
- `SUPABASE_ANON_KEY` (contains "supabase")
- `VITE_SUPABASE_ANON_KEY` (contains both keywords)
- Old `SUPA_PUBLISHABLE_KEY` (had wrong key type - PUBLISHABLE instead of ANON)

## What's Correct for Lovable
✅ **ACCEPTED by Lovable** (no blocked keywords):
- `SUPA_URL` = `https://fuqokqlhinximscitejg.supabase.co`
- `SUPA_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cW9rcWxoaW54aW1zY2l0ZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1Mzc0MTksImV4cCI6MjA5MTExMzQxOX0.qR3A0lY6fgFgP0RVr3cRsg-pE5pSw2zAkZ9-1qvPYO0`
- `SUPA_PROJECT_ID` = `fuqokqlhinximscitejg`

## Steps to Fix in Lovable Dashboard

1. **Delete ALL the wrong secrets** by clicking the trash icon:
   - Delete any with "VITE_" prefix
   - Delete any with "SUPABASE" keyword
   - Delete old `SUPA_PUBLISHABLE_KEY` if it exists

2. **Add these CORRECT secrets** using the `+ Add another` button:
   
   Secret 1:
   - Name: `SUPA_URL`
   - Value: `https://fuqokqlhinximscitejg.supabase.co`
   
   Secret 2:
   - Name: `SUPA_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cW9rcWxoaW54aW1zY2l0ZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1Mzc0MTksImV4cCI6MjA5MTExMzQxOX0.qR3A0lY6fgFgP0RVr3cRsg-pE5pSw2zAkZ9-1qvPYO0`
   
   Secret 3:
   - Name: `SUPA_PROJECT_ID`
   - Value: `fuqokqlhinximscitejg`

3. **Click Save** button after each secret

## Changes Made to Source Code

✅ **Fixed [src/integrations/supabase/client.ts]**:
- Added fallback logic to support MULTIPLE naming conventions:
  - Tries `VITE_SUPABASE_URL` first (for GitHub/Vercel)
  - Falls back to `SUPA_URL` if not found (for Lovable)
  - Same for ANON_KEY variables
- Code now works on BOTH platforms without modification

✅ **Fixed [index.html]**:
- Removed `frame-ancestors 'none'` from CSP meta tag
- (Note: frame-ancestors must be set via HTTP headers, not in HTML)

## Deployment Configuration Summary

**GitHub/Vercel secrets** (use `VITE_` prefix):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PROJECT_ID
VITE_SITE_URL
VITE_LOCALHOST_URL
```

**Lovable secrets** (use `SUPA_` prefix - no blocked keywords):
```
SUPA_URL
SUPA_ANON_KEY
SUPA_PROJECT_ID
```

## Why This Works

- Lovable **blocks** "vite" and "supabase" keywords in secret names
- Solution: Use shortened prefix `SUPA_` instead of full keyword
- Code checks both naming styles, so same codebase works everywhere

## Next Steps

1. In Lovable dashboard, delete all old secrets
2. Add the 3 correct secrets with `SUPA_` prefix only
3. Click Save
4. Redeploy on Lovable
5. Test at `https://gitlauk-hargarakyat.lovable.app/`
