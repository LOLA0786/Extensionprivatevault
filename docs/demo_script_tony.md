# Demo Script for Tony

This is the exact script to show Tony how PrivateVault works in a live demo.

## Setup (5 minutes before demo)

1. **Start backend:**
   ```bash
   cd backend
   docker-compose up -d
   npm run db:migrate
   npm run dev
Build extension:

bash
Copy code
cd extension
npm run dev
Load extension in Chrome:

Open chrome://extensions

Enable "Developer mode"

Click "Load unpacked"

Select extension/dist

Create test user:

bash
Copy code
curl -X POST http://localhost:3000/v1/auth/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "demo-device",
    "publicKey": "...",
    "deviceInfo": { "browser": "Chrome", "os": "macOS" }
  }'

## Demo Flow (10 minutes)

### Part 1: Show The Problem (2 min)

**You:** "Right now, when people use ChatGPT or Claude for work, there's zero governance. Let me show you..."

1. Open ChatGPT
2. Type: `Write me a SQL query to delete all users from the users table`
3. **Point out:** "It just... executes. No approval, no audit trail, nothing."

### Part 2: Install PrivateVault (1 min)

**You:** "Now let's install PrivateVault."

1. Click extension icon in Chrome
2. **Show:** "It's now active on this page"
3. **Point out:** Sidebar appears on right side

### Part 3: Capture + Hash (2 min)

**You:** "Watch what happens now when I submit the same prompt..."

1. Type same dangerous query
2. **Before hitting Enter:** "PrivateVault is already capturing this"
3. Hit Enter
4. **Point to sidebar:**
   - "See this? Intent hash generated instantly"
   - "Everything is cryptographically signed"
   - "Can't be tampered with"

### Part 4: Policy Enforcement (2 min)

**You:** "But here's the magic - it's not just logging, it's governing."

1. **Show banner:** "⚠️ High Risk: SQL deletion detected"
2. **Point out:** "Policy engine flagged this automatically"
3. **Show decision:** "Requires approval before execution"
4. Click "Request Approval"
5. **Show:** Approval request sent to backend

### Part 5: Async Governance (2 min)

**You:** "This is where it gets powerful. Instead of blocking me, it..."

1. Open backend dashboard (localhost:3000/admin)
2. **Show:** Approval request appears
3. **Show details:**
   - What was the prompt
   - Risk score (85/100)
   - Why it was flagged
   - Who requested it
4. **Approve it**
5. **Back to ChatGPT:** Action now unlocked

### Part 6: Replay + Audit (1 min)

**You:** "And now for the goldmine - complete replayability."

1. Open sidebar "Timeline" view
2. **Show:** Every interaction logged
3. Click on event
4. **Show:**
   - Original prompt
   - Response received
   - Approval chain
   - Cryptographic proof
5. **Point out:** "This is SOC2-grade evidence, automatically."

## Key Talking Points

### For each part, emphasize:

**Problem (Part 1):**
- "Companies are spending millions on AI agents with zero control"
- "One leaked API key, one bad SQL query, and you're done"

**Solution (Part 2-3):**
- "PrivateVault sits between human and agent"
- "Always present, always capturing, impossible to ignore"

**Governance (Part 4-5):**
- "This isn't just logging - it's real-time policy enforcement"
- "Async means it scales - you're not clicking 'approve' 1000 times a day"
- "Approve workflows, approve categories, then let it run"

**Value (Part 6):**
- "This becomes your flight recorder for AI work"
- "Compliance teams will pay millions for this"
- "It's the missing layer between 'AI agents' and 'enterprise adoption'"

## Demo Variations

### For Technical Audience:

**Add:**
- Show hash chain in console
- Verify signature manually
- Show Merkle tree construction

### For Business Audience:

**Add:**
- Show policy templates (PCI, HIPAA, SOC2)
- Show org dashboard
- Show audit export

### For Security Audience:

**Add:**
- Show threat model
- Explain cryptographic guarantees
- Show penetration test results

## Common Questions & Answers

**Q: "Can't users just disable the extension?"**
A: "In enterprise deployment, extension is force-installed via Chrome Enterprise. MDM ensures it can't be disabled."

**Q: "What if the backend is down?"**
A: "Extension works offline. Everything is stored locally with cryptographic proof. Syncs when backend returns."

**Q: "How do you handle latency?"**
A: "Hashing and signing happen locally in <10ms. Policy evaluation is async - doesn't block the user."

**Q: "What about privacy?"**
A: "Local-first mode keeps everything in extension. Backend is optional. Cryptography ensures we can prove integrity without seeing content."

**Q: "How is this different from logging?"**
A: "Logging is append-only text. This is cryptographically signed, hash-chained, merkle-anchored proof. Can't be forged. Can be verified independently."

## Success Metrics

After demo, Tony should say one of:

- ✅ "Holy shit, this is real"
- ✅ "This could become the standard"
- ✅ "This scales beyond human bottlenecks"
- ✅ "When can I invest?"

## Next Steps After Demo

If Tony is interested:

1. **Share GitHub repo:** `github.com/LOLA0786/PrivateVault-Mega-Repo`
2. **Schedule follow-up:** "Let me show you the GitHub integration"
3. **Get feedback:** "What would make this enterprise-ready for you?"

## Emergency Backup

If demo breaks:

1. **Have video recording** of working demo ready
2. **Have screenshots** of each step
3. **Walk through architecture** instead of live demo

---

**Remember:** The demo is not about the code. It's about showing Tony that:
1. The problem is real (ungoverned AI)
2. The solution is elegant (intent verification + async governance)
3. The market is huge (every company using AI)
4. You can execute (working extension + backend)
