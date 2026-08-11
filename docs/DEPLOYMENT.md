# GreenPulse — Zero-Cost Production Deployment Guide

This guide details the **100% Zero-Cost Portfolio Deployment Architecture** for GreenPulse.

---

## 🚨 Zero-Cost Mandate & Financial Safety
- **Total Monthly Cost**: **$0.00 / month** ($0 credit card required, zero unexpected charges).
- **Free-Tier Transparency**: Uses current free tiers of Aiven (MySQL), Render (Spring Boot), and Vercel (React Frontend).
- **Code & Test Preservation**: 100% preserves existing **React 18 + Spring Boot 3 + JPA/Hibernate + MySQL 8.0** code and tests (**21/21 Unit Tests Passed**). Zero database migration risk.

---

## 🏛️ Target Production Architecture

```text
                     www.greenpulse.demo / Vercel Domain
                                  │
                                Vercel
                        (100% Free Hobby Plan)
                                  │
                         React 18 Frontend (Vite)
                                  │
                                  │ HTTPS REST Calls (JWT)
                                  ▼
                   Render Free Web Service (Docker / Java 17)
                                  │
                                  │ JDBC SSL Connection
                                  ▼
                      Aiven Free MySQL 8.0 Database
                  (1 CPU, 1 GB RAM, 1 GB Storage — $0/mo)
```

---

## 1. Frontend Hosting (Vercel)

- **Status**: **LIVE & VERIFIED** ✅
- **Public URL**: [https://frontend-nine-woad-g8xvq6ys3s.vercel.app](https://frontend-nine-woad-g8xvq6ys3s.vercel.app)
- **Monthly Cost**: **$0.00 / month**
- **Configuration**: [frontend/vercel.json](file:///Users/jisshajan/Desktop/Projects/GreenPulse/frontend/vercel.json) rewrites active for single-page routing (`/login`, `/dashboard`, `/enforcement`, `/rewards`, `/admin`).

---

## 2. Managed MySQL Database Hosting (Aiven Free MySQL)

- **Status**: **PREPARED** ✅
- **Monthly Cost**: **$0.00 / month** (Free Tier forever, no credit card required)
- **Specs**: 1 CPU, 1 GB RAM, 1 GB Storage

### Database Setup Steps:
1. Sign up for a free account at [Aiven.io](https://aiven.io).
2. Create a new service -> select **MySQL** -> choose the **Free Tier ($0/month)**.
3. Obtain connection details:
   - Host (e.g. `mysql-greenpulse-xxx.aivencloud.com`)
   - Port (e.g. `12345` or `3306`)
   - Database Name (`defaultdb` or `greenpulsedb`)
   - Username (`avroot` or custom)
   - Password
4. Execute initialization scripts against your Aiven MySQL database:
   ```bash
   mysql -h AIVEN_HOST -P AIVEN_PORT -u AIVEN_USER -p AIVEN_DB < database/schema.sql
   mysql -h AIVEN_HOST -P AIVEN_PORT -u AIVEN_USER -p AIVEN_DB < database/seed.sql
   ```

---

## 3. Backend Hosting (Render Free Web Service)

- **Status**: **PREPARED & CONFIGURED** ✅
- **Monthly Cost**: **$0.00 / month**
- **Blueprint & Docker**: Configured in [backend/Dockerfile](file:///Users/jisshajan/Desktop/Projects/GreenPulse/backend/Dockerfile) and [render.yaml](file:///Users/jisshajan/Desktop/Projects/GreenPulse/render.yaml)

### Deployment Steps on Render:
1. Log in to [Render.com](https://render.com) using your GitHub account (`jisssz`).
2. Click **New** → **Web Service** → select repository **`jisssz/greenpulse`**.
3. Choose **Docker** as environment (Root Directory: `backend`).
4. Select **Free Plan ($0/month)**.
5. Set Environment Variables:
   - `PORT` = `8080`
   - `CORS_ALLOWED_ORIGINS` = `https://frontend-nine-woad-g8xvq6ys3s.vercel.app`
   - `DB_URL` = `jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/<AIVEN_DB>?useSSL=true&serverTimezone=UTC`
   - `DB_USERNAME` = `<AIVEN_USER>`
   - `DB_PASSWORD` = `<AIVEN_PASSWORD>`
   - `JWT_SECRET` = Generate a random 256-bit production key (e.g., via `openssl rand -hex 32`)
6. Click **Create Web Service**. Your live backend API URL will be `https://greenpulse-backend.onrender.com`.

---

## 4. Connecting Vercel Frontend to Render Backend

1. Open your Vercel Dashboard at [https://vercel.com/jis-shajans-projects/frontend](https://vercel.com/jis-shajans-projects/frontend).
2. Go to **Settings** → **Environment Variables**.
3. Set `VITE_API_BASE_URL` = `https://greenpulse-backend.onrender.com/api`.
4. Click **Deployments** → **Redeploy**.

---

## ⚠️ Free-Tier Limitations & Disclaimers

1. **Render Cold-Start Behavior**: Render Free Web Services automatically sleep after 15 minutes of inactivity. The initial HTTP request after sleeping takes ~50-60 seconds to spin up the container. This is a free-tier hosting behavior, not an application defect.
2. **Ephemeral Evidence Upload Storage**: File uploads stored on Render free server disk are temporary and cleared when the container spins down. In enterprise production, an S3 object storage bucket adapter would replace local disk storage.
3. **Pricing Note**: *"GreenPulse is deployed using providers' current free tiers ($0/month). Free-tier limits and provider pricing may change over time."*
