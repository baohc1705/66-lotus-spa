
export function roundVnd(value: number): number {
  return Math.round(value);
}

export function calcSuggestedMinPrice(
  totalCost: number,
  commissionRate: number,
): number {
  const rate = commissionRate || 0;
  if (rate <= 0 || rate >= 100) {
    return roundVnd(totalCost);
  }
  return roundVnd(totalCost / (1 - rate / 100));
}

export function calcSuggestedSellPrice(
  totalCost: number,
  commissionRate: number,
  desiredProfitPercent: number,
): number {
  const commission = commissionRate || 0;
  const profit = desiredProfitPercent || 0;
  const denom = 1 - commission / 100 - profit / 100;

  if (denom <= 0) {
    return calcSuggestedMinPrice(totalCost, commission);
  }
  return roundVnd(totalCost / denom);
}

export function calcCommissionAmount(
  sellingPrice: number,
  commissionRate: number,
): number {
  return roundVnd(sellingPrice * (commissionRate || 0) / 100);
}

export function calcGrossProfit(
  sellingPrice: number,
  totalCost: number,
  commissionAmount: number,
): number {
  return roundVnd(sellingPrice - totalCost - commissionAmount);
}

export function calcGrossMarginPercent(
  sellingPrice: number,
  grossProfit: number,
): number | null {
  if (!sellingPrice) return null;
  return Math.round((grossProfit / sellingPrice) * 10000) / 100;
}

export type ProfitTone = "profit" | "breakEven" | "loss";

export function getProfitTone(grossProfit: number | null | undefined): ProfitTone {
  if (grossProfit == null) return "breakEven";
  if (grossProfit > 0) return "profit";
  if (grossProfit < 0) return "loss";
  return "breakEven";
}

export function getProfitLabel(tone: ProfitTone): string {
  if (tone === "profit") return "Lãi";
  if (tone === "loss") return "Lỗ";
  return "Hòa";
}

export function getProfitBadgeClass(tone: ProfitTone): string {
  if (tone === "profit") {
    return "bg-state-success-bg text-state-success-text";
  }
  if (tone === "loss") {
    return "bg-state-danger-bg text-state-danger-text";
  }
  return "bg-adminGray-100 text-adminGray-600";
}

export function getProfitTextClass(tone: ProfitTone): string {
  if (tone === "profit") return "text-state-success-text";
  if (tone === "loss") return "text-state-danger-text";
  return "text-adminGray-600";
}
