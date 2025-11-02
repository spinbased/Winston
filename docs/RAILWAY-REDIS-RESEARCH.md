# Railway Redis Setup and Deployment Guide

**Comprehensive Research Documentation**
**Date:** 2025-11-02
**Swarm Coordination ID:** swarm_1762092485562_qumyhqlm3

---

## Table of Contents
1. [Overview](#overview)
2. [Redis Setup on Railway](#redis-setup-on-railway)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Node.js Redis Connection](#nodejs-redis-connection)
5. [Common Deployment Errors](#common-deployment-errors)
6. [Health Checks and Monitoring](#health-checks-and-monitoring)
7. [Best Practices](#best-practices)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

Railway is a modern cloud platform that simplifies application deployment with zero-configuration infrastructure. This guide provides comprehensive information about deploying Node.js applications with Redis on Railway.

### Key Features
- **Zero-configuration Redis deployment**
- **Automatic environment variable injection**
- **Built-in TCP Proxy for external connections**
- **Native backup and monitoring capabilities**
- **Private networking between services**

---

## Redis Setup on Railway

### Method 1: Quick Deploy via Command Menu

1. **Open Command Menu**: Press `Ctrl/Cmd + K` in your Railway project
2. **Type "Redis"**: Search for Redis in the menu
3. **Select Redis Template**: Click to deploy
4. **Automatic Provisioning**: Railway creates the Redis instance with zero configuration

### Method 2: Project Canvas

1. **Navigate to Project Canvas**: Open your Railway project
2. **Click "+ New" Button**: Located on the canvas
3. **Select "Database"**: From the dropdown menu
4. **Choose "Redis"**: From available database options
5. **Deploy**: Railway handles the rest automatically

### Method 3: Template Marketplace

1. **Visit Template Marketplace**: Navigate to https://railway.com/template/redis
2. **Click "Deploy"**: One-click deployment
3. **Connect to Project**: Link to existing or create new project

### What Gets Deployed

Railway deploys the **official Redis Docker image** from Docker Hub, providing:
- Latest stable Redis version
- Standard Redis configuration
- Automatic health monitoring
- Built-in persistence options

---

## Environment Variables Configuration

### Automatic Redis Variables

When you deploy Redis on Railway, the following environment variables are automatically created and available to other services in your project:

| Variable | Description | Example |
|----------|-------------|---------|
| `REDISHOST` | Server hostname | `redis.railway.internal` |
| `REDISUSER` | Authentication username | `default` |
| `REDISPORT` | Connection port | `6379` |
| `REDISPASSWORD` | Authentication password | `generated-password` |
| `REDIS_URL` | Complete connection string | `redis://default:password@host:6379` |

### Best Practices for Environment Variables

#### 1. Shared Variables

**Purpose**: Reduce duplication across multiple services within the same project.

**Use Cases**:
- API keys used by multiple services
- Database URLs shared across microservices
- Configuration values common to all services

**Syntax**:
```bash
${{ shared.VARIABLE_KEY }}
```

**Example**:
```bash
# Define once at project level
shared.DATABASE_URL=postgresql://...

# Reference in multiple services
DATABASE_URL=${{ shared.DATABASE_URL }}
```

#### 2. Reference Variables

**Purpose**: Create dynamic variable references between services.

**Patterns**:

**a) Reference Other Services**:
```bash
# Access variables from connected services
REDIS_URL=${{ redis-service.REDIS_URL }}
API_ENDPOINT=${{ api-service.RAILWAY_PUBLIC_DOMAIN }}
```

**b) Reference Same Service**:
```bash
# Combine variables for computed values
FULL_URL=https://${{ RAILWAY_PUBLIC_DOMAIN }}/api
DATABASE_CONNECTION=${{ DB_HOST }}:${{ DB_PORT }}/${{ DB_NAME }}
```

**c) Railway-Provided Variables**:
```bash
# Built-in variables available to all services
RAILWAY_ENVIRONMENT
RAILWAY_PROJECT_ID
RAILWAY_SERVICE_ID
RAILWAY_PUBLIC_DOMAIN
RAILWAY_PRIVATE_DOMAIN
```

**Dashboard Features**:
- Autocomplete dropdown for variable references
- Real-time validation
- Syntax highlighting

#### 3. Sealed Variables

**Purpose**: Security-first approach for sensitive credentials.

**Characteristics**:
- Values are **not visible** via UI or Railway API after sealing
- **Cannot be un-sealed** once sealed
- **Do not copy** to PR or duplicate environments
- **Not provided** when using `railway variables` or `railway run` via CLI

**When to Use**:
- API keys and secrets
- Database passwords
- OAuth client secrets
- Encryption keys
- Third-party service credentials

**Example Workflow**:
```bash
# Set sensitive variable
STRIPE_SECRET_KEY=sk_live_xxxxx

# Seal it (irreversible)
[Seal Variable Button in Railway UI]

# Variable is now encrypted and hidden
```

#### 4. Local Development

**Run Locally with Railway Variables**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Link to your project
railway link

# Run your application with Railway variables
railway run node server.js
railway run npm start
railway run npm run dev

# Variables are automatically injected into process.env
```

**Benefits**:
- Development environments match production
- No need to maintain separate `.env` files
- Prevents credential leakage in version control
- Team-wide consistency

#### 5. Variable Hierarchy

**Precedence Order** (highest to lowest):
1. Service-specific variables
2. Shared project variables
3. Environment-specific variables
4. Railway-provided system variables

**Example**:
```bash
# Project Level (Shared)
shared.API_VERSION=v1
shared.LOG_LEVEL=info

# Service Level (Override)
API_VERSION=v2          # Overrides shared.API_VERSION for this service
DATABASE_NAME=myapp_db  # Service-specific

# Final Values
API_VERSION=v2          # Uses service override
LOG_LEVEL=info          # Falls back to shared
DATABASE_NAME=myapp_db  # Service-specific
```

---

## Node.js Redis Connection

### Connection Patterns

#### Using `ioredis` (Recommended)

**Installation**:
```bash
npm install ioredis
```

**Basic Connection**:
```javascript
const Redis = require('ioredis');

// Using REDIS_URL environment variable
const redis = new Redis(process.env.REDIS_URL, {
  family: 0, // CRITICAL: Required for Railway
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Handle connection events
redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('🚀 Redis is ready');
});
```

**Why `family: 0`?**
- Railway's network configuration requires this setting
- Allows both IPv4 and IPv6 resolution
- Without it, connections may fail intermittently

#### Advanced Connection with Parsed URL

```javascript
const Redis = require('ioredis');
const url = require('url');

// Parse REDIS_URL for granular control
const redisUrl = process.env.REDIS_URL;
const parsedUrl = url.parse(redisUrl);

const redis = new Redis({
  host: parsedUrl.hostname,
  port: parsedUrl.port || 6379,
  username: parsedUrl.auth?.split(':')[0] || 'default',
  password: parsedUrl.auth?.split(':')[1] || '',
  family: 0, // Required for Railway
  db: 0,
  retryStrategy: (times) => {
    if (times > 10) {
      return null; // Stop retrying after 10 attempts
    }
    return Math.min(times * 100, 3000);
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY errors
    }
    return false;
  }
});
```

#### Using BullMQ (Job Queue)

**Installation**:
```bash
npm install bullmq
```

**Connection Setup**:
```javascript
const { Queue, Worker } = require('bullmq');
const url = require('url');

// Parse REDIS_URL
const redisUrl = url.parse(process.env.REDIS_URL);
const redisAuth = redisUrl.auth?.split(':');

const connection = {
  host: redisUrl.hostname,
  port: redisUrl.port || 6379,
  username: redisAuth?.[0] || 'default',
  password: redisAuth?.[1] || '',
  family: 0 // Required for Railway
};

// Create Queue
const emailQueue = new Queue('emails', { connection });

// Create Worker
const worker = new Worker('emails', async (job) => {
  // Process job
  console.log('Processing job:', job.id);
  await sendEmail(job.data);
}, { connection });

// Handle events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

#### Using node-redis (Alternative)

**Installation**:
```bash
npm install redis
```

**Connection**:
```javascript
const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    family: 0, // Required for Railway
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Max retries reached');
      return Math.min(retries * 100, 3000);
    }
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis connected'));
client.on('ready', () => console.log('🚀 Redis ready'));

await client.connect();
```

### Private Networking

**Internal Communication** (Free, no egress charges):
```javascript
// Use Railway's private domain
const redis = new Redis({
  host: process.env.REDISHOST || 'redis.railway.internal',
  port: process.env.REDISPORT || 6379,
  password: process.env.REDISPASSWORD,
  family: 0
});
```

**External Connections** (Billable via TCP Proxy):
```javascript
// TCP Proxy enabled by default
// Network egress charges apply
const redis = new Redis(process.env.REDIS_URL, {
  family: 0,
  tls: {} // If using TLS
});
```

### Connection Best Practices

1. **Always set `family: 0`** in connection options
2. **Use environment variables** for configuration
3. **Implement retry strategies** for resilience
4. **Handle connection events** (connect, error, ready)
5. **Use private networking** when possible (free, faster)
6. **Test connections** before deploying
7. **Monitor connection pool** usage
8. **Implement graceful shutdown**:

```javascript
// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Redis connection');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing Redis connection');
  await redis.quit();
  process.exit(0);
});
```

---

## Common Deployment Errors

### 1. Application Failed to Respond

**Error Message**:
```
Application Failed to Respond
```

**Causes**:
- App not listening on the `PORT` environment variable
- Application crash during startup
- Health check endpoint not responding with 200 status
- Incorrect port configuration

**Solutions**:

**a) Correct Port Configuration**:
```javascript
// ❌ WRONG: Hardcoded port
app.listen(3000);

// ✅ CORRECT: Use Railway's PORT variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
```

