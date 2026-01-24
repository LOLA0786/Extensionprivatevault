export type PolicyDecision = 'ALLOW' | 'WARN' | 'BLOCK';

export type PolicyResult = {
  decision: PolicyDecision;
  riskScore: number; // 0..1
  signals: string[];
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function maxRiskFromSignals(signals: string[]): number {
  // Severity table - CRITICAL categories get immediate block
  const weights: Record<string, number> = {
    // CRITICAL - Instant block
    selfHarm: 1.0,
    chemicalHarm: 1.0,
    biologicalHarm: 1.0,
    physicalHarm: 1.0,
    databaseManipulation: 1.0,

    // HIGH - Strong block
    weapons: 0.95,
    promptInjection: 0.92,
    enterpriseThreats: 0.90,
    hateSpeech: 0.88,

    // MEDIUM
    profanity: 0.3,
    ai_moderated: 0.8,
  };

  let r = 0;
  for (const s of signals) {
    r = Math.max(r, weights[s] ?? 0.2);
  }
  return clamp01(r);
}

export function scanPolicy(prompt: string, signals: string[] = []): PolicyResult {
  const clean = (prompt ?? '').trim();

  // Default signals-based risk
  let riskScore = maxRiskFromSignals(signals);

  // If prompt is empty => allow
  if (!clean) {
    return { decision: 'ALLOW', riskScore: 0, signals: [] };
  }

  // Decision thresholds
  let decision: PolicyDecision = 'ALLOW';

  if (riskScore >= 0.85) decision = 'BLOCK';
  else if (riskScore >= 0.4) decision = 'WARN';

  return {
    decision,
    riskScore,
    signals,
  };
}
