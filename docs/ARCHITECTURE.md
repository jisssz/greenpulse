# GreenPulse — Architecture Documentation

## 1. High-Level Architecture Diagram

```
[ Citizen / CCTV / External Source ]
               │
               ▼
   [ Evidence Upload Module ]
  (Calculates SHA-256 Hash)
               │
               ▼
     [ React Vite Frontend ]
               │
               ▼ (JWT Authenticated REST API)
     [ Spring Boot REST API ]
               │
   ┌───────────┼───────────┬────────────────────┐
   ▼           ▼           ▼                    ▼
[Evidence   [Report     [Enforcement         [Fine &
 Service]   Service]     Service]        Reward Service]
                           │                    │
                           ▼                    ▼
                [Government Integration  [Citizen Reward
                    Adapter Layer]          Calculator]
                           │
                           ▼
              [Mock Authority Provider]
```

---

## 2. Database Schema Architecture

The relational schema consists of 16 normalized tables:
- `users`, `categories`, `reports`, `report_images`
- `evidence`, `enforcement_cases`, `offenders`, `investigation_notes`
- `fines`, `reward_policies`, `rewards`, `government_verifications`
- `report_status_history`, `comments`, `notifications`, `audit_logs`

---

## 3. Security & RBAC Matrix

| Role | Access Permissions |
| :--- | :--- |
| `CITIZEN` | Submit reports & evidence, confirm resolution, view rewards. Cannot access offender data or issue fines. |
| `AUTHORITY_OFFICER` | Review evidence, create enforcement cases, request mock govt lookups, issue challans, disburse rewards. |
| `MODERATOR` | Verify evidence, triage reports, set priority, assign field workers. |
| `FIELD_WORKER` | View assigned tasks, mark in progress, submit resolution evidence. |
| `ADMIN` | System analytics, reward policy configuration, full audit logs. |