**b) Verify Health Check Endpoint**:
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});
```

**c) Check Application Logs**:
```bash
railway logs
```

### 2. ENOTFOUND redis.railway.internal

**Error Message**:
```
Error: getaddrinfo ENOTFOUND redis.railway.internal
```

**Causes**:
- Private networking not properly configured
- Redis service not deployed in same project
- Incorrect variable reference

**Solutions**:

**a) Verify Redis Service Exists**:
- Check Railway dashboard for Redis service
- Ensure Redis is in the same project

**b) Use Correct Variable Reference**:
```javascript
// ❌ WRONG: Hardcoded hostname
const redis = new Redis('redis.railway.internal');

// ✅ CORRECT: Use environment variable
const redis = new Redis(process.env.REDIS_URL, { family: 0 });
```

**c) Check Variable References**:
```bash
# In Railway dashboard, verify:
REDIS_URL=${{ redis-service.REDIS_URL }}
```

### 3. No Start Command Could Be Found

**Error Message**:
```
No Start Command Could Be Found
```

**Causes**:
- Missing `start` script in `package.json`
- Railway can't detect how to run your app
- Incorrect build configuration

**Solutions**:

**a) Add Start Script to package.json**:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "npm run build"
  }
}
```

**b) Specify Start Command in Railway**:
- Go to Service Settings
- Navigate to Deploy section
- Set custom start command: `node server.js`

