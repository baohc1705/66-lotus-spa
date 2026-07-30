type StatCard = {
  title: string;
  value: string;
  className?: string;
};

type Props = {
  cards: StatCard[];
};

export function ReportStatCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card: StatCard) => (
        <div
          key={card.title}
          className={`rounded-lg p-4 text-white ${card.className ?? "bg-sky-500"}`}
        >
          <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
            {card.title}
          </div>
          <div className="mt-2 text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
