# BizEmbassy Netlify Functions

This directory contains **only the Netlify functions** for the BizEmbassy waitlist. The main website remains hosted on GitHub Pages.

## Setup

### 1. Create a Netlify Site for Functions Only

1. Create a new repository on GitHub: `BizEmbassy/netlify-functions`
2. Push this `netlify-functions/` folder content to that repository
3. Connect the repository to Netlify
4. Configure build settings:
   - **Build command:** Leave empty
   - **Publish directory:** `public`
   - **Functions directory:** `functions`

### 2. Set Environment Variables in Netlify

In your Netlify site dashboard, go to **Site settings** → **Environment variables** and add:

```
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_personal_access_token_here
AIRTABLE_BASE_ID=your_actual_base_id_here
AIRTABLE_TABLE_NAME=Waitlist
NODE_ENV=production
```

### 3. Update Your GitHub Pages Website

In your main website's JavaScript (`website/scripts/main.js`), update the function URL:

```javascript
const NETLIFY_FUNCTION_URL =
  "https://your-actual-netlify-site.netlify.app/submit-waitlist";
```

Replace `your-actual-netlify-site` with your actual Netlify site name.

## Architecture

```
GitHub Pages (bizembassy.github.io/website)
    ↓ (form submission)
Netlify Functions (your-functions-site.netlify.app/submit-waitlist)
    ↓ (API call)
Airtable (your waitlist data)
```

## Benefits

- ✅ Keep your existing GitHub Pages hosting
- ✅ Only pay for Netlify function usage (very minimal cost)
- ✅ Secure API key storage
- ✅ No need to migrate your entire site

## Local Testing

```bash
cd netlify-functions/
npm install -g netlify-cli

# Create .env file with your Airtable credentials
echo "AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token" > .env
echo "AIRTABLE_BASE_ID=your_base_id" >> .env
echo "AIRTABLE_TABLE_NAME=Waitlist" >> .env

# Start local development
netlify dev
```

Your function will be available at `http://localhost:8888/submit-waitlist`

## Deployment

Just push changes to your functions repository - Netlify will automatically redeploy.
