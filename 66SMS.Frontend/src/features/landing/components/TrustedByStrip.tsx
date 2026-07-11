const PARTNERS = [
  "Sen Đồng Tháp",
  "Herbal Việt",
  "Lotus Wellness",
  "Cao Lãnh Living",
  "Đông Y Heritage",
  "Organic Spa Co.",
  "Mekong Botanicals",
  "Zen Retreat",
];

export const TrustedByStrip = () => {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section
      id="trusted"
      className="border-b border-warm-100 bg-rose-50/80 py-7 sm:py-8"
      aria-label="Đối tác tin tưởng"
    >
      <div className="landing-container">
        <div className="mb-5 flex items-center gap-3">
          <span className="shrink-0 font-geist text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">
            Được tin tưởng bởi
          </span>
          <div className="h-px flex-1 bg-warm-100" aria-hidden="true" />
        </div>

        <div className="trusted-marquee">
          <div className="trusted-marquee__track flex items-center gap-12 pr-12 sm:gap-14">
            {items.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="shrink-0 font-display text-lg font-semibold tracking-[0.02em] text-ink sm:text-xl"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
