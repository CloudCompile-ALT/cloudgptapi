# 🔑 CloudGPT Keys Setup Guide

This guide explains how to set up all the required API keys and environment variables for CloudGPT to function properly.

## Required Environment Variables

Create a `.env.local` file in the root of your project (for local development) or configure these in your Vercel project settings.

```env
# Logto Authentication (Required)
LOGTO_ENDPOINT=https://your-logto-instance.com
LOGTO_APP_ID=your_app_id
LOGTO_APP_SECRET=your_app_secret
LOGTO_COOKIE_SECRET=your_cookie_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Provider Keys (At least one recommended)
POLLINATIONS_API_KEY=your_pollinations_api_key
POLLINATIONS_API_KEY_2=your_second_pollinations_api_key
ROUTEWAY_API_KEY=your_routeway_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
MERIDIAN_API_KEY=your_meridian_api_key
```

## Setting Up Each Service

### 1. Logto Authentication (Required)

Logto handles user authentication and account management.

1. Set up a Logto instance (using Docker or Cloud)
2. Create a "Next.js (App Router)" application in Logto
3. In the Logto Dashboard, go to your application details
4. Copy the **Endpoint** → `LOGTO_ENDPOINT`
5. Copy the **App ID** → `LOGTO_APP_ID`
6. Copy the **App Secret** → `LOGTO_APP_SECRET`
7. Generate a random string for `LOGTO_COOKIE_SECRET`
8. Set `NEXT_PUBLIC_BASE_URL` to your application's base URL (e.g., `http://localhost:3000` or `https://your-domain.com`)

**Where to put them:**
- **Local Development**: `.env.local` file
- **Deployment**: Environment Variables in your hosting provider (Vercel, etc.)

**Important:** Never commit real keys to version control. Only use placeholder values in code examples.

### 2. Pollinations API Key (Recommended)

Pollinations provides text, image, and video generation capabilities.

1. Go to [pollinations.ai](https://pollinations.ai)
2. Create an account at [enter.pollinations.ai](https://enter.pollinations.ai)
3. Navigate to your dashboard
4. Create a new API key (Secret Key `sk_` for server-side use)
5. Copy the key → `POLLINATIONS_API_KEY`

**Multiple API Keys for Load Distribution:**

You can configure multiple Pollinations API keys to split costs and improve rate limits:
- `POLLINATIONS_API_KEY` - Your primary API key
- `POLLINATIONS_API_KEY_2` - Your secondary API key (optional)

The system will automatically distribute requests across all configured keys using random selection. This helps:
- Split API costs across multiple billing accounts
- Improve effective rate limits
- Provide redundancy if one key reaches its limit

**Note:** The API works without a key but with stricter rate limits.

### 3. Routeway API Key (Optional)

Routeway provides access to free high-performance models.

1. Go to [api.routeway.ai](https://api.routeway.ai)
2. Sign up for an account
3. Navigate to the API section
4. Generate a new API key
5. Copy the key → `ROUTEWAY_API_KEY`

### 4. OpenRouter API Key (Optional)

OpenRouter provides access to a massive selection of models.

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to the Keys section
4. Create a new key
5. Copy the key → `OPENROUTER_API_KEY`

### 5. Meridian API Key (Optional)

Meridian provides specialized cognitive substrate with persistent memory.

1. Go to [meridianlabsapp.website](https://meridianlabsapp.website)
2. Sign up for an account
3. Generate a new API key
4. Copy the key → `MERIDIAN_API_KEY`

## Vercel Deployment Configuration

When deploying to Vercel:

1. Click the "Deploy to Vercel" button in the README
2. Connect your GitHub repository
3. In the deployment configuration, add all environment variables:
   - `LOGTO_ENDPOINT`
   - `LOGTO_APP_ID`
   - `LOGTO_APP_SECRET`
   - `LOGTO_COOKIE_SECRET`
   - `NEXT_PUBLIC_BASE_URL`
   - `POLLINATIONS_API_KEY`
   - `POLLINATIONS_API_KEY_2` (optional, for load distribution)
   - `ROUTEWAY_API_KEY`
   - `OPENROUTER_API_KEY`
   - `MERIDIAN_API_KEY`
4. Deploy!

### Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Navigate to **Environment Variables**
4. Add each variable with the appropriate value
5. Make sure to add them for all environments (Production, Preview, Development)

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit `.env.local` to version control**
   - The `.gitignore` file should already exclude it
   
2. **Use different keys for development and production**
   - Create separate Clerk applications for dev/prod
   - Use separate API keys where possible

3. **Rotate keys periodically**
   - Regularly rotate your API keys
   - Update them in Vercel after rotation

4. **Monitor usage**
   - Check your Clerk and Pollinations dashboards for unusual activity
   - Set up usage alerts where available

## Troubleshooting

### "Logto: Missing configuration"
- Ensure `LOGTO_ENDPOINT`, `LOGTO_APP_ID`, and `LOGTO_APP_SECRET` are set.
- Verify `NEXT_PUBLIC_BASE_URL` is correct and matches your Logto redirect URI.

### "Logto: Invalid cookie secret"
- Ensure `LOGTO_COOKIE_SECRET` is a long, random string.

### "Rate limit exceeded"
- You may need to add/upgrade your Pollinations API key
- Anonymous requests have stricter limits

### API calls failing
- Check if the API keys are correctly configured
- Verify the keys are valid and not expired
- Check the Vercel function logs for detailed errors

## Example .env.local File

```env
# Copy this file to .env.local and fill in your values

# Logto (Required)
LOGTO_ENDPOINT=https://your-logto-instance.com
LOGTO_APP_ID=your_app_id
LOGTO_APP_SECRET=your_app_secret
LOGTO_COOKIE_SECRET=your_cookie_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Providers (Optional but recommended)
POLLINATIONS_API_KEY=your_pollinations_key_here
POLLINATIONS_API_KEY_2=your_second_pollinations_key_here
MAPLEAI_API_KEY=your_mapleai_key_here
```

## Need Help?

- [Clerk Documentation](https://clerk.com/docs)
- [Pollinations Documentation](https://pollinations.ai/docs)
- [MapleAI Documentation](https://docs.mapleai.de)
- [Open an Issue](https://github.com/CloudCompile/cloudgpt/issues)