**c) Use railway.json**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. Build Failed: CI Warnings Treated as Errors

**Error Message**:
```
Treating warnings as errors because process.env.CI = true
```

**Cause**:
- Railway sets `CI=true` by default
- ESLint/TypeScript warnings fail the build

**Solutions**:

**a) Modify Build Command**:
```json
{
  "scripts": {
    "build": "CI=false npm run build"
  }
}
```

**b) Fix ESLint Warnings**:
```bash
npm run lint -- --fix
```

**c) Adjust ESLint Configuration**:
```json
// .eslintrc.json
{
  "rules": {
    "no-unused-vars": "warn",  // Change from "error" to "warn"
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

### 5. Port Configuration Errors

**Error Message**:
```
Target port mismatch
```

**Cause**:
- Public domain target port doesn't match app listening port

**Solutions**:

**a) Check Target Port Setting**:
- Go to Service Settings > Networking
- Verify target port matches your app's port

**b) Use PORT Variable Correctly**:
```javascript
// ❌ WRONG: Literal string "$PORT"
const PORT = '$PORT';

// ✅ CORRECT: Environment variable with fallback
const PORT = process.env.PORT || 8000;
const PORT = parseInt(process.env.PORT || '8000', 10);

// ✅ BETTER: With validation
const PORT = (() => {
  const port = parseInt(process.env.PORT || '8000', 10);
  if (isNaN(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }
  return port;
})();
```

### 6. Resource Limitations

**Error Message**:
```
Out of Memory
Container killed
```

**Causes**:
- Application exceeds 500MB RAM (Starter plan)
- Memory leaks
- Large data processing

**Solutions**:

**a) Upgrade Plan**:
- Starter: 500MB RAM, $0
- Hobby: 8GB RAM, $5/month
- Pro: 32GB RAM, custom pricing

**b) Optimize Memory Usage**:
```javascript
// Implement connection pooling
const redis = new Redis({
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
});

// Clean up resources
process.on('SIGTERM', async () => {
  await redis.quit();
  process.exit(0);
});
```

**c) Monitor Memory**:
```javascript
// Add memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`
  });
}, 60000); // Every minute
```

### 7. Nixpacks Build Failures

**Error Message**:
```
Nixpacks Was Unable to Generate a Build Plan
```

**Causes**:
- Unsupported language/framework
- Missing build configuration
- Incorrect file structure

**Solutions**:

**a) Add nixpacks.toml**:
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

**b) Use Dockerfile Instead**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

**c) Specify Build Provider**:
```json
// railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

