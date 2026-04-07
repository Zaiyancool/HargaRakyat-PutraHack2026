# Authentication Setup & Testing Guide

## ✅ What's Been Created

### 1. **Supabase Auth Configuration**
- Email/password authentication provider
- Google OAuth provider (requires credentials)
- Session management with localStorage persistence
- Email verification ready

### 2. **Frontend Implementation**

#### Files Created:
- `src/hooks/useAuth.ts` — Auth state management hook
- `src/contexts/AuthContext.tsx` — Global auth context provider
- `src/pages/Login.tsx` — Professional login page
- `src/pages/Signup.tsx` — Registration page with validation
- `src/pages/AuthCallback.tsx` — OAuth redirect handler
- `src/components/ProtectedRoute.tsx` — Route protection wrapper

#### Files Modified:
- `src/App.tsx` — Added auth routes + provider
- `src/components/DashboardHeader.tsx` — Added user menu + logout

---

## 🔧 STEP-BY-STEP SUPABASE CONFIGURATION

### **PART 1: Email Authentication (5 minutes)**

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Select your project: "HargaRakyat"

2. **Navigate to Authentication**
   - Left sidebar → **Authentication**
   - Click **Providers** tab

3. **Enable Email Provider**
   - Find "Email" in the providers list
   - Toggle the switch to **ON**
   - Settings to verify:
     - ✅ **Confirm email**: OFF (users can login immediately)
     - ✅ **Double confirm changes**: OFF
     - ✅ **Confirm email change**: OFF
   - Click **Save**

✅ **Email auth is now active!**

---

### **PART 2: Google OAuth (10 minutes) — Optional but Recommended**

#### **Step 1: Create Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click **Create Project**
   - Name: "HargaRakyat"
   - Click **Create**
   - Wait for project to initialize (2 minutes)

3. Enable Google+ API:
   - Search for "Google+ API" at top
   - Click **Enable**

4. Create OAuth Consent Screen:
   - Left sidebar → **OAuth consent screen**
   - Choose: **External** → **Create**
   - Fill in:
     - **App name**: HargaRakyat
     - **User support email**: your-email@example.com
     - **Developer contact**: your-email@example.com
   - Click **Save and Continue**
   - Skip "Scopes" → **Save and Continue**
   - Skip "Test users" → **Save and Continue**

5. Create OAuth Credentials:
   - Left sidebar → **Credentials**
   - Click **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: "HargaRakyat Web"
   - **Authorized redirect URIs**: Add one URI:
     - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
     - *Find YOUR_SUPABASE_PROJECT_ID in: Supabase Dashboard → Settings → API → Project URL*
   - Click **Create**
   - A popup shows your **Client ID** and **Client Secret** → Copy both

#### **Step 2: Add Credentials to Supabase**

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** → Toggle **ON**
3. Paste:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. Click **Save**

✅ **Google OAuth is now active!**

---

### **PART 3: Configure Email Templates (Optional but Nice)**

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize templates (optional):
   - Keep defaults for now, or customize greeting/copy
3. **Magic Link URL** should point to:
   - `https://gitlauk-hargarakyat.lovable.app/auth-callback`
   - *(Replace with your actual domain when deployed)*

---

## 🚀 TESTING THE AUTH FLOW

