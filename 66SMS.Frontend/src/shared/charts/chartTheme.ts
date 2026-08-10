export const chartColors = {
  red: "#dc3545",
  orange: "#fd7e14",
  yellow: "#ffc107",
  green: "#28a745",
  blue: "#007bff",
  purple: "#6f42c1",
  grey: "#6c757d",
  primary: "#3f6ad8",
};

export const CHART_PALETTE = [
  chartColors.red,
  chartColors.orange,
  chartColors.yellow,
  chartColors.green,
  chartColors.blue,
  chartColors.purple,
  chartColors.grey,
];

export const CHART_HEIGHT = 320;

export type ChartSeries = {
  dataKey: string;
  color: string;
  name?: string;
};