---

## Health Checks and Monitoring

### Health Check Configuration

#### Basic Setup

Railway requires a health check endpoint that returns HTTP 200 to ensure zero-downtime deployments.

**Express Example**:
```javascript
const express = require('express');
const app = express();

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Advanced health check with dependency verification
app.get('/health', async (req, res) => {
  try {
    // Check Redis connection
    await redis.ping();

    // Check database connection (if applicable)
    // await db.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      redis: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});
```

**Fastify Example**:
```javascript
const fastify = require('fastify')();

fastify.get('/health', async (request, reply) => {
  try {
    await redis.ping();
    return { status: 'ok', redis: 'connected' };
  } catch (error) {
    reply.status(503);
    return { status: 'error', message: error.message };
  }
});
```

#### Port Configuration

**CRITICAL**: Railway uses the `PORT` environment variable for health checks.

```javascript
// ✅ CORRECT: Listen on Railway's PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**For Custom Target Ports**:
If your app uses a custom target port, manually set the `PORT` variable:
- Go to Service Settings > Variables
- Add `PORT=8080` (or your custom port)

### Timeout Configuration

**Default Timeout**: 300 seconds (5 minutes)

**Increase Timeout**:

**Method 1: Service Settings**
- Go to Service Settings > Deploy
- Adjust Health Check Timeout slider

**Method 2: Environment Variable**
```bash
RAILWAY_HEALTHCHECK_TIMEOUT_SEC=600  # 10 minutes
```

**When to Increase Timeout**:
- Database migrations during startup
- Large data seeding operations
- Slow dependency initialization
- Complex startup routines

### Important Limitations

#### No Continuous Monitoring
> **Railway does NOT monitor the health check endpoint after deployment goes live.**

The health check is **only called at startup** to verify the service is ready before routing traffic.

**For Continuous Monitoring**: Use external services like:
- [Uptime Kuma](https://railway.com/template/uptime-kuma) (Railway template available)
- Datadog
- New Relic
- Pingdom
- UptimeRobot

#### Hostname Restrictions
Railway uses `healthcheck.railway.app` as the origin for health check requests.

**If your app restricts traffic by hostname**, allowlist:
```javascript
const allowedHosts = [
  'healthcheck.railway.app',
  process.env.RAILWAY_PUBLIC_DOMAIN
];

