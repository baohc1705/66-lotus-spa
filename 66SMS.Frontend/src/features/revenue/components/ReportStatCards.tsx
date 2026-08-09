import { StatCard } from "@/shared/widgets/StatCard";
import type { WidgetTone, WidgetValueTone } from "@/shared/widgets/WidgetContent";

export type ReportStatCardItem = {
  title: string;
  value: string;
  description?: string;
  tone?: WidgetTone;
  valueTone?: WidgetValueTone;
};

type Props = {
  cards: ReportStatCardItem[];
};

export function ReportStatCards({ cards }: Props) {
  return (
    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card: ReportStatCardItem) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          tone={card.tone ?? "default"}
          valueTone={card.valueTone}
        />
      ))}
    </div>
  );
}
