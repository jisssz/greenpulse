# GreenPulse — Production Deployment Guide

This document provides complete instructions for deploying GreenPulse to production infrastructure (Vercel for Frontend, Java-compatible hosting provider for Spring Boot Backend, and Managed MySQL for Database).

---

## 1. Target Deployment Architecture

```text
                       www.greenpulse.demo (or Vercel domain)
                                  │
                                Vercel
                                  │
                         React 18 Frontend (Vite)
                                  │
                                  │ HTTPS REST Calls (JWT)
                                  ▼
                        api.greenpulse.demo (or Render/Railway domain)
                                  │
                       Spring Boot 3.2.3 Backend
                                  │
                                  ▼
                         Managed MySQL 8.0 Database
```

---

## 2. Managed MySQL Database Deployment

### Recommended Providers:
- **Railway** / **Render Managed MySQL** / **Aiven** / **PlanetScale**

### Steps:
1. Create a MySQL 8.0 instance on your database hosting provider.
2. Obtain the database connection details:
   - `DB_HOST` (e.g. `mysql.railway.internal` or `db.render.com`)
   - `DB_PORT` (e.g. `3306`)
   - `DB_NAME` (e.g. `greenpulsedb`)
   - `DB_USERNAME`
   - `DB_PASSWORD`
3. Execute the initialization scripts against your production database:
   ```bash
   mysql -h DB_HOST -P DB_PORT -u DB_USERNAME -p DB_NAME < database/schema.sql
   mysql -h DB_HOST -P DB_PORT -u DB_USERNAME -p DB_NAME < database/seed.sql
   ```

---

## 3. Spring Boot Backend Deployment

### Recommended Java Hosting Providers:
- **Render** / **Railway** / **Fly.io**

### Environment Variables to Configure on Host:

| Variable | Recommended Production Value |
| :--- | :--- |
| `PORT` | `8080` |
| `DB_URL` | `jdbc:mysql://DB_HOST:3306/greenpulsedb?useSSL=true&serverTimezone=UTC` |
| `DB_DRIVER` | `com.mysql.cj.jdbc.Driver` |
| `DB_DIALECT` | `org.hibernate.dialect.MySQLDialect` |
| `DB_USERNAME` | Production database user |
| `DB_PASSWORD` | Production database password |
| `JWT_SECRET` | Strong 256-bit secret key |
| `CORS_ALLOWED_ORIGINS` | `https://greenpulse.vercel.app` (or custom frontend domain) |
| `SQL_INIT_MODE` | `never` (since database is pre-initialized via schema.sql) |

### Production Build & Launch Commands:
- **Build**: `./.tools/apache-maven-3.9.6/bin/mvn clean package -DskipTests`
- **Launch Command**: `java -jar target/greenpulse-backend-1.0.0.jar`
- **Health Check Endpoint**: `GET https://YOUR-BACKEND-DOMAIN/api/health`

---

## 4. Vercel Frontend Deployment

### Configuration Settings:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Vercel Environment Variables:

| Variable | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://YOUR-BACKEND-DOMAIN/api` |

> **Note**: SPA route rewrites are pre-configured in `frontend/vercel.json` to prevent 404 errors on direct URL refreshes.

---

## 5. Custom Domain & DNS Setup (Optional)

If a custom domain (e.g. `greenpulse.demo`) is available:

1. **Frontend Domain (`www.greenpulse.demo`)**:
   - Add CNAME record pointing `www` to `cname.vercel-dns.com`.
2. **Backend Domain (`api.greenpulse.demo`)**:
   - Add CNAME record pointing `api` to your backend host target.
3. **CORS Update**:
   - Update `CORS_ALLOWED_ORIGINS` on backend to `https://www.greenpulse.demo`.
4. **Vercel API URL Update**:
   - Update `VITE_API_BASE_URL` in Vercel to `https://api.greenpulse.demo/api` and trigger redeploy.

---

## 6. File Storage Notice

> **Note**: In local development, evidence files are stored in `backend/uploads/`. For production deployment on ephemeral hosting environments (e.g. Render/Vercel), local server disk is not permanent. In enterprise production, an S3/Cloud Storage bucket adapter would replace the local disk storage provider.
