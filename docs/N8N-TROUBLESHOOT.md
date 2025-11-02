# n8n Railway Troubleshooting - "Application not found" Error

## Problem
Railway returns: `{"status":"error","code":404,"message":"Application not found"}`

DNS is working correctly, but the n8n service isn't responding.

---

## Solution Steps

### Step 1: Check Railway Dashboard

1. Go to: https://railway.app/dashboard
2. Find your n8n project (should be in your projects list)
3. **Check if the project exists** - if not, the deployment failed completely

### Step 2: Check Service Status

Inside your n8n project:

1. You should see TWO services:
   - **n8n** (the main service)
   - **postgres** (the database)

2. Click on the **n8n service** (not postgres)

3. Look at the top - you should see status:
   - 🟢 **Active** = Good
   - 🔴 **Crashed** = Problem
   - ⚪ **Building** = Still deploying
   - 🟡 **Deploying** = In progress

### Step 3: Check Deployment Logs

1. Click on the **n8n service**
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. Check the logs for errors:

**Common errors:**
```
Error: Cannot find module 'n8n'
Connection refused to database
Port already in use
Environment variable missing
```

### Step 4: Check Environment Variables

1. Click on **n8n service** → **"Variables"** tab
2. Verify these variables exist:
   - `PORT` = 5678
   - `N8N_HOST` = n8n.level7labs.ai
   - `WEBHOOK_URL` = https://n8n.level7labs.ai
   - `DB_TYPE` = postgresdb
   - `DB_POSTGRESDB_HOST` = [should be postgres service reference]
   - `DB_POSTGRESDB_DATABASE`, `DB_POSTGRESDB_USER`, `DB_POSTGRESDB_PASSWORD`

**If any are missing**, the service won't start.

### Step 5: Check Custom Domain Settings

1. Click on **n8n service** → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Check **"Domains"**:
   - Should show: `hvwqocva.up.railway.app` (Railway domain)
   - Should show: `n8n.level7labs.ai` (your custom domain)

4. Next to `n8n.level7labs.ai`:
   - ✅ **Green checkmark** = Verified (good!)
   - ⏳ **Pending** = Waiting for DNS verification
   - ❌ **Error** = DNS not configured correctly

### Step 6: Generate Public Domain

If the Railway domain `hvwqocva.up.railway.app` doesn't exist:

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Railway will create a new `.railway.app` domain
4. Wait 30 seconds, then test: `https://[new-domain].railway.app`

---

## Quick Fixes

### Fix 1: Service Crashed - Redeploy

1. Go to **n8n service** → **Deployments**
2. Click **"Redeploy"** button on latest deployment
3. Wait 2-3 minutes for deployment to complete
4. Check logs for errors

### Fix 2: Missing Environment Variables

If variables are missing, Railway template might have failed. Manually add:

```
PORT=5678
N8N_HOST=n8n.level7labs.ai
WEBHOOK_URL=https://n8n.level7labs.ai
DB_TYPE=postgresdb
N8N_PROXY_HOPS=1
N8N_EXPRESS_TRUST_PROXY=true
```

Then redeploy.

### Fix 3: Database Not Connected

1. Check **postgres service** is running (should be Active)
2. In **n8n service** → **Variables**, verify database connection variables
3. They should reference the postgres service like:
   ```
   DB_POSTGRESDB_HOST=${{Postgres.RAILWAY_PRIVATE_DOMAIN}}
   DB_POSTGRESDB_PORT=${{Postgres.PORT}}
   DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
   DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
   DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}
   ```

### Fix 4: Start Fresh

If nothing works, delete and redeploy:

1. Delete the current n8n project in Railway
2. Go back to: https://railway.com/deploy/n8n
3. Click "Deploy Now" again
4. **This time**, wait for deployment to complete BEFORE adding custom domain
5. Test Railway domain first: `https://[railway-domain].railway.app`
6. If that works, THEN add custom domain

---

## What to Check Now

**Tell me:**

1. **Does the n8n project exist in your Railway dashboard?**
2. **What's the status of the n8n service?** (Active, Crashed, Building?)
3. **Are there any errors in the deployment logs?**
4. **Does the Railway domain work?** (the hvwqocva.up.railway.app one)

**Copy and paste the deployment logs if you see errors.**

---

## Alternative: Test Railway Domain First

Before custom domain, let's verify n8n works:

1. Remove custom domain temporarily
2. Generate a new Railway domain
3. Test that domain
4. Once working, add custom domain back

This isolates whether the problem is:
- **n8n service** (deployment issue), OR
- **Custom domain** (configuration issue)

Based on the "Application not found" error, I suspect the n8n service never deployed successfully or crashed immediately.
