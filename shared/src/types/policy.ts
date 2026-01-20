import type { PolicyDecision } from './events';

export interface PolicyEvaluationResult {
  decision: PolicyDecision;
  riskScore: number;
  reason: string;
}