app.use((req, res, next) => {
  const host = req.get('host');
  if (allowedHosts.some(h => host?.includes(h))) {
    return next();
  }
  res.status(403).send('Forbidden');
});
```

#### Volume-Attached Services
Services with volumes experience **brief downtime** during redeployment, even with health checks configured. This prevents data corruption.

### Advanced Health Check Implementation

#### Comprehensive Health Check
```javascript
const express = require('express');
const Redis = require('ioredis');
const app = express();

let redis;
let isShuttingDown = false;

// Initialize Redis
async function initRedis() {
  redis = new Redis(process.env.REDIS_URL, { family: 0 });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  return redis;
}

// Readiness probe (for Railway health check)
app.get('/health', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting_down' });
  }

  try {
    // Test Redis connection
    const redisPing = await redis.ping();

    res.status(200).json({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      checks: {
        redis: redisPing === 'PONG' ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

// Liveness probe (for external monitoring)
app.get('/health/live', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting_down' });
  }
  res.status(200).json({ status: 'alive' });
});

// Readiness probe (for load balancers)
app.get('/health/ready', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'not_ready' });
  }

  try {
    await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown');
  isShuttingDown = true;

  // Stop accepting new connections
  setTimeout(async () => {
    await redis.quit();
    process.exit(0);
  }, 10000); // 10 second grace period
});

// Start server
async function start() {
  await initRedis();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start().catch(console.error);
```

### Monitoring Recommendations

#### 1. Uptime Kuma (Railway Template)
```bash
# Deploy Uptime Kuma from Railway template
# Monitor endpoints:
# - https://your-app.railway.app/health
# - https://your-app.railway.app/health/live
# - https://your-app.railway.app/health/ready
```

**Features**:
- Self-hosted monitoring
- Multiple notification channels (Slack, Discord, Email)
- SSL certificate monitoring
- Status page
- Free on Railway Hobby plan

#### 2. Application Metrics
```javascript
// Add basic metrics endpoint
app.get('/metrics', async (req, res) => {
  const used = process.memoryUsage();
  const redisInfo = await redis.info();

  res.json({
    process: {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`
      },
      cpu: process.cpuUsage()
    },
    redis: {
      connected: redis.status === 'ready',
      info: redisInfo
    }
  });
});
```

#### 3. Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Log health check requests
app.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    await redis.ping();
    const duration = Date.now() - startTime;

    logger.info('Health check passed', {
      duration,
      redis: 'connected'
    });

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Health check failed', {
      duration,
      error: error.message
    });

    res.status(503).json({ status: 'error' });
  }
});
```

---

## Best Practices

### 1. Security

#### Use Sealed Variables for Secrets
```bash
# In Railway dashboard:
# 1. Add variable: REDIS_PASSWORD
# 2. Click "Seal" button
# 3. Value is now encrypted and hidden
```

#### Never Commit Credentials
```bash
# .gitignore
.env
.env.local
.env.*.local
railway.json  # If contains secrets
```

#### Implement Connection Authentication
```javascript
const redis = new Redis({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  password: process.env.REDISPASSWORD,
  username: process.env.REDISUSER || 'default',
  family: 0,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined
});
```

### 2. Performance

#### Use Private Networking
```javascript
// ✅ PREFERRED: Private networking (no egress charges)
const redis = new Redis({
  host: process.env.REDISHOST,  // Uses railway.internal
  port: process.env.REDISPORT,
  password: process.env.REDISPASSWORD,
  family: 0
});

// ❌ AVOID: TCP Proxy (billable egress)
// Only use for external connections outside Railway
```

#### Implement Connection Pooling
```javascript
const redis = new Redis({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  password: process.env.REDISPASSWORD,
  family: 0,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  // Connection pool settings
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});
```

#### Use Redis Pipelining
```javascript
// Batch multiple commands
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.set('key3', 'value3');
await pipeline.exec();
```

#### Implement Caching Strategy
```javascript
// Cache expensive operations
async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const user = await db.users.findById(userId);

  // Store in cache (expire after 1 hour)
  await redis.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}
