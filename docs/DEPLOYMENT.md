# GreenPulse — Zero-Cost Production Deployment Guide

This guide details the **100% Zero-Cost Portfolio Deployment Strategy** for GreenPulse.

---

## 🚨 Zero-Cost Mandate & Financial Safety
- **Monthly Cost**: **$0.00 / month** ($0 credit card, $0 unexpected charges)
- **No Paid Add-ons**: Does not use paid Railway plans or paid database disks.
- **Architecture Integrity**: Preserves existing **React + Spring Boot 3 + JPA/Hibernate + MySQL 8.0** code and tests.

---

## 🏛️ Target Deployment Architecture

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
                                  ▼
                     Free Cloud MySQL 8.0 Database
                      (e.g., Aiven / FreeSQLDatabase)
```

---

## 1. Zero-Cost Frontend Hosting (Vercel)

- **Status**: **LIVE & VERIFIED** ✅
- **URL**: [https://frontend-nine-woad-g8xvq6ys3s.vercel.app](https://frontend-nine-woad-g8xvq6ys3s.vercel.app)
- **Cost**: **$0.00 / month** (Vercel Hobby Plan)
- **Configuration**: `frontend/vercel.json` rewrites active for single-page routing.

---

## 2. Zero-Cost Backend Hosting (Render Free Web Service)

- **Status**: **PREPARED & CONFIGURED** ✅
- **Cost**: **$0.00 / month**
- **Docker Blueprint**: Pre-configured in [backend/Dockerfile](file:///Users/jisshajan/Desktop/Projects/GreenPulse/backend/Dockerfile) and [render.yaml](file:///Users/jisshajan/Desktop/Projects/GreenPulse/render.yaml)
- **Behavior**: Free Web Services sleep after 15 minutes of inactivity; the first HTTP request automatically wakes up the server.

### Deploy Steps on Render:
1. Log in to [Render.com](https://render.com) using your GitHub account (`jisssz`).
2. Click **New** → **Web Service** → select repository **`jisssz/greenpulse`**.
3. Choose **Docker** as environment (Root Directory: `backend`).
4. Select **Free Plan** ($0/mo).
5. Set Environment Variables:
   - `PORT` = `8080`
   - `CORS_ALLOWED_ORIGINS` = `https://frontend-nine-woad-g8xvq6ys3s.vercel.app`
   - `DB_URL` = `jdbc:mysql://<FREE_MYSQL_HOST>:3306/greenpulsedb?useSSL=true`
   - `DB_USERNAME` = `<FREE_MYSQL_USER>`
   - `DB_PASSWORD` = `<FREE_MYSQL_PASSWORD>`
   - `JWT_SECRET` = `RenderAutoGenerateOrRandom256BitKey`
6. Click **Create Web Service**.

---

## 3. Zero-Cost MySQL Database Options

To avoid Railway's paid subscription or Render's paid disk, use any 100% free MySQL database host:

| Provider | Free Limit | Setup Instructions |
| :--- | :--- | :--- |
| **Aiven MySQL** | Free Tier ($0/mo) | Create free MySQL instance, run `schema.sql` and `seed.sql`. |
| **FreeSQLDatabase** | 5MB / 1 DB ($0/mo) | Free web account, import `schema.sql` & `seed.sql`. |
| **AlwaysData** | 10MB MySQL ($0/mo) | Free MySQL database, load schema & seed via phpMyAdmin. |

---

## 4. Environment Variables Reference

| Variable | Purpose |
| :--- | :--- |
| `VITE_API_BASE_URL` | Vercel variable pointing to Render backend URL (e.g. `https://greenpulse-backend.onrender.com/api`) |
| `DB_URL` | JDBC MySQL connection URL |
| `DB_USERNAME` | MySQL database username |
| `DB_PASSWORD` | MySQL database password |
| `JWT_SECRET` | Secret key for JWT signing |
| `CORS_ALLOWED_ORIGINS` | Vercel production origin (`https://frontend-nine-woad-g8xvq6ys3s.vercel.app`) |
