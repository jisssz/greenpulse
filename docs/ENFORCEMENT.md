# GreenPulse — Enforcement, Evidence & Citizen Reward Infrastructure

## 1. Executive Summary

GreenPulse is a **Civic Environmental Reporting, Evidence & Enforcement Platform** connecting Citizens, Moderators, Field Workers, Authority Officers, and Admins.

It operates two distinct and complementary operational workflows:
1. **Issue Resolution Lifecycle**: `SUBMITTED` → `UNDER_REVIEW` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `RESOLUTION_VERIFICATION` → `CLOSED`.
2. **Enforcement & Reward Lifecycle**: `Citizen Evidence` → `Verification` → `Enforcement Case Created` → `Authority Investigation` → `Mock Govt Verification` → `Violation Confirmed` → `Challan Issued` → `Fine Paid` → `Citizen Reward Approved & Disbursed` → `Case Closed`.

---

## 2. Key Architecture & Differentiators

### A. Cryptographic Evidence Integrity (SHA-256)
All evidence items (Citizen Photos/Videos, Municipal CCTV Feeds) have an automated SHA-256 cryptographic hash calculated upon upload (`evidence_hash`). This allows the platform to verify that evidence files have not been tampered with or altered after submission.

### B. Strict Privacy & Identity Protections
- **No Raw Aadhaar Storage**: GreenPulse does NOT query or store raw Aadhaar numbers or facial biometrics.
- **Masked References**: Offender records use masked reference IDs (e.g. `DEMO-REF-8849-XXXX`) and vehicle references (`KA-01-EQ-9921`).
- **Privacy Scoping**: Citizens CANNOT access offender details or internal officer investigation notes (`is_internal = true`).

### C. Government Integration Abstraction Layer
`GovernmentIntegrationService` interface with `MockGovernmentIntegrationProvider` returning clearly labeled `DEMO / SIMULATED GOVERNMENT INTEGRATION` results. This allows seamless replacement with authorized government APIs in production.

### D. Citizen Reward Incentive System
Rewards are calculated **ONLY AFTER** a municipal fine/challan is successfully marked as `PAID`.
- Configurable Reward Policy (e.g. 10% of fine amount, capped at max ₹500).
- Fraud prevention checks prevent duplicate rewards for the same case.

---

## 3. Demo Credentials (`password123` for all)

| Role | Demo Email | Capabilities |
| :--- | :--- | :--- |
| **Citizen** | `citizen@greenpulse.demo` | Submit reports & evidence, view non-sensitive case progress, track earned rewards |
| **Authority Officer** | `officer@greenpulse.demo` | Investigate enforcement cases, run mock govt lookups, issue challans, disburse rewards |
| **Moderator** | `moderator@greenpulse.demo` | Verify evidence, triage reports, set priorities, assign field workers |
| **Field Worker** | `worker@greenpulse.demo` | Receive task assignments, upload resolution evidence photos |
| **Admin** | `admin@greenpulse.demo` | System-wide analytics, configure reward policies, audit logs |

---

## 4. End-to-End Demonstration Steps

1. **Submit Evidence**: Citizen logs in, submits report and evidence photo with SHA-256 hash.
2. **Verify Evidence**: Moderator/Authority verifies evidence status (`VERIFIED`).
3. **Open Enforcement Case**: Authority Officer (`officer@greenpulse.demo`) opens Case `GP-ENF-2026-XXXXXX`.
4. **Mock Govt Verification**: Authority Officer executes vehicle lookup (`KA-01-EQ-9921`), receiving simulated verification `AUTH-DEMO-XXXX`.
5. **Issue Challan**: Authority Officer issues Demo Challan `GP-CHL-2026-XXXXXX` (e.g. ₹3,000 fine).
6. **Mark Fine Paid**: Authority Officer updates fine status to `PAID`.
7. **Auto-Reward Calculation**: System calculates 10% citizen reward (₹300) and notifies Citizen.
8. **Disburse Reward**: Authority Officer approves reward payout (`PAID`).
9. **Citizen Rewards Dashboard**: Citizen views total earned rewards and transaction history at `/rewards`.