```

### 3. Reliability

#### Implement Retry Logic
```javascript
const redis = new Redis({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  password: process.env.REDISPASSWORD,
  family: 0,
  retryStrategy: (times) => {
    if (times > 10) {
      // Stop retrying after 10 attempts
      return null;
    }
    // Exponential backoff: 50ms, 100ms, 150ms, etc.
    return Math.min(times * 50, 2000);
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Reconnect on READONLY errors
      return true;
    }
    return false;
  }
});
```

#### Graceful Shutdown
```javascript
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown');
  isShuttingDown = true;

  // Stop accepting new requests
  server.close(async () => {
    console.log('HTTP server closed');

    // Close Redis connection
    await redis.quit();
    console.log('Redis connection closed');

    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

// Return 503 during shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.status(503).send('Service Unavailable');
    return;
  }
  next();
});
```

#### Circuit Breaker Pattern
```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000, // 3 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000 // 30 seconds
};

async function redisOperation(key) {
  return await redis.get(key);
}

const breaker = new CircuitBreaker(redisOperation, options);

breaker.fallback(() => {
  console.log('Circuit breaker fallback');
  return null; // Return cached data or default value
});

breaker.on('open', () => {
  console.error('Circuit breaker opened - Redis unavailable');
});

breaker.on('halfOpen', () => {
  console.warn('Circuit breaker half-open - testing Redis');
});

// Use circuit breaker
try {
  const value = await breaker.fire('mykey');
} catch (error) {
  console.error('Redis operation failed:', error);
}
```

### 4. Development Workflow

#### Use Railway CLI for Local Development
```bash
# Install Railway CLI
npm install -g @railway/cli

# Link to your project
railway link

# Run locally with Railway variables
railway run npm run dev

# View logs
railway logs

# Access shell with environment
railway shell
```

#### Environment-Specific Configuration
```javascript
// config.js
module.exports = {
  development: {
    redis: {
      host: 'localhost',
      port: 6379,
      password: ''
    }
  },
  production: {
    redis: {
      host: process.env.REDISHOST,
      port: process.env.REDISPORT,
      password: process.env.REDISPASSWORD
    }
  }
};

// Use in application
const config = require('./config');
const env = process.env.RAILWAY_ENVIRONMENT || 'development';
const redis = new Redis(config[env].redis);
```

#### Testing with Railway Services
```bash
# Run tests with Railway environment
railway run npm test

# Run integration tests against Railway Redis
railway run npm run test:integration
```

### 5. Monitoring and Observability

#### Structured Logging
```javascript
const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Log Redis operations
async function setCache(key, value) {
  const startTime = Date.now();
  try {
    await redis.set(key, value);
    logger.info({
      operation: 'redis.set',
      key,
      duration: Date.now() - startTime
    });
  } catch (error) {
    logger.error({
      operation: 'redis.set',
      key,
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  }
}
```

#### Performance Tracking
```javascript
// Track Redis command performance
const commandStats = new Map();

redis.on('commandExecuted', (command) => {
  const { name, duration } = command;

  if (!commandStats.has(name)) {
    commandStats.set(name, { count: 0, totalDuration: 0 });
  }

  const stats = commandStats.get(name);
  stats.count++;
  stats.totalDuration += duration;

  // Log slow commands
  if (duration > 100) {
    logger.warn({
      message: 'Slow Redis command',
      command: name,
      duration
    });
  }
});

// Expose metrics endpoint
app.get('/metrics/redis', (req, res) => {
  const metrics = Array.from(commandStats.entries()).map(([name, stats]) => ({
    command: name,
    count: stats.count,
    avgDuration: stats.totalDuration / stats.count
  }));

  res.json(metrics);
});
```

### 6. Production Readiness

#### Implement Backups
Railway provides native backup features. Enable for production:
- Go to Redis Service Settings > Backups
- Enable automated backups
- Configure retention policy
- Test restore procedures

#### High Availability Setup
For mission-critical applications:
1. **Redis Replication**: Set up master-replica configuration
2. **Redis Sentinel**: Automatic failover
3. **Redis Cluster**: Horizontal scaling (requires Redis Cluster template)

#### Disaster Recovery Plan
```javascript
// Health check with fallback data
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: 'ok', redis: 'connected' });
  } catch (error) {
    // Log alert but don't crash
    logger.error('Redis health check failed', error);

    // Return degraded status
    res.status(200).json({
      status: 'degraded',
      redis: 'disconnected',
      fallback: 'active'
    });
  }
});