### **Test 1: Email Signup**
1. Open your app → Click **Sign Up**
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test1234` (must have uppercase + number)
   - Confirm password: `Test1234`
   - Check: "I agree to Terms..."
3. Click **Create Account**
4. ✅ Should see success message → redirects to dashboard
5. ✅ Dashboard header shows user email + user menu

### **Test 2: Email Login**
1. Sign out (click user menu → Sign Out)
2. Click **Sign In**
3. Fill in:
   - Email: `test@example.com`
   - Password: `Test1234`
4. Click **Sign In**
5. ✅ Should redirect to dashboard

### **Test 3: Session Persistence**
1. Sign in with email
2. Refresh page (Cmd+R or F5)
3. ✅ Dashboard should load (user still logged in)
4. ✅ Dashboard header still shows user email

### **Test 4: Logout**
1. Click user dropdown (top-right with email)
2. Click **Sign Out**
3. ✅ Redirects to home
4. ✅ Dashboard header shows "Sign In" / "Sign Up" buttons

### **Test 5: Google OAuth** *(if set up)*
1. Click **Sign Up** or **Sign In**
2. Click **Google** button
3. ✅ Redirects to Google login
4. ✅ Google login → redirects back to `/auth-callback`
5. ✅ Then redirects to dashboard

### **Test 6: Protected Routes**
1. Sign out
2. Try to manually navigate to `/dashboard`
3. ✅ Should redirect to `/login` (you can't access without auth)
4. Sign in again
5. ✅ Now you can access `/dashboard`

### **Test 7: Password Validation**
1. Go to **Sign Up**
2. Try weak password: `test` → Should show error "Min 6 characters..."
3. Try `test1234` → Should show error "Must contain uppercase"
4. Try `Test1` → Should show error "Min 6 characters"
5. Try `Test1234` → ✅ Should accept

---

## 🐛 Troubleshooting

### **Google Login Fails**
- **Issue**: "Redirect URI mismatch"
- **Fix**: Make sure redirect URI in Google Cloud is EXACTLY:
  - `https://[PROJECT_ID].supabase.co/auth/v1/callback`
  - Not `https://[PROJECT_ID].supabase.co/auth/v1/callback/`  (no trailing slash)

### **Email Signup Succeeds But Can't Login**
- **Issue**: Email might not be verified
- **Fix**: In Supabase, go to **Authentication** → **Providers** → uncheck "Confirm email" temporarily for testing
  - OR check email verification instructions in console

### **Session Doesn't Persist**
- **Issue**: Refresh loses auth state
- **Fix**: Check browser localStorage:
  - Open DevTools → Application → Local Storage
  - Should see key: `sb-[PROJECT_ID]-auth-token`
  - If missing, browser is not storing sessions

### **Dropdown Menu Not Appearing**
- **Issue**: Dropdown-menu component might not be imported
- **Fix**: Make sure `@/components/ui/dropdown-menu` exists
  - If not, run: `npx shadcn-ui@latest add dropdown-menu`

---

## 📊 Auth Flow Architecture

```
User → /signup or /login
    ↓
useAuthContext (from AuthProvider)
    ↓
useAuth hook (calls Supabase)
    ↓
Supabase Auth Client
    ↓
Email provider OR Google OAuth
    ↓
Session stored in localStorage
    ↓
Auth state updates globally
    ↓
Components read from useAuthContext
    ↓
ProtectedRoute checks auth before showing pages
```

---

## 🔒 Security Features Implemented

✅ Passwords require: minimum 6 chars, 1 uppercase, 1 number  
✅ Sessions stored in browser localStorage (persistent)  
✅ Auto-refresh tokens (stays logged in even if session expires)  
✅ Email verification ready (can enable in Supabase)  
✅ Protected routes prevent unauthorized access  
✅ Logout properly clears session  
✅ Google OAuth uses proper redirect flow  

---

## 📝 Next Steps

1. **Test all flows above** ✅
2. **Create Favorites table** (Phase 3)
   - Requires seeing logged-in user ID
   - Will add "Favorites" page with ProtectedRoute
3. **Add Dark Mode** (Phase 4)
4. **Add E-commerce Links** (Phase 5)
5. **Deploy to Lovable** and test in production

---

## 🎯 Success Criteria

After testing, you should be able to:

- [ ] Sign up with email
- [ ] Sign in with email  
- [ ] See user profile dropdown
- [ ] Log out
- [ ] Session persists after refresh
- [ ] Can't access protected routes without login
- [ ] Google OAuth works (optional but nice)
- [ ] No errors in browser console

Once all ✅, **Phase 3 (Favorites)** is ready to start!

---

**Estimated time to complete setup**: 20-30 minutes  
**Estimated time to test all flows**: 15 minutes  
**Total**: ~1 hour
