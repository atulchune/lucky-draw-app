# Environment Variables Setup Guide

This guide shows you how to set up all required environment variables for the Lucky Draw Contest Platform.

## Getting Your Supabase Credentials

### Step 1: Go to Your Supabase Project

1. Visit [https://app.supabase.com](https://app.supabase.com)
2. Log in with your account
3. Select your project `v0-lucky-draw-app`

### Step 2: Find Your Credentials

In your Supabase dashboard:

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** in the submenu
3. You'll see:
   - **Project URL** - Your Supabase URL
   - **Service Role Key** - Server-side secret key
   - **Anon Public Key** - Public client-side key

## Environment Variables

### Local Development (.env.local)

Create a `.env.local` file in your project root with these variables:

```
# Supabase API URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Key (Public - safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (Secret - NEVER expose)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email confirmation redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### How to Get Each Value:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - In Supabase Dashboard → Settings → API
   - Copy the "Project URL" field
   - Example: `https://abcdefghijk.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - In Supabase Dashboard → Settings → API
   - Copy the "anon public" key (starts with `eyJhbGc...`)
   - This key is public, so it's safe to expose in the browser

3. **SUPABASE_SERVICE_ROLE_KEY**
   - In Supabase Dashboard → Settings → API
   - Copy the "service_role" secret key (starts with `eyJhbGc...`)
   - ⚠️ NEVER share this key or commit it to git!

4. **NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL**
   - For local development: `http://localhost:3000/dashboard`
   - This is where users will be redirected after confirming their email

## Vercel Deployment

### Step 1: Create Vercel Project

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Connect your GitHub repository
3. Click "Deploy"

### Step 2: Add Environment Variables in Vercel

After deployment:

1. Go to your Vercel project dashboard
2. Click **Settings** at the top
3. Click **Environment Variables** in the left sidebar
4. Add each variable:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-here
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: your-service-role-key-here
```

```
Name: NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
Value: https://your-vercel-project.vercel.app/dashboard
```

### Step 3: Set Environment Variables for Each Environment

You can set different values for:
- **Production** - Your main deployed app
- **Preview** - For pull requests
- **Development** - For local development

For Lucky Draw:
- Production: `https://your-vercel-project.vercel.app/dashboard`
- Preview: `https://your-project-preview-branch.vercel.app/dashboard`
- Development: `http://localhost:3000/dashboard`

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the three dots on your latest deployment
3. Click "Redeploy"

## Supabase Email Configuration

### Enable Email Confirmation

1. Go to Supabase Dashboard → Authentication
2. Click **Providers** in the sidebar
3. Scroll to **Email**
4. Enable "Confirm email"
5. Set email redirect path to: `/dashboard`

### Test Email Confirmation

1. Sign up with a test email
2. Check your email inbox (might be in spam)
3. Click the confirmation link
4. You'll be redirected to your dashboard
5. Log in with your email and password

## Troubleshooting

### "Invalid API Key" Error
- Check that you copied the full anon key
- Verify the key starts with `eyJhbGc`
- Make sure there are no extra spaces

### "Project URL is invalid" Error
- Copy the full URL including the subdomain
- Example: `https://abcdefghijk.supabase.co` (not just `abcdefghijk.supabase.co`)

### Email Confirmation Not Working
- Check Supabase email settings are enabled
- Verify the redirect URL is correct in your env variables
- Check email provider settings in Supabase
- Test with a real email address (not a test email)

### Vercel Deployment Shows Blank Page
- Ensure all 4 environment variables are added
- Redeploy after adding variables
- Check build logs for errors in Vercel dashboard

## Summary of Required Variables

| Variable | Where to Find | Public? | Example |
|----------|---------------|---------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Settings → API → Project URL | Yes | https://abc123.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Settings → API → anon public | Yes | eyJhbGc... |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Settings → API → service_role | No | eyJhbGc... |
| NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL | Custom | Yes | https://yourdomain.com/dashboard |

## Still Having Issues?

1. Clear your browser cache
2. Restart the development server (`pnpm dev`)
3. Check the browser console for error messages
4. Check the Vercel deployment logs
5. Verify all 4 variables are set in your environment