// Implement fallback for critical operations
async function getConfig() {
  try {
    const config = await redis.get('app:config');
    return JSON.parse(config);
  } catch (error) {
    logger.error('Failed to fetch config from Redis, using defaults');
    return DEFAULT_CONFIG; // Fallback to in-memory config
  }
}
```

---

## Troubleshooting Guide

### Connection Issues

#### Problem: Cannot Connect to Redis

**Symptoms**:
```
Error: connect ECONNREFUSED
Error: ENOTFOUND redis.railway.internal
```

**Diagnostic Steps**:
```bash
# 1. Verify Redis service exists
railway status

# 2. Check environment variables
railway variables

# 3. Test connection
railway run node -e "const Redis = require('ioredis'); const r = new Redis(process.env.REDIS_URL, {family: 0}); r.ping().then(console.log).catch(console.error);"

# 4. View Redis logs
railway logs --service redis
```

**Solutions**:
1. Ensure Redis service is deployed and running
2. Verify `REDIS_URL` variable exists and is correctly referenced
3. Check `family: 0` is set in connection options
4. Use private networking (REDISHOST) instead of public URL

#### Problem: Intermittent Connection Failures

**Symptoms**:
```
Redis connection lost
Connection timeout
```

**Solutions**:
```javascript
// Implement robust retry strategy
const redis = new Redis({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  password: process.env.REDISPASSWORD,
  family: 0,
  retryStrategy: (times) => {
    if (times > 20) return null; // Stop after 20 retries
    return Math.min(times * 100, 3000);
  },
  reconnectOnError: () => true,
  maxRetriesPerRequest: 5,
  enableOfflineQueue: true
});

// Handle reconnection
redis.on('reconnecting', () => {
  logger.warn('Reconnecting to Redis...');
});

redis.on('ready', () => {
  logger.info('Redis connection restored');
});
```

### Performance Issues

#### Problem: Slow Redis Operations

**Diagnostic Steps**:
```javascript
// Enable command logging
redis.monitor((time, args) => {
  console.log(time, args);
});

// Track slow commands
redis.on('commandExecuted', (command) => {
  if (command.duration > 100) {
    logger.warn('Slow command', {
      command: command.name,
      args: command.args,
      duration: command.duration
    });
  }
});
```

**Solutions**:
1. **Use pipelining** for multiple commands
2. **Optimize data structures** (use hashes instead of multiple keys)
3. **Implement caching** at application level
4. **Use private networking** to reduce latency
5. **Profile Redis operations** with `redis-cli --latency`

#### Problem: High Memory Usage

**Diagnostic Steps**:
```bash
# Check Redis memory usage
railway run redis-cli INFO memory

# Check key count
railway run redis-cli DBSIZE

# Find large keys
railway run redis-cli --bigkeys
```

**Solutions**:
```javascript
// Implement TTL for all cached data
await redis.setex('key', 3600, 'value'); // Expire after 1 hour

