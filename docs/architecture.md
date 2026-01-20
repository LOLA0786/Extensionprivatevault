# PrivateVault Architecture

## Overview

PrivateVault is a **Chrome extension + backend control plane** that provides intent verification, cryptographic audit trails, and async governance for AI workflows.

## Core Principles

1. **Intent Verification** - Every AI interaction is hashed and signed
2. **Tamper-Evident** - Hash chains make any modification detectable  
3. **Replayable** - Full reconstruction of "what was known when"
4. **Async Governance** - Approve workflows, not individual actions
5. **Local-First** - Extension works offline, syncs when online

## System Architecture

┌──────────────────────────────────────────────────────────┐
│ Chrome Extension │
│ ┌────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ Content │ │ Background │ │ Sidebar UI │ │
│ │ Scripts │→ │Service Worker│→ │ (React/Zustand)│ │
│ │ │ │ │ │ │ │
│ │ Site │ │ • Crypto │ │ • Approval UI │ │
│ │ Adapters │ │ • Signing │ │ • Timeline │ │
│ │ │ │ • Queue │ │ • Policy View │ │
│ └────────────┘ └──────────────┘ └─────────────────┘ │
│ ↓ ↓ ↓ │
│ ┌────────────────────────────────────────────────┐ │
│ │ IndexedDB (Local Vault) │ │
│ │ • Events + Payloads │ │
│ │ • Hash Chain │ │
│ │ • Sync Queue │ │
│ └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
│
│ HTTPS (JWT + Signatures)
▼
┌──────────────────────────────────────────────────────────┐
│ Backend API (Fastify) │
│ ┌────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ Events │ │ Approvals │ │ Replay │ │
│ │ Service │ │ Service │ │ Service │ │
│ └────────────┘ └──────────────┘ └─────────────────┘ │
│ │ │ │ │
│ └────────────────┴────────────────────┘ │
│ ▼ │
│ ┌──────────────────────┐ │
│ │ Policy Engine │ │
│ │ • Risk Scoring │ │
│ │ • Pattern Matching │ │
│ │ • ML Classifiers │ │
│ └──────────────────────┘ │
│ │ │
│ ┌────────────────┴────────────────┐ │
│ ▼ ▼ │
│ ┌─────────────┐ ┌──────────────┐ │
│ │ Signature │ │ Hash Chain │ │
│ │ Verification│ │ Verification │ │
│ └─────────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────┐
│ Storage Layer │
│ ┌────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│ │ PostgreSQL │ │ S3 │ │ Redis │ │
│ │ │ │ │ │ │ │
│ │ • Events │ │ • Payloads │ │ • Queue │ │
│ │ • Users │ │ • Exports │ │ • Cache │ │
│ │ • Policies │ │ │ │ │ │
│ │ • Anchors │ │ │ │ │ │
│ └────────────┘ └──────────────┘ └─────────────────┘ │
└──────────────────────────────────────────────────────────┘

nginx
Copy code

## Data Flow

### 1. Capture (Extension → Local Vault)

When user interacts with an AI:

1. **Site Adapter** detects prompt submission
2. **Content Script** extracts prompt + context
3. **Background Worker** creates event:
   ```typescript
   {
     intentHash: sha256(canonical(payload)),
     parentHash: previousEvent?.chainHash || null,
     chainHash: sha256(parentHash + intentHash + meta),
     signature: ed25519.sign(chainHash, privateKey)
   }
Local Store saves to IndexedDB

Sidebar UI updates immediately

2. Sync (Extension → Backend)
Background worker batches events and syncs:

Queue events for sync

Send batch to /v1/events/batch

Backend verifies signatures

Backend stores in Postgres + S3

Returns policy decisions

Extension updates UI with decisions

3. Policy Evaluation
Backend evaluates each event:

Pattern Matching - Check for credentials, PII, etc.

Risk Scoring - 0-100 score based on matched patterns

Policy Decision:

ALLOW - No issues detected

WARN - Low risk patterns found

BLOCK - Critical patterns found

REQUIRE_APPROVAL - High risk, needs human review

4. Async Approval
For REQUIRE_APPROVAL events:

Backend creates ApprovalRequest

Notification sent to admin

Admin reviews in dashboard

Decision recorded in audit log

Extension polls for decision

Action executed/blocked based on approval

## Deployment

### Development

```bash
# Start all services
docker-compose up

# Extension development
cd extension && npm run dev
# Load in Chrome: chrome://extensions → Load unpacked → extension/dist
Production
Extension:

bash
Copy code
cd extension
npm run build
npm run package
# Upload privatevault-extension.zip to Chrome Web Store
Backend:

bash
Copy code
cd backend
npm run build
docker build -t privatevault-api .
# Deploy to AWS/GCP/Azure
Next Steps
Implement remaining site adapters (Gemini, Perplexity)

Build admin dashboard (React app for approval management)

Add ML classifier (for advanced risk detection)

SOC2 compliance (implement required controls)

Chrome Web Store (publish extension)
