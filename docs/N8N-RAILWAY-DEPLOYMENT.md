# Deploy n8n on Railway with Custom Domain

## Step 1: Deploy n8n Template

1. **Go to**: https://railway.com/deploy/n8n
2. **Click**: "Deploy Now" button
3. **Login**: Use your GitHub account (same one you used for Winston bot)
4. **Wait**: Railway will automatically:
   - Create PostgreSQL database
   - Deploy n8n instance
   - Configure environment variables
   - Provision SSL certificate

**This takes about 2-3 minutes.**

## Step 2: Get Your Railway Domain

After deployment completes:

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Click on your new n8n project
3. Click on the n8n service (not the database)
4. Click on **"Settings"** tab
5. Scroll to **"Networking"** section
6. You'll see a generated domain like: `n8n-production.up.railway.app`

**Copy this domain** - you'll need it for testing.

## Step 3: Add Custom Domain

Still in the Settings tab:

1. Scroll to **"Custom Domain"** section
2. Click **"Add Domain"**
3. Enter: `n8n.level7labs.ai`
4. Railway will show you a **CNAME record** value like:
   ```
   CNAME: railway.app or [unique-value].railway.app
   ```

**Keep this window open** - you need this value for DNS.

## Step 4: Configure DNS (Cloudflare or Your DNS Provider)

### If using Cloudflare:

1. Go to: https://dash.cloudflare.com
2. Select domain: `level7labs.ai`
3. Click **DNS** tab
4. Click **"Add record"**
5. Fill in:
   - **Type**: CNAME
   - **Name**: `n8n`
   - **Target**: [Railway CNAME value from Step 3]
   - **Proxy status**: **DNS only** (click the cloud icon to turn off proxy)
   - **TTL**: Auto
6. Click **"Save"**

### If using another DNS provider:

1. Login to your DNS provider
2. Add CNAME record:
   - **Host/Name**: `n8n`
   - **Points to**: [Railway CNAME value from Step 3]
   - **TTL**: 3600 (or Auto)

## Step 5: Wait for DNS Propagation

- DNS changes take 1-5 minutes to verify
- Railway will automatically detect when DNS is configured
- You'll see a green checkmark next to your custom domain when ready

## Step 6: Update n8n Environment Variables

Back in Railway, go to your n8n service:

1. Click **"Variables"** tab
2. Find or add these variables:
   - **N8N_HOST**: `n8n.level7labs.ai`
   - **WEBHOOK_URL**: `https://n8n.level7labs.ai`
3. Click **"Deploy"** to restart with new config

## Step 7: Test Your n8n Instance

1. Open browser: `https://n8n.level7labs.ai`
2. You should see n8n setup screen
3. Create your admin account:
   - Email: [your email]
   - Password: [strong password]
4. Complete setup wizard

## Troubleshooting

### Domain not connecting:
- Check DNS record is set to "DNS only" (not proxied) if using Cloudflare
- Wait 5-10 minutes for DNS propagation
- Verify CNAME value matches Railway's provided value exactly

### 502 Bad Gateway:
- n8n service is still starting, wait 2-3 minutes
- Check Railway logs for errors

### Can't access setup:
- Make sure N8N_HOST and WEBHOOK_URL are set correctly
- Redeploy the service after changing variables

## Cost Estimate

- Railway free tier: **$5/month credit**
- n8n usage: ~$3-4/month
- **Net cost**: $0-1/month (covered by free credit)

## Next Steps

After n8n is running:

1. Create workflows
2. Connect to Slack (Winston bot can trigger n8n workflows!)
3. Add MCP server for n8n integration with Claude

---

**Need help?** Check Railway logs in the Deployments tab if anything fails.