// Clean up expired keys periodically
setInterval(async () => {
  const keys = await redis.keys('temp:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}, 3600000); // Every hour

// Use Redis data structures efficiently
// ❌ BAD: Multiple keys
await redis.set('user:1:name', 'John');
await redis.set('user:1:email', 'john@example.com');

// ✅ GOOD: Single hash
await redis.hset('user:1', 'name', 'John', 'email', 'john@example.com');
```

### Deployment Issues

#### Problem: Health Check Fails

**Symptoms**:
```
Health check timeout
Application Failed to Respond
```

**Solutions**:

1. **Verify health endpoint**:
```javascript
// Test locally
curl http://localhost:3000/health

// Test on Railway
curl https://your-app.railway.app/health
```

2. **Increase timeout**:
```bash
# Add environment variable
RAILWAY_HEALTHCHECK_TIMEOUT_SEC=600
```

3. **Simplify health check**:
```javascript
// Don't perform expensive operations in health check
app.get('/health', (req, res) => {
  res.status(200).send('OK'); // Simple response
});
```

4. **Check dependencies**:
```javascript
// Ensure Redis is connected before health check passes
let redisReady = false;

redis.on('ready', () => {
  redisReady = true;
});

app.get('/health', (req, res) => {
  if (!redisReady) {
    return res.status(503).json({ status: 'redis_not_ready' });
  }
  res.status(200).json({ status: 'ok' });
});
```

#### Problem: Environment Variables Not Working

**Symptoms**:
```
undefined variable
null reference error
```

**Solutions**:

1. **Verify variable exists**:
```bash
railway variables
```

2. **Check variable syntax**:
```bash
# ✅ CORRECT
REDIS_URL=${{ redis.REDIS_URL }}

# ❌ WRONG
REDIS_URL=${{redis.REDIS_URL}}  # Missing space
REDIS_URL=${redis.REDIS_URL}    # Wrong syntax
```

3. **Use fallback values**:
```javascript
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
```

4. **Debug variable loading**:
```javascript
console.log('Environment variables:', {
  REDIS_URL: process.env.REDIS_URL ? '***set***' : 'NOT SET',
  REDISHOST: process.env.REDISHOST ? '***set***' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV
});
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Redis not running or wrong host/port | Check REDIS_URL and service status |
| `ENOTFOUND` | DNS resolution failed | Use private networking with REDISHOST |
| `NOAUTH` | Authentication required but not provided | Set REDISPASSWORD in connection |
| `WRONGPASS` | Incorrect password | Verify REDISPASSWORD variable |
| `READONLY` | Redis in read-only mode (replica) | Check Redis configuration or reconnect |
| `MAXCLIENTS` | Too many connections | Implement connection pooling |
| `OOM` | Out of memory | Upgrade plan or optimize memory usage |

### Getting Help

#### Railway Resources
- **Documentation**: https://docs.railway.com
- **Help Station**: https://station.railway.com
- **Discord Community**: https://discord.gg/railway
- **GitHub Issues**: https://github.com/railwayapp/railway

#### Debugging Commands
```bash
# View application logs
railway logs

# View Redis logs
railway logs --service redis

# SSH into container
railway shell

# Run commands in Railway environment
railway run <command>

# Check service status
railway status

# View environment variables
railway variables
```

---

## Summary

### Key Takeaways

1. **Redis Setup is Zero-Configuration**: Use Railway's template marketplace for instant deployment
2. **Always Use `family: 0`**: Required for Railway's network configuration
3. **Prefer Private Networking**: Free and faster than TCP Proxy
4. **Implement Health Checks**: Return 200 status from `/health` endpoint
5. **Use Environment Variables**: Never hardcode credentials
6. **Monitor Your Application**: Use Uptime Kuma or external monitoring services
7. **Plan for Failures**: Implement retry logic, circuit breakers, and graceful shutdown
8. **Optimize Performance**: Use connection pooling, pipelining, and caching strategies

### Quick Start Checklist

- [ ] Deploy Redis from Railway template
- [ ] Add environment variable references to your service
- [ ] Install `ioredis` package
- [ ] Create Redis connection with `family: 0`
- [ ] Implement health check endpoint
- [ ] Add graceful shutdown handlers
- [ ] Test locally with `railway run`
- [ ] Deploy and verify health check passes
- [ ] Set up external monitoring
- [ ] Configure automated backups

### Next Steps

1. **Review your application code** and ensure all Redis connections use `family: 0`
2. **Implement health checks** if not already present
3. **Set up monitoring** with Uptime Kuma or similar service
4. **Test failure scenarios** (Redis disconnection, network issues)
5. **Document your Redis schema** and key naming conventions
6. **Plan for scaling** (connection pooling, caching strategy)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-02
**Maintained By**: Swarm Research Agent
**Sources**: Railway Documentation, Redis Documentation, Community Resources
