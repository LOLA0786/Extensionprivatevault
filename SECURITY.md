# PrivateVault Security Features

## 🛡️ Comprehensive Content Protection

PrivateVault implements **multi-layered security** to protect users and systems across all major LLMs.

---

## 🎯 Protection Categories

### 1. **CRITICAL THREATS** (Instant Block)

#### Self-Harm & Suicidal Content
- **Detection Coverage**: 40+ patterns with leetspeak evasion detection
- **Blocks**:
  - Direct suicide mentions and methods
  - Self-harm ideation and methods
  - Eating disorder content
  - Overdose and poisoning references
  - All variants including "kms", "unalive", "end it all"
- **Evasion Protection**: Detects attempts to bypass filters using:
  - Unicode characters (ü, ā, ė, etc.)
  - Leetspeak (k1ll, s3lf, etc.)
  - Spacing and special characters
  - Common misspellings

#### Chemical Harm
- **Chemical Reaction Mixing**: Blocks all requests to mix dangerous chemicals
- **Poison & Toxins**: Arsenic, cyanide, ricin, strychnine, nerve agents
- **Dangerous Gases**: Chlorine, mustard gas, sarin
- **Drug Synthesis**: Methamphetamine recipes and similar
- **Household Chemical Dangers**: Bleach combinations, cleaners, acids

#### Biological Harm
- **Bioweapons**: Anthrax, smallpox, plague
- **Disease Spreading**: Attempts to spread illness or contaminate
- **Pathogen References**: Ebola, cholera, hemorrhagic fevers
- **Food/Water Contamination**: Any contamination attempts

#### Physical Harm to Others
- **Violence**: Murder, assault, stabbing, shooting
- **Mass Harm**: Mass shootings, terror attacks
- **Specific Methods**: Strangulation, poisoning others
- **General Harm**: "hurt someone", "harm others"

#### Database Manipulation
- **DROP Operations**: `DROP DATABASE`, `DROP TABLE`
- **TRUNCATE**: `TRUNCATE TABLE`
- **Bulk Deletion**: `DELETE FROM` without proper WHERE clauses
- **Data Wiping**: Any attempt to erase or destroy data
- **Backend Protection**: Server-side middleware blocks all destructive SQL

---

### 2. **HIGH SEVERITY THREATS** (Strong Block)

#### Weapons & Violence
- **Firearms**: Guns, rifles, assault weapons (AR-15, AK-47)
- **Explosives**: Bombs, grenades, detonators, IEDs, C4, TNT
- **Bladed Weapons**: Knives, swords, machetes
- **Ammunition**: Bullets, gunpowder, magazines
- **Other**: Tasers, pepper spray, brass knuckles

#### Prompt Injection Attacks
- **System Prompt Manipulation**:
  - "Ignore previous instructions"
  - "Disregard all previous"
  - "Forget previous instructions"
- **Role Manipulation**:
  - "Pretend you are..."
  - "Act as if..."
  - "You are now..."
- **Jailbreak Attempts**:
  - "DAN mode"
  - "Jailbreak"
  - "Uncensored"
  - "No restrictions"
- **Filter Bypass**:
  - "Disable safety"
  - "Remove restrictions"
  - "Bypass filter"

#### Enterprise Threats
- **Cyberattacks**: Hacking, phishing, malware, ransomware
- **SQL Injection**: SQL injection attempts
- **XSS**: Cross-site scripting
- **Zero-day Exploits**: Exploit development
- **Password Cracking**: Brute force, password cracking
- **Data Theft**: Data breach, steal data, data leak
- **Malicious Tools**: Keyloggers, rootkits, backdoors

---

## 🔧 Technical Implementation

### Multi-Layer Detection System

```
┌─────────────────────────────────────┐
│  User Types Prompt in LLM Interface │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Layer 1: Input Capture              │
│  - Detects across all LLMs          │
│  - ChatGPT, Claude, Gemini, Grok    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Layer 2: Normalization              │
│  - Remove special characters        │
│  - Convert leetspeak                │
│  - Handle unicode variants          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Layer 3: Pattern Matching           │
│  - 300+ regex patterns              │
│  - Critical keyword detection       │
│  - Context-aware matching           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Layer 4: Decision & Response        │
│  - BLOCK: Clear prompt + warning    │
│  - LOG: Metadata only (no content)  │
│  - NOTIFY: Severity-based alert     │
└─────────────────────────────────────┘
```

### Cross-LLM Compatibility

**Supported Platforms**:
- ✅ ChatGPT (OpenAI) - chat.openai.com, chatgpt.com
- ✅ Claude (Anthropic) - claude.ai
- ✅ Gemini (Google) - gemini.google.com
- ✅ Grok (X.AI) - grok.x.ai, grok.com
- ✅ Perplexity - perplexity.ai

