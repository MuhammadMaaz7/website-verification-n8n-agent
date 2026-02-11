# ⚡ Quick Start Guide

Get your Website Verification Agent running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd frontend
npm install
```

## Step 2: Start Development Server (30 sec)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 3: Test the Application (2 min)

### Option A: Manual Entry
1. Click "Manual Entry" tab
2. Enter:
   - Company Name: `Google`
   - URL: `https://google.com`
3. Click "Validate Website"
4. Watch real-time validation!

### Option B: CSV Upload
1. Click "CSV Upload" tab
2. Click "Sample CSV" to download test data
3. Upload the downloaded CSV
4. Watch batch processing!

### Option C: Bulk Paste
1. Click "Bulk Paste" tab
2. Paste this:
```
Google, https://google.com
GitHub, https://github.com
Microsoft, https://microsoft.com
```
3. Click "Validate All"

## Step 4: View Results (1 min)

Results appear on the right side with:
- ✅ Availability status
- 🔄 Redirect detection
- 📊 Brand presence score
- ⏱️ Response time

Export results using "Export CSV" or "Export JSON" buttons.

## Using with n8n (Optional)

### Quick n8n Setup

1. Install n8n:
```bash
npm install -g n8n
n8n start
```

2. Create workflow:
   - Open http://localhost:5678
   - Import workflow from `N8N_WORKFLOW.md`
   - Activate workflow

3. Update frontend:
```bash
# Create .env.local
echo "NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/validate" > .env.local

# Restart dev server
npm run dev
```

## Troubleshooting

### Port 3000 already in use?
```bash
# Use different port
PORT=3001 npm run dev
```

### n8n not connecting?
- Check n8n is running: http://localhost:5678
- Verify webhook URL in `.env.local`
- Check browser console for errors

### CSV upload not working?
- Ensure CSV format: `company_name,url`
- Check file has header row
- Try sample CSV first

## Next Steps

1. Read [README.md](./README.md) for full documentation
2. Check [WINNING_STRATEGY.md](./WINNING_STRATEGY.md) for demo tips
3. Review [N8N_WORKFLOW.md](./N8N_WORKFLOW.md) for backend setup

## Demo Mode

The app works without n8n using a mock API at `/api/validate`. Perfect for:
- Quick demos
- Frontend development
- Testing UI/UX

To use real validation, set up n8n workflow.

## Production Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variable in Vercel dashboard:
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` = your n8n webhook URL

### Deploy n8n

Options:
1. **n8n Cloud** - https://n8n.io/cloud (easiest)
2. **Self-hosted** - Docker, Railway, Render
3. **Local tunnel** - ngrok for testing

## Support

Having issues? Check:
1. Node.js version (18+)
2. npm version (9+)
3. Browser console for errors
4. Network tab for API calls

## Tips for Hackathon Demo

1. **Pre-load data** - Have CSV ready
2. **Test beforehand** - Run through demo flow
3. **Show all features** - Manual, CSV, bulk, export
4. **Highlight uniqueness** - Brand scoring, redirects
5. **Be confident** - You built something amazing!

Good luck! 🚀
