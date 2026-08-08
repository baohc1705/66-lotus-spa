import { Progress } from "@/shared/components/Progress";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

export function ProgressPage() {
  return (
    <DemoPageShell
      title="Progress Bar"
      subtitle="Progress bars are used to show progress status of a process."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <DemoSection title="Basic">
            {[0, 25, 50, 75, 100].map((v: number) => (
              <div key={v}>
                <div className="mb-1 text-center text-sm">{v}%</div>
                <Progress value={v} />
              </div>
            ))}
            <div className="mb-1 text-center text-sm">Multiple bars</div>
            <Progress
              segments={[
                { value: 15 },
                { value: 30, tone: "success" },
                { value: 25, tone: "info" },
                { value: 20, tone: "warning" },
                { value: 5, tone: "danger" },
              ]}
            />
          </DemoSection>

          <DemoSection title="Progress bar labels">
            <Progress value={25} label="25%" />
            <Progress value={50} label="1/2" />
            <Progress value={75} label="You're almost there!" />
            <Progress value={100} tone="success" label="You did it!" />
            <Progress
              segments={[
                { value: 15, label: "Meh" },
                { value: 30, tone: "success", label: "Wow!" },
                { value: 25, tone: "info", label: "Cool" },
                { value: 20, tone: "warning", label: "20%" },
                { value: 5, tone: "danger", label: "!!" },
              ]}
            />
          </DemoSection>

          <DemoSection title="Progress bar max">
            <div className="mb-1 text-center text-sm">1 of 5</div>
            <Progress value={1} max={5} />
            <div className="mb-1 text-center text-sm">50 of 135</div>
            <Progress value={50} max={135} />
            <div className="mb-1 text-center text-sm">75 of 111</div>
            <Progress value={75} max={111} />
            <div className="mb-1 text-center text-sm">463 of 500</div>
            <Progress value={463} max={500} />
            <div className="mb-1 text-center text-sm">Various (40) of 55</div>
            <Progress
              max={55}
              segments={[
                { value: 5, label: "5" },
                { value: 15, tone: "success", label: "15" },
                { value: 10, tone: "warning", label: "10" },
                { value: 10, tone: "danger", label: "10" },
              ]}
            />
          </DemoSection>

          <DemoSection title="Progress bar striped">
            <Progress value={10} striped />
            <Progress value={25} tone="success" striped />
            <Progress value={50} tone="info" striped />
            <Progress value={75} tone="warning" striped />
            <Progress value={100} tone="danger" striped />
            <Progress
              segments={[
                { value: 10, striped: true },
                { value: 30, tone: "success", striped: true },
                { value: 20, tone: "warning", striped: true },
                { value: 20, tone: "danger", striped: true },
              ]}
            />
          </DemoSection>
        </div>

        <div>
          <DemoSection title="Progress color">
            <Progress value={10} />
            <Progress value={25} tone="success" />
            <Progress value={50} tone="info" />
            <Progress value={75} tone="warning" />
            <Progress value={100} tone="danger" />
          </DemoSection>

          <DemoSection title="Progress bar multi">
            <div className="mb-1 text-center text-sm">Plain</div>
            <Progress
              segments={[
                { value: 15 },
                { value: 20, tone: "success" },
                { value: 25, tone: "info" },
                { value: 20, tone: "warning" },
                { value: 15, tone: "danger" },
              ]}
            />
            <div className="mb-1 text-center text-sm">With Labels</div>
            <Progress
              segments={[
                { value: 15, label: "Meh" },
                { value: 35, tone: "success", label: "Wow!" },
                { value: 25, tone: "warning", label: "25%" },
                { value: 25, tone: "danger", label: "LOOK OUT!!" },
              ]}
            />
            <div className="mb-1 text-center text-sm">Stripes and Animations</div>
            <Progress
              segments={[
                { value: 15, striped: true, label: "Stripes" },
                { value: 30, tone: "success", striped: true, animated: true, label: "Animated Stripes" },
                { value: 25, tone: "info", label: "Plain" },
              ]}
            />
          </DemoSection>

          <DemoSection title="Progress animated">
            <Progress value={10} striped animated />
            <Progress value={25} tone="success" striped animated />
            <Progress value={50} tone="info" striped animated />
            <Progress value={75} tone="warning" striped animated />
            <Progress value={100} tone="danger" striped animated />
            <Progress
              segments={[
                { value: 10, striped: true, animated: true },
                { value: 30, tone: "success", striped: true, animated: true },
                { value: 20, tone: "warning", striped: true, animated: true },
                { value: 20, tone: "danger", striped: true, animated: true },
              ]}
            />
          </DemoSection>
        </div>
      </div>
    </DemoPageShell>
  );
}
