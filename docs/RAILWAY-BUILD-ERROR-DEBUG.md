# Railway Build Error - Debugging Guide

## 🔍 How to Get Railway Build Logs

1. Go to: **https://railway.app/dashboard**
2. Click your service
3. Click **"Deployments"** tab
4. Click the latest deployment (top of list - should show "Failed" status)
5. Look for **"View Logs"** or **"Deploy Logs"** button
6. Scroll to the ERROR message

## 📋 Common Railway Build Errors

### Error 1: Missing Dependencies
```
npm ERR! Cannot find module 'xyz'
```

**Fix:** Add missing package to package.json
```bash
npm install xyz
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push
```

---

### Error 2: TypeScript Compilation Error
```
error TS2307: Cannot find module './path/to/file'
```

**Fix:** Check import paths in TypeScript files
- Make sure all imported files exist
- Check case sensitivity (file.ts vs File.ts)
- Verify relative paths are correct

---

### Error 3: Memory Limit Exceeded
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Fix:** Railway ran out of memory during build
- Simplify build process
- Use lighter dependencies
- Or upgrade Railway plan for more memory

---

### Error 4: Start Command Failed
```
Error: Cannot find module '/app/dist/index.js'
```

**Fix:** Build didn't complete or output wrong directory
- Check tsconfig.json outDir matches
- Verify npm run build creates dist/index.js
- Check railway.json buildCommand

---

### Error 5: Port Binding Error
```
Error: listen EADDRINUSE: address already in use
```

**Fix:** App didn't bind to Railway's PORT
- Ensure code uses: `process.env.PORT`
- Default to 3000 but respect Railway's PORT

---

### Error 6: Missing Environment Variables
```
Error: Missing required environment variables
```

**Fix:** Add required variables in Railway
- Go to Variables tab
- Add missing variables
- Redeploy

---

## 🛠️ Emergency Rollback to Minimal Mode

If full version keeps failing, rollback to minimal:

### Option 1: Via Git
```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app

# Edit railway.json
# Change: "startCommand": "node dist/index.js"
# To: "startCommand": "node dist/index-minimal.js"

# Edit Procfile
# Change: web: node dist/index.js
# To: web: node dist/index-minimal.js

git add railway.json Procfile
git commit -m "rollback: Use minimal version temporarily"
git push origin main
```

### Option 2: Via Railway Dashboard
1. Railway → Your Service → **Settings**
2. Find **"Start Command"** override
3. Set to: `node dist/index-minimal.js`
4. Save and redeploy

---

## 🔍 Debugging Steps

### Step 1: Test Build Locally
```bash
cd /mnt/c/Users/qntm5/legal-slack-bot/app
npm run build
```

**If this fails:**
- Fix TypeScript errors
- Commit and push

**If this works:**
- Problem is Railway-specific
- Check Railway logs for exact error

---

### Step 2: Check All Files Exist
```bash
# Check services
ls -la src/services/

# Check commands
ls -la src/slack/commands/

# Check build output
ls -la dist/
```

---

### Step 3: Verify Dependencies
```bash
# Check package.json has all needed packages
cat package.json

# Common missing packages for full version:
npm install dotenv
npm install ioredis
npm install @anthropic-ai/sdk
npm install @pinecone-database/pinecone
```

---

### Step 4: Check Railway Configuration
```bash
# Verify railway.json
cat railway.json

# Should have:
# "buildCommand": "npm install && npm run build"
# "startCommand": "node dist/index.js"
```

---

### Step 5: Test Start Command Locally
```bash
# Build first
npm run build

# Then test start
node dist/index.js
```

**Look for:**
- ✅ App starts without errors
- ✅ Connects to services
- ✅ Listens on port

**If errors appear:**
- Missing environment variables
- Service connection failures
- Import errors

---

## 📊 Current Status Check

### What's Running Now?
```bash
curl https://winston-production.up.railway.app/health
```

**Response shows:**
- "Winston minimal mode" → Minimal version running ✅
- "Winston is running" → Full version running ✅
- Error or timeout → Nothing running ❌

---

## 🆘 Get Help

### Information to Provide:

1. **Railway Build Logs** (copy full error)
2. **Local Build Result**:
   ```bash
   npm run build
   ```
3. **Local Start Test**:
   ```bash
   node dist/index.js
   ```
4. **Current Health Check**:
   ```bash
   curl https://winston-production.up.railway.app/health
   ```

---

## 🎯 Quick Fixes by Error Type

| Error | Quick Fix |
|-------|-----------|
| Module not found | `npm install [package]` |
| TypeScript error | Fix import paths |
| Memory limit | Use minimal version |
| Port error | Check `process.env.PORT` |
| Build timeout | Simplify dependencies |
| Start command fails | Verify dist/index.js exists |

---

## 💡 Most Likely Issues

### Issue #1: Missing dotenv
Full version uses `dotenv` but might not be in dependencies.

**Fix:**
```bash
npm install dotenv
git add package.json package-lock.json
git commit -m "fix: add dotenv dependency"
git push
```

### Issue #2: Redis Connection on Startup
Full version tries to connect to Redis immediately.

**Fix:** Make Redis optional or add connection retry logic

### Issue #3: Service Imports
Full version imports many services that might have issues.

**Fix:** Check each service compiles individually

---

## 🔄 Rollback Strategy

**If you need the bot working NOW:**
1. Rollback to minimal version (see above)
2. Bot works with basic features
3. Debug full version separately
4. Switch back when ready

**Current minimal features:**
- ✅ Slash commands
- ✅ Direct messages
- ✅ @mentions
- ✅ Basic responses
- ❌ No AI analysis
- ❌ No sessions/cache

---

**Waiting for Railway error logs to provide specific fix!** 🔍
