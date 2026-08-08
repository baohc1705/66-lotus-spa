import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

const SOLID_SWATCHES = [
  { name: "primary", className: "bg-kit-primary" },
  { name: "secondary", className: "bg-kit-secondary" },
  { name: "success", className: "bg-kit-success" },
  { name: "info", className: "bg-kit-info" },
  { name: "warning", className: "bg-kit-warning" },
  { name: "danger", className: "bg-kit-danger" },
  { name: "focus", className: "bg-kit-focus" },
  { name: "alternate", className: "bg-kit-alt" },
  { name: "light", className: "bg-kit-light border border-kit" },
  { name: "dark", className: "bg-kit-dark" },
];

const GRADIENT_SWATCHES = [
  { name: "happy-green", className: "gradient-happy-green" },
  { name: "premium-dark", className: "gradient-premium-dark" },
  { name: "love-kiss", className: "gradient-love-kiss" },
  { name: "grow-early", className: "gradient-grow-early" },
  { name: "strong-bliss", className: "gradient-strong-bliss" },
  { name: "warm-flame", className: "gradient-warm-flame" },
  { name: "tempting-azure", className: "gradient-tempting-azure" },
  { name: "sunny-morning", className: "gradient-sunny-morning" },
  { name: "mean-fruit", className: "gradient-mean-fruit" },
  { name: "night-fade", className: "gradient-night-fade" },
  { name: "heavy-rain", className: "gradient-heavy-rain" },
  { name: "amy-crisp", className: "gradient-amy-crisp" },
  { name: "malibu-beach", className: "gradient-malibu-beach" },
  { name: "deep-blue", className: "gradient-deep-blue" },
  { name: "mixed-hopes", className: "gradient-mixed-hopes" },
  { name: "happy-itmeo", className: "gradient-happy-itmeo" },
  { name: "happy-fisher", className: "gradient-happy-fisher" },
  { name: "arielle-smile", className: "gradient-arielle-smile" },
  { name: "ripe-malin", className: "gradient-ripe-malin" },
  { name: "vicious-stance", className: "gradient-vicious-stance" },
  { name: "midnight-bloom", className: "gradient-midnight-bloom" },
  { name: "night-sky", className: "gradient-night-sky" },
  { name: "slick-carbon", className: "gradient-slick-carbon" },
  { name: "royal", className: "gradient-royal" },
  { name: "asteroid", className: "gradient-asteroid" },
];

export function UtilitiesPage() {
  return (
    <DemoPageShell
      title="Utilities"
      subtitle="Colors, gradients, text helpers — kit-* Tailwind classes."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoSection title="Solid Colors">
          <div className="flex flex-wrap gap-2">
            {SOLID_SWATCHES.map((item: { name: string; className: string }) => (
              <div key={item.name} className="text-center">
                <div title={item.name} className={"mb-1 h-12 w-12 rounded " + item.className} />
                <span className="text-xs text-kit-muted">{item.name}</span>
              </div>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Text Colors">
          <p className="text-kit-muted">Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.</p>
          <p className="text-kit-primary">Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
          <p className="text-kit-success">Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
          <p className="text-kit-info">Maecenas sed diam eget risus varius blandit sit amet non magna.</p>
          <p className="text-kit-warning">Etiam porta sem malesuada magna mollis euismod.</p>
          <p className="text-kit-danger">Donec ullamcorper nulla non metus auctor fringilla.</p>
          <p className="bg-kit-dark px-2 py-1 text-kit-white">
            Etiam porta sem malesuada ultricies vehicula.
          </p>
        </DemoSection>
      </div>

      <DemoSection title="Gradient Colors">
        <div className="flex flex-wrap gap-2">
          {GRADIENT_SWATCHES.map((item: { name: string; className: string }) => (
            <div key={item.name} className="text-center">
              <div title={item.name} className={"mb-1 h-12 w-12 rounded " + item.className} />
              <span className="block max-w-14 truncate text-xs text-kit-muted">{item.name}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoSection title="Opacity">
          <div className="flex flex-wrap items-end gap-2">
            {[10, 25, 50, 75, 100].map((value: number) => (
              <div key={value} className="text-center">
                <div
                  className="mb-1 h-12 w-12 rounded bg-kit-primary"
                  style={{ opacity: value / 100 }}
                />
                <span className="text-xs text-kit-muted">{value}%</span>
              </div>
            ))}
          </div>
        </DemoSection>

        <DemoSection title="Breadcrumbs">
          <nav className="mb-3 text-sm text-kit-muted">
            <ol className="flex flex-wrap items-center gap-1">
              <li className="font-normal text-kit-heading">Home</li>
            </ol>
          </nav>
          <nav className="mb-3 text-sm text-kit-muted">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <a href="#" className="text-kit-primary hover:underline">
                  Home
                </a>
              </li>
              <li>/</li>
              <li className="font-normal text-kit-heading">Library</li>
            </ol>
          </nav>
          <nav className="text-sm text-kit-muted">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <a href="#" className="text-kit-primary hover:underline">
                  Home
                </a>
              </li>
              <li>/</li>
              <li>
                <a href="#" className="text-kit-primary hover:underline">
                  Library
                </a>
              </li>
              <li>/</li>
              <li className="font-normal text-kit-heading">Data</li>
            </ol>
          </nav>
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