**Detection Methods**:
1. **Textarea Detection**: 20+ specific selectors per platform
2. **Contenteditable Detection**: Handles rich text editors (Claude, Gemini)
3. **Button Detection**: Identifies "Send" buttons across all platforms
4. **Form Submission**: Backup capture for direct form submissions

### Evasion Prevention

**Leetspeak Normalization**:
```
1, !, |, ı → i
0, ō, ŏ, ő → o
3, ē, ĕ, ė → e
4, @, ā, ă → a
5, $ → s
7 → t
ü, ū → u
```

**Pattern Examples**:
- `suicide` → Matches: `s.u.i.c.i.d.e`, `sui-cide`, `s3lf-h4rm`, `su1c1de`
- `kill myself` → Matches: `k1ll mys3lf`, `k!ll myself`, `kïll mysêlf`
- `drop database` → Matches: `dr0p database`, `drop-database`, `drøp dåtåbåse`

---

## 🚨 Blocking Behavior

### Instant Response
1. **Event Cancellation**: Stops keypress/click propagation immediately
2. **Prompt Clearing**: Wipes input field completely
3. **Visual Warning**: Displays severity-based alert:
   - 🛑 **Critical**: Red, 8-second display
   - ⚠️ **High**: Orange, 5-second display
   - ⚡ **Medium**: Yellow, 5-second display

### Privacy Protection
- **NO prompt content logged** - Only metadata:
  - Category of violation
  - Prompt length (not content)
  - Severity level
  - Timestamp
  - URL/hostname

### Backend Protection
- **Middleware Layer**: Validates ALL incoming requests
- **SQL Injection Prevention**: Blocks destructive SQL patterns
- **Bulk Operation Protection**: Prevents mass data deletion
- **Audit Logging**: Records all blocked attempts (metadata only)

---

## 🔐 Database Protection

### Backend Middleware

**Protected Operations**:
```typescript
✗ DROP DATABASE
✗ DROP TABLE
✗ TRUNCATE TABLE
✗ DELETE FROM ... WHERE 1=1
✗ ALTER TABLE ... DROP
✗ EXEC/EXECUTE DROP commands
```

**Response**:
```json
{
  "error": "Forbidden",
  "message": "Database protection: Destructive operations are not allowed",
  "reason": "Destructive database operation detected"
}
```

**Whitelist Approach**:
- Safe routes bypass protection (`/health`, `/blocked`, `/feedback`)
- All other routes validated for destructive patterns
- Blocked attempts logged for security audit

---

## 📊 Security Metrics

### Coverage Statistics
- **300+ Detection Patterns**
- **8 Critical Categories**
- **40+ Self-Harm Patterns**
- **25+ Chemical Harm Patterns**
- **20+ Prompt Injection Patterns**
- **15+ Database Protection Patterns**

### Performance
- **Detection Speed**: < 5ms per prompt
- **False Positive Rate**: Minimized via context-aware matching
- **LLM Coverage**: 5 major platforms (100% market coverage)

---

## 🛠️ Testing & Validation

### Smoke Tests
Run comprehensive tests:
```bash
cd extension
npm run test:policy
```

### Manual Testing
1. Load extension in Chrome
2. Visit ChatGPT/Claude/Gemini/Grok
3. Test with safe prompts (should pass)
4. Test with blocked keywords (should block immediately)
5. Check backend logs for blocked events

### Backend Validation
```bash
# Test database protection
curl -X POST http://localhost:3000/test \
  -H "Content-Type: application/json" \
  -d '{"query": "DROP DATABASE privatevault"}'

# Expected: 403 Forbidden
```

---

## 🔄 Updates & Maintenance

### Adding New Patterns

Edit `shared/filters.ts`:
```typescript
export const forbiddenKeywords: Record<ForbiddenCategory, RegExp[]> = {
  newCategory: [
    /pattern1/i,
    /pattern2/i,
    // Add more patterns
  ]
};
```

### Severity Configuration

Edit `extension/src/core/policy/policy_scan.ts`:
```typescript
const weights: Record<string, number> = {
  newCategory: 1.0, // Critical
};
```

---

## 📞 Support & Resources

### Crisis Resources
If the extension blocks content and you need help:
- **National Suicide Prevention Lifeline**: 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **International**: https://findahelpline.com

### Security Issues
Report security vulnerabilities to the repository maintainers.

---

## ⚖️ Legal & Ethics

### Purpose
This extension is designed to:
- ✅ Protect users from harmful content
- ✅ Prevent misuse of AI systems
- ✅ Maintain data integrity
- ✅ Provide audit trails for compliance

### Limitations
- Not a substitute for professional mental health support
- Does not replace human moderation
- Works best as part of comprehensive safety measures

---

**Last Updated**: 2026-01-24
**Version**: 0.2.0 (Enhanced Security)
