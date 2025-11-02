# Fix n8n 404 "Application not found" - Service Running But Not Accessible

## Problem
- ✅ Build is successful (green)
- ✅ No errors in logs
- ❌ Domain returns 404 "Application not found"
- ❌ Can't access n8n

## Root Cause
Railway can't route traffic to your n8n service because:
1. **Port configuration is wrong**
2. **Public networking isn't properly enabled**
3. **Domain target port is incorrect**

---

## Solution 1: Fix Port Configuration (Most Common)

### Check Current Settings

1. Go to Railway → Your n8n service → **"Variables"** tab
2. Check if `PORT` variable exists and equals `5678`
3. Check if `N8N_PORT` exists (if so, remove it - it conflicts)

### Add Missing Port Variables

Click **"New Variable"** and add:

```
N8N_PORT=5678
N8N_LISTEN_ADDRESS=0.0.0.0
```

**Then redeploy:**
1. Go to **"Deployments"** tab
2. Click "Redeploy" on latest deployment
3. Wait 2 minutes for restart

---

## Solution 2: Check Public Networking

### Verify Domain is Generated

1. Go to **n8n service** → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Under **"Public Networking"**, you should see:
   - **Railway domain**: `hvwqocva.up.railway.app` (or similar)
   - **Custom domain**: `n8n.level7labs.ai`

### If Railway Domain is Missing:

1. Click **"Generate Domain"**
2. Railway should auto-detect port 5678
3. If it asks for a port, enter: **5678**
4. Wait 30 seconds, then test the new Railway domain

---

## Solution 3: Check Target Port

If domain exists but doesn't work:

1. Go to **"Settings"** → **"Networking"**
2. Find your Railway domain (`hvwqocva.up.railway.app`)
3. Click the **three dots (...)** next to it
4. Click **"Edit"**
5. Make sure **Target Port** = **5678**
6. Click **"Save"**

Do the same for your custom domain `n8n.level7labs.ai`.

---

## Solution 4: Check Logs for Port Binding

Even if there are "no errors", check if n8n is actually listening:

1. Go to **"Deployments"** tab
2. Click on latest deployment
3. Look for log lines like:
   ```
   n8n ready on 0.0.0.0:5678
   Editor is now accessible via: http://0.0.0.0:5678
   ```

### If you DON'T see these lines:

n8n isn't starting properly. Check for:
- Database connection errors
- Missing environment variables
- Startup failures

---

## Solution 5: Complete Environment Variable List

Go to **"Variables"** and ensure these exist:

### Required n8n Variables:
```
N8N_PORT=5678
N8N_LISTEN_ADDRESS=0.0.0.0
N8N_HOST=n8n.level7labs.ai
WEBHOOK_URL=https://n8n.level7labs.ai
N8N_PROTOCOL=https
```

### Database Variables (should exist from template):
```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{Postgres.RAILWAY_PRIVATE_DOMAIN}}
DB_POSTGRESDB_PORT=${{Postgres.PGPORT}}
DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}
```

### Railway Variables (should auto-exist):
```
PORT=5678
```

**After adding/changing variables, always redeploy!**

---

## Solution 6: Remove and Re-add Custom Domain

Sometimes Railway's domain verification gets stuck:

1. Go to **"Settings"** → **"Networking"**
2. Find `n8n.level7labs.ai`
3. Click **three dots (...)** → **"Remove"**
4. Wait 10 seconds
5. Click **"+ Custom Domain"**
6. Re-enter: `n8n.level7labs.ai`
7. Verify it shows green checkmark (DNS verified)

---

## Quick Test Script

Run this to see what's actually responding:

```bash
# Test Railway domain
curl -v https://hvwqocva.up.railway.app 2>&1 | grep -E "(HTTP|Location|Server)"

# Test custom domain
curl -v https://n8n.level7labs.ai 2>&1 | grep -E "(HTTP|Location|Server)"
```

Look for:
- **HTTP/2 200** = Working! ✅
- **HTTP/2 404** = Service not found ❌
- **HTTP/2 502** = Service crashed ❌
- **Connection refused** = DNS/networking issue ❌

---

## What to Do Now

**Try these in order:**

1. ✅ **Add missing port variables** (N8N_PORT, N8N_LISTEN_ADDRESS)
2. ✅ **Redeploy the service**
3. ✅ **Wait 2 minutes** for full restart
4. ✅ **Check logs** for "ready on 0.0.0.0:5678"
5. ✅ **Test Railway domain** first before custom domain
6. ✅ **Check target port** in domain settings = 5678

---

## Still Not Working?

**Send me:**
1. Screenshot of **Variables** tab (blur sensitive values)
2. Screenshot of **Networking** section in Settings
3. Last 20 lines of deployment logs
4. Result of: `curl -I https://hvwqocva.up.railway.app`

The issue is 100% a Railway configuration problem, not a DNS problem. Let's fix it!
