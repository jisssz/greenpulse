# GreenPulse

### Civic Environmental Reporting & Enforcement Platform

**Report. Verify. Resolve. Improve.**

---

## 🔗 Live Links

- **GitHub Repository**: [https://github.com/jisssz/greenpulse](https://github.com/jisssz/greenpulse)
- **Deployed Frontend (Vercel)**: [https://frontend-nine-woad-g8xvq6ys3s.vercel.app](https://frontend-nine-woad-g8xvq6ys3s.vercel.app)
- **Local API Endpoint**: `http://localhost:8080/api` (Health Check: `http://localhost:8080/api/health`)

---

GreenPulse is a full-stack civic-tech platform designed to connect citizen environmental reporting with evidence verification, operational resolution, authority-controlled enforcement workflows, fine tracking, contributor incentives, and environmental analytics.

---

## 🚨 Problem

Illegal dumping, overflowing public bins, open waste burning, plastic pollution, construction waste, and other environmental issues are often reported through fragmented channels.

Citizens may not know:

- Where to report an issue
- Whether their report was received
- Whether action was taken
- What happened after submission

Authorities also need structured workflows for:

- Evidence verification
- Assignment
- Resolution
- Enforcement
- Accountability
- Analytics

GreenPulse attempts to connect these stages into a single workflow.

---

## 💡 Solution

GreenPulse provides two connected workflows.

### Resolution Workflow

```text
Citizen Report
      ↓
Verification
      ↓
Assignment
      ↓
Field Worker
      ↓
Cleanup
      ↓
Citizen Verification
      ↓
Closed
```

### Enforcement Workflow

```text
Citizen / Authorized Evidence
          ↓
      Verification
          ↓
   Enforcement Case
          ↓
      Investigation
          ↓
 Simulated Government Verification
          ↓
   Violation Confirmed
          ↓
      Demo Fine
          ↓
     Payment Recorded
          ↓
   Contributor Reward
          ↓
        Closed
```

---

## ✨ Key Features

### Citizen

- Register / login
- Environmental issue reporting
- Geo-tagged reports with Leaflet map pin
- Evidence upload (with SHA-256 hash calculation)
- Report status tracking
- Resolution verification loop (`YES, RESOLVED` / `NO, STILL PRESENT`)
- Notifications
- Contribution history
- Reward dashboard

### Moderator

- Evidence review queue
- Report verification
- Duplicate handling (500m radius duplicate detection)
- Priority management (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- Worker assignment
- Moderation notes

### Field Worker

- Assigned task queue
- Work status (`IN_PROGRESS`)
- Before/after evidence photo upload
- Resolution notes
- Resolution completion

### Authority

- Enforcement cases (`GP-ENF-2026-XXXXXX`)
- Evidence investigation & notes
- Simulated government verification (`VEHICLE_LOOKUP`)
- Violation confirmation
- Demo fine/challan workflow (`GP-CHL-2026-XXXXXX`)
- Payment tracking
- Enforcement analytics

### Admin

- User role management
- Category management
- Reward policy configuration
- System analytics
- Audit logs

---

## 🔐 Security

- JWT authentication & Spring Security
- Role-based access control (RBAC across 5 roles)
- Report ownership protection (IDOR protection)
- Backend authorization authority
- SHA-256 evidence file integrity
- File upload validation (extension whitelist & path traversal protection)
- Internal note privacy filtering (`is_internal = true` hidden from citizens)
- Sensitive enforcement data filtering (`offender: null` for citizens)
- Environment-based secrets configuration

---

## 🧩 Evidence Integrity

Uploaded evidence receives a SHA-256 cryptographic hash.

The hash helps verify whether the stored evidence file has changed after submission.

> **Important**: SHA-256 provides file integrity verification; it does not prove that the evidence itself is genuine.

---

## 🏛️ Government Integration

GreenPulse does NOT directly access Aadhaar, UIDAI, government identity databases, or real government enforcement systems.

Instead, the application uses an integration abstraction:

```text
GreenPulse
     ↓
GovernmentIntegrationService
     ↓
MockGovernmentIntegrationProvider
```

This allows a future authorized integration to replace the mock provider without redesigning the core enforcement workflow.

All government verification, challan, payment, and reward functionality included in this project is simulated.

---

## 💰 Citizen Reward Model

GreenPulse supports a configurable demonstration reward policy.

Example:

```text
Fine Amount:       ₹3,000
Reward Rate:       10%
Reward:            ₹300
Maximum Cap:       ₹500
```

Rewards are only eligible after the configured enforcement workflow has been completed and the fine is marked `PAID`.

Actual reward policies would depend on applicable law and authorized government programs.

---

## 📊 Analytics

The platform provides:

- Total report statistics & resolution turnarounds
- Resolution rate percentage
- Category distribution
- Priority distribution
- Enforcement cases count
- Fine collection totals
- Reward statistics
- Interactive Leaflet spatial hotspot map

Analytics are generated directly from backend database queries.

---

## 🏗️ Architecture

```text
React + Vite
      ↓
REST API
      ↓
Spring Boot
      ↓
Controller
      ↓
Service
      ↓
Repository
      ↓
JPA / Hibernate
      ↓
MySQL
```

Security:

```text
React
  ↓
JWT
  ↓
Spring Security
  ↓
Role-Based Authorization
```

---

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Leaflet (Maps)
- Chart.js (Charts)
- Lucide Icons

### Backend

- Java 17
- Spring Boot 3.2.3
- Spring Security
- JWT (io.jsonwebtoken)
- Spring Data JPA
- Hibernate
- Maven

### Database

- MySQL 8.0 / H2 in-memory for testing

### Tools

- Git & GitHub
- Postman
- Docker & Docker Compose

---

## 👥 User Roles

| Role | Demo Account | Main Responsibility |
| :--- | :--- | :--- |
| **Citizen** | `citizen@greenpulse.demo` | Report and track environmental issues, confirm resolution, view rewards |
| **Moderator** | `moderator@greenpulse.demo` | Verify reports and evidence, assign field workers |
| **Field Worker** | `worker@greenpulse.demo` | Resolve operational issues on site, upload resolution photos |
| **Authority Officer** | `officer@greenpulse.demo` | Investigate enforcement cases, run mock govt lookups, issue challans, disburse rewards |
| **Admin** | `admin@greenpulse.demo` | Platform management, analytics, reward policy config, audit logs |

*All demo accounts use password:* `password123` (*DEMO ONLY — NOT FOR PRODUCTION*)

---

## 🗄️ Database

The system uses a normalized relational database with 16 entities:

- `users`, `categories`, `reports`, `report_images`
- `evidence`, `enforcement_cases`, `offenders`, `investigation_notes`
- `fines`, `reward_policies`, `rewards`, `government_verifications`
- `report_status_history`, `comments`, `notifications`, `audit_logs`

Schema definition: [database/schema.sql](file:///Users/jisshajan/Desktop/Projects/GreenPulse/database/schema.sql)  
Seed records: [database/seed.sql](file:///Users/jisshajan/Desktop/Projects/GreenPulse/database/seed.sql)

---

## 📸 Screenshots

Refer to the [screenshots/README.md](file:///Users/jisshajan/Desktop/Projects/GreenPulse/screenshots/README.md) guide for presentation screenshots.

---

## 🚀 Local Setup

### Requirements

- Java 17
- Maven 3.9+
- Node.js 18+
- npm 9+
- MySQL 8.0 (Optional, H2 loaded by default)

---

### Backend Execution

```bash
cd backend
../.tools/apache-maven-3.9.6/bin/mvn spring-boot:run -Dmaven.repo.local=../.tools/m2-repo
```

Backend runs on `http://localhost:8080` (Health check at `http://localhost:8080/api/health`).

---

### Frontend Execution

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## 🔧 Environment Variables

See [.env.example](file:///Users/jisshajan/Desktop/Projects/GreenPulse/.env.example) for environment configuration.

---

## 🧪 Testing

Backend automated unit test suite:

```bash
cd backend
../.tools/apache-maven-3.9.6/bin/mvn clean test -Dmaven.repo.local=../.tools/m2-repo
```

Current verified test result: **21/21 tests passed** (`BUILD SUCCESS`).

Frontend production build:

```bash
cd frontend
npm run build
```

---

## 📬 API & Documentation

- [Product Documentation](docs/PRODUCT.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Enforcement Workflow Guide](docs/ENFORCEMENT.md)
- [Final Engineering Audit](docs/FINAL_AUDIT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## ⚠️ Prototype Disclaimer

GreenPulse is an educational/portfolio prototype.

Government identity verification, vehicle verification, challan issuance, payment processing, CCTV integration, and citizen reward mechanisms shown in this project are simulated demonstrations and do not represent actual integration with Indian government systems or legal enforcement authority.

The project does not store raw Aadhaar information or biometric data and does not provide direct access to UIDAI or government identity databases.

Actual enforcement procedures, penalties, identity verification, payment systems, and reward programs would require appropriate legal authority, government integration, privacy controls, and applicable policies.

---

## 👨‍💻 Author

**Jis Shajan**  
Computer Science & Engineering — Data Science  

---

## 📄 License

Educational & Portfolio Use Only.
