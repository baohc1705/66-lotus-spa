
export function roundVnd(value: number): number {
  return Math.round(value);
}

export function calcSuggestedMinPrice(
  totalCost: number,
  commissionRate: number,
): number {
  const rate = Math.min(Math.max(commissionRate || 0, 0), 99.99);
  if (rate <= 0) {
    return roundVnd(totalCost);
  }
  return roundVnd(totalCost / (1 - rate / 100));
}

export function calcSuggestedSellPrice(
  totalCost: number,
  commissionRate: number,
  desiredProfitPercent: number,
): number {
  const commission = Math.min(Math.max(commissionRate || 0, 0), 99.99);
  const profit = Math.max(desiredProfitPercent || 0, 0);
  const afterCommission = 1 - commission / 100;

  if (afterCommission <= 0) {
    return roundVnd(totalCost);
  }

  return roundVnd((totalCost * (1 + profit / 100)) / afterCommission);
}

export function calcCommissionAmount(
  sellingPrice: number,
  commissionRate: number,
): number {
  return roundVnd((sellingPrice * (commissionRate || 0)) / 100);
}

export function calcGrossProfit(
  sellingPrice: number,
  totalCost: number,
  commissionAmount: number,
): number {
  return roundVnd(sellingPrice - totalCost - commissionAmount);
}

const MAX_PERCENT_DISPLAY = 999;

function toDisplayPercent(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (Math.abs(value) > MAX_PERCENT_DISPLAY) return null;
  return Math.round(value * 100) / 100;
}

export function calcGrossMarginPercent(
  sellingPrice: number,
  grossProfit: number,
): number | null {
  if (!sellingPrice || sellingPrice <= 0) return null;
  return toDisplayPercent((grossProfit / sellingPrice) * 100);
}

export function calcMarkupOnCostPercent(
  totalCost: number,
  grossProfit: number,
): number | null {
  if (!totalCost || totalCost <= 0) return null;
  return toDisplayPercent((grossProfit / totalCost) * 100);
}

export type ProfitTone = "profit" | "breakEven" | "loss";

export function getProfitTone(
  grossProfit: number | null | undefined,
): ProfitTone {
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
