# GreenPulse — Product Documentation

## 1. Product Positioning
GreenPulse is a **Civic Environmental Reporting, Evidence & Enforcement Platform**.

Unlike simple complaint ticketing systems, GreenPulse integrates community environmental vigilance, cryptographic evidence integrity (SHA-256), authority-led enforcement workflows, municipal fine tracking, and citizen participation rewards into a unified platform.

---

## 2. Core Capabilities

### A. Dual Operational Workflows
1. **Resolution Workflow**: `SUBMITTED` → `UNDER_REVIEW` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `RESOLUTION_VERIFICATION` → `CLOSED`.
2. **Enforcement Workflow**: `Evidence Submitted` → `Evidence Verified` → `Enforcement Case Opened` → `Authority Investigation` → `Mock Govt Identity Lookup` → `Violation Confirmed` → `Challan Issued` → `Fine Paid` → `Citizen Reward Approved` → `Case Closed`.

### B. Citizen Reward Incentive Infrastructure
- Rewards are generated **ONLY AFTER** municipal fines are marked `PAID`.
- Configurable reward policy (e.g. 10% of fine amount, capped at max ₹500).
- Fraud risk checks prevent duplicate reward claims.

### C. Privacy & Security Safeguards
- Zero storage of raw Aadhaar numbers or facial biometrics.
- Masked reference IDs and vehicle references used for enforcement records.
- Citizen callers cannot view offender personal data or internal officer investigation notes.

---

## 3. Demo Account Matrix (`password123` for all)
- **Authority Officer**: `officer@greenpulse.demo`
- **Citizen**: `citizen@greenpulse.demo`
- **Moderator**: `moderator@greenpulse.demo`
- **Field Worker**: `worker@greenpulse.demo`
- **Admin**: `admin@greenpulse.demo`
