export function calculateXP(score, tokensUsed, tokenBudget, baseReward) {
  const qualityXP = Math.floor((score / 100) * baseReward);
  const efficiencyBonus = tokenBudget > 0
    ? Math.floor(Math.max(0, (tokenBudget - tokensUsed) / tokenBudget) * 50)
    : 0;
  return qualityXP + efficiencyBonus;
}

export function calculateLevel(xp) {
  return Math.max(1, Math.floor(1 + Math.sqrt(xp / 100)));
}
