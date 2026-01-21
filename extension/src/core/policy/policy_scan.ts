export type PolicyDecision = 'ALLOW' | 'WARN' | 'BLOCK';

export interface PolicySignal {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  match: string;
}

export interface PolicyResult {
  decision: PolicyDecision;
  riskScore: number;
  signals: PolicySignal[];
}

type Rule = {
  id: string;
  label: string;
  severity: PolicySignal['severity'];
  score: number;
  pattern: RegExp;
};

const RULES: Rule[] = [
  { id: 'pi_ignore_prev', label: 'Prompt injection: override instructions', severity: 'high', score: 0.35, pattern: /\b(ignore|disregard)\b.{0,50}\b(previous|prior)\b.{0,30}\b(instruction|rules)\b/i },
  { id: 'pi_dev_mode', label: 'Jailbreak / developer mode', severity: 'high', score: 0.35, pattern: /\b(developer\s*mode|jailbreak)\b/i },
  { id: 'pi_system_prompt', label: 'Policy extraction: system prompt', severity: 'critical', score: 0.6, pattern: /\b(system\s*prompt|hidden\s*instructions|internal\s*polic(y|ies))\b/i },
  { id: 'pi_cot', label: 'Policy extraction: chain-of-thought', severity: 'critical', score: 0.6, pattern: /\b(chain[-\s]*of[-\s]*thought|reasoning\s*trace)\b/i },
  { id: 'bypass_logging', label: 'Bypass attempt: disable audit/logging', severity: 'critical', score: 0.7, pattern: /\b(do\s*not\s*log|disable\s*(logging|audit)|turn\s*off\s*privatevault)\b/i },
  { id: 'secrets_aws', label: 'Secrets: AWS key pattern', severity: 'critical', score: 0.8, pattern: /\bAKIA[0-9A-Z]{16}\b/i },
  { id: 'secrets_openai', label: 'Secrets: OpenAI key pattern', severity: 'critical', score: 0.8, pattern: /\bsk-[a-zA-Z0-9]{20,}\b/i },
  { id: 'malware_defender', label: 'Malware: disable Defender/EDR', severity: 'critical', score: 0.8, pattern: /\b(disable|turn\s*off)\b.{0,30}\b(defender|antivirus|edr)\b/i },
];

function severityFloor(sev: PolicySignal['severity']): number {
  return sev === 'critical' ? 0.9 : sev === 'high' ? 0.6 : sev === 'medium' ? 0.35 : 0.15;
}

export function scanPrompt(prompt: string): PolicyResult {
  const signals: PolicySignal[] = [];

  for (const rule of RULES) {
    const m = prompt.match(rule.pattern);
    if (m) {
      signals.push({
        id: rule.id,
        label: rule.label,
        severity: rule.severity,
        score: rule.score,
        match: m[0].slice(0, 140),
      });
    }
  }

  let riskScore = Math.min(1, signals.reduce((a, s) => a + s.score, 0));

  const sevRank: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  const maxSev = signals.reduce<PolicySignal['severity'] | null>((acc, s) => {
    if (!acc) return s.severity;
    return sevRank[s.severity] > sevRank[acc] ? s.severity : acc;
  }, null);

  if (maxSev) riskScore = Math.max(riskScore, severityFloor(maxSev));

  let decision: PolicyDecision = 'ALLOW';
  if (riskScore >= 0.85) decision = 'BLOCK';
  else if (riskScore >= 0.45) decision = 'WARN';

  return { decision, riskScore, signals };
}
