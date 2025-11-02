# Fix n8n Custom Domain - Railway URL Works, Custom Domain Doesn't

## Status
- ✅ Railway URL works: `https://hvwqocva.up.railway.app`
- ✅ n8n is running correctly
- ✅ DNS CNAME is correct: `hvwqocva.up.railway.app`
- ❌ Custom domain doesn't work: `https://n8n.level7labs.ai`

## Root Cause
Railway hasn't fully verified or linked the custom domain to the service.

---

## Solution: Remove and Re-add Custom Domain

### Step 1: Remove Current Custom Domain

1. Go to Railway → Your n8n service → **"Settings"** tab
2. Scroll to **"Networking"** → **"Domains"** section
3. Find `n8n.level7labs.ai`
4. Click the **three dots (⋯)** next to it
5. Click **"Remove"**
6. Confirm removal

### Step 2: Wait 30 Seconds

Give Railway time to clear the old configuration.

### Step 3: Add Custom Domain Again

1. Still in **"Settings"** → **"Networking"**
2. Click **"+ Custom Domain"** button
3. Enter: `n8n.level7labs.ai`
4. Click **"Add"**

### Step 4: Wait for Verification

Railway will:
1. Check the DNS CNAME record (should be instant since it's already set)
2. Provision an SSL certificate (takes 1-2 minutes)
3. Show a **green checkmark ✅** when ready

**You should see:**
```
✅ n8n.level7labs.ai
   CNAME: hvwqocva.up.railway.app
   Status: Verified
```

### Step 5: Check Target Port

After re-adding:
1. Click the **three dots (⋯)** next to `n8n.level7labs.ai`
2. Click **"Edit"**
3. Verify **Target Port** = **5678**
4. Click **"Save"**

### Step 6: Test

Wait 30 seconds, then try:
```bash
curl -I https://n8n.level7labs.ai
```

Should return: **HTTP/2 200** or a redirect to n8n login page.

---

## Alternative: Check SSL Certificate Provisioning

If the domain shows verified but still doesn't work:

### Railway might still be provisioning SSL

1. Go to **"Settings"** → **"Networking"**
2. Look at the custom domain entry
3. Check for status indicators:
   - ✅ **Green checkmark** = SSL ready
   - ⏳ **Yellow/pending** = SSL provisioning
   - ❌ **Red X** = DNS issue

If it's stuck on yellow/pending:
- Wait 5 minutes (SSL can take time)
- Try removing and re-adding the domain
- Check if Cloudflare proxy is OFF (should be "DNS only")

---

## Check Cloudflare Settings (If Using Cloudflare)

If your domain is on Cloudflare:

1. Go to Cloudflare dashboard: https://dash.cloudflare.com
2. Select `level7labs.ai` domain
3. Go to **DNS** tab
4. Find the `n8n` CNAME record
5. Make sure:
   - **Proxy status**: **DNS only** (gray cloud ☁️, NOT orange 🟠)
   - **Target**: `hvwqocva.up.railway.app`

If the cloud is orange (proxied):
1. Click the orange cloud to turn it gray
2. Save
3. Wait 2 minutes for DNS propagation
4. Test again

**Why?** Cloudflare proxy interferes with Railway's SSL certificate provisioning.

---

## Update n8n Environment Variables

After custom domain works, update these in Railway:

1. Go to **"Variables"** tab
2. Update:
   ```
   N8N_HOST=n8n.level7labs.ai
   WEBHOOK_URL=https://n8n.level7labs.ai
   ```
3. Click **"Redeploy"** in Deployments tab

---

## Quick Checklist

- [ ] Railway URL works: `https://hvwqocva.up.railway.app`
- [ ] Custom domain removed from Railway
- [ ] Custom domain re-added to Railway
- [ ] Domain shows green checkmark in Railway
- [ ] Target port is 5678
- [ ] Cloudflare proxy is OFF (DNS only)
- [ ] Waited 2 minutes after changes
- [ ] `curl -I https://n8n.level7labs.ai` returns 200

---

## Expected Result

After fixing:

```bash
$ curl -I https://n8n.level7labs.ai

HTTP/2 200
content-type: text/html; charset=utf-8
server: railway-edge
```

And opening `https://n8n.level7labs.ai` in browser shows the n8n login/setup page.

---

## If Still Not Working

Send me:
1. Screenshot of Railway → Settings → Networking → Domains section
2. Is there a green checkmark next to `n8n.level7labs.ai`?
3. What does this show: `curl -v https://n8n.level7labs.ai 2>&1 | head -30`

The issue is 100% Railway's custom domain linking. Let's get it working!
