# GreenPulse — REST API Specification

Base URL: `http://localhost:8080/api`

## 1. Auth & Profile
- `POST /auth/login`: Authenticate and receive JWT token + user role details.
- `GET /auth/me`: Get current authenticated user profile.

## 2. Evidence Module
- `POST /evidence`: Submit new photo/video/CCTV evidence with automated SHA-256 hash.
- `GET /evidence/report/{reportId}`: Get evidence submitted for a specific report.
- `GET /evidence?status=VERIFIED`: List evidence by verification status (Moderator/Authority/Admin).
- `PATCH /evidence/{id}/verify`: Verify or reject evidence item.

## 3. Enforcement Module
- `POST /enforcement/cases`: Create new enforcement case `GP-ENF-2026-XXXXXX` (Authority/Admin).
- `GET /enforcement/cases`: List enforcement cases with optional status filter.
- `GET /enforcement/cases/{id}`: Get case details (offender info hidden for Citizens).
- `POST /enforcement/cases/{id}/mock-verify-identity`: Request simulated government lookup (Authority/Admin).
- `POST /enforcement/cases/{id}/notes`: Add investigation note (Authority/Admin).
- `PATCH /enforcement/cases/{id}/confirm-violation`: Confirm violation (Authority/Admin).

## 4. Fine & Challan Module
- `POST /fines/cases/{caseId}/issue-challan`: Issue municipal demo challan `GP-CHL-2026-XXXXXX` (Authority/Admin).
- `POST /fines/{fineId}/pay`: Mark fine as `PAID` and auto-calculate citizen reward.

## 5. Citizen Reward Module
- `GET /rewards/my`: Get citizen reward transaction history.
- `GET /rewards/my/summary`: Get citizen total rewards earned & pending count.
- `POST /rewards/{rewardId}/disburse`: Disburse reward payout (Authority/Admin).
- `GET /rewards/policy`: Get active reward policy rules.
- `PUT /rewards/policy`: Update reward policy (Admin only).
