import { useState } from "react";
import { Alert, AlertLink } from "@/shared/components/Alert";
import { BodyTabs } from "@/shared/components/Tabs";
import {
  Toast,
  ToastStack,
  type ToastPosition,
  type ToastVariant,
} from "@/shared/components/Toast";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody, CardFooter } from "@/shared/elements/Card";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

type ToastItem = {
  id: number;
  title?: string;
  message: string;
  variant: ToastVariant;
  progress: boolean;
  duration: number;
  closeButton: boolean;
  rtl: boolean;
};

const alertVariants = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
] as const;

const checkOptions = [
  { id: "closeButton", label: "Close Button" },
  { id: "addBehaviorOnToastClick", label: "Add behavior on toast click" },
  {
    id: "addBehaviorOnToastCloseClick",
    label: "Add behavior on toast close button click",
    disabled: true,
  },
  { id: "debugInfo", label: "Debug" },
  { id: "progressBar", label: "Progress Bar" },
  { id: "rtl", label: "Right-To-Left" },
  { id: "preventDuplicates", label: "Prevent Duplicates" },
  { id: "addClear", label: "Add button to force clearing a toast" },
  { id: "newestOnTop", label: "Newest on top" },
];

const positions: { value: ToastPosition; label: string }[] = [
  { value: "top-right", label: "Top Right" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "top-left", label: "Top Left" },
  { value: "top-full", label: "Top Full Width" },
  { value: "bottom-full", label: "Bottom Full Width" },
  { value: "top-center", label: "Top Center" },
  { value: "bottom-center", label: "Bottom Center" },
];

const fieldClass =
  "form-control mb-3 w-full rounded border border-[#ced4da] px-3 py-1.5 text-sm font-sans";
const labelClass = "mb-1 block text-sm font-sans";
const checkClass = "form-check mb-2 flex items-center gap-2 text-sm font-sans";

export function NotificationsPage() {
  const [section, setSection] = useState("toastr");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<ToastVariant>("success");
  const [position, setPosition] = useState<ToastPosition>("top-right");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [showEasing, setShowEasing] = useState("swing");
  const [hideEasing, setHideEasing] = useState("linear");
  const [showMethod, setShowMethod] = useState("fadeIn");
  const [hideMethod, setHideMethod] = useState("fadeOut");
  const [showDuration, setShowDuration] = useState("300");
  const [hideDuration, setHideDuration] = useState("1000");
  const [timeOut, setTimeOut] = useState("5000");
  const [extendedTimeOut, setExtendedTimeOut] = useState("1000");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dismissOpen, setDismissOpen] = useState(true);
  const [seq, setSeq] = useState(1);

  function toggleCheck(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function showToast() {
    const msg = message || "Do you smell that? It's toast!";
    if (checks.preventDuplicates) {
      const dup = toasts.some(
        (t: ToastItem) => t.message === msg && t.title === (title || undefined)
      );
      if (dup) return;
    }

    const id = seq;
    const duration = checks.addClear ? 0 : Number(timeOut) || 5000;
    const item: ToastItem = {
      id,
      title: title || undefined,
      message: checks.addClear ? msg + "\n\n[Clear itself]" : msg,
      variant,
      progress: !!checks.progressBar,
      duration,
      closeButton: !!checks.closeButton,
      rtl: !!checks.rtl,
    };
    setSeq(seq + 1);
    setToasts((prev: ToastItem[]) =>
      checks.newestOnTop ? [item, ...prev] : [...prev, item]
    );

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev: ToastItem[]) => prev.filter((x: ToastItem) => x.id !== id));
      }, duration);
    }
  }

  function clearLast() {
    setToasts((prev: ToastItem[]) =>
      checks.newestOnTop ? prev.slice(1) : prev.slice(0, -1)
    );
  }

  const displayed = toasts;

  return (
    <DemoPageShell
      title="Notifications"
      subtitle="Notifications represent responses to user actions."
    >
      <BodyTabs
        items={[
          { id: "toastr", label: "Toastr Alerts" },
          { id: "alerts", label: "Basic Alerts" },
        ]}
        activeId={section}
        onChange={setSection}
      />

      {section === "toastr" ? (
        <Card className="main-card mb-3">
          <CardBody>
            <div className="card-title mb-3 text-sm font-bold uppercase text-[rgba(36,59,107,0.7)]">
              Toastr Configurator
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  className={fieldClass}
                  placeholder="Enter a title ..."
                  value={title}
                  onChange={(e: { target: { value: string } }) => setTitle(e.target.value)}
                />
                <label className={labelClass}>Message</label>
                <textarea
                  className={fieldClass}
                  rows={3}
                  placeholder="Enter a message ..."
                  value={message}
                  onChange={(e: { target: { value: string } }) => setMessage(e.target.value)}
                />
                {checkOptions.map((opt) => (
                  <label key={opt.id} className={checkClass}>
                    <input
                      type="checkbox"
                      disabled={opt.disabled}
                      checked={!!checks[opt.id]}
                      onChange={() => toggleCheck(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div>
                <h5 className="mb-2 text-sm font-bold uppercase text-[rgba(36,59,107,0.7)]">
                  Toast Type
                </h5>
                {(
                  [
                    { value: "success", label: "Success" },
                    { value: "info", label: "Info" },
                    { value: "warning", label: "Warning" },
                    { value: "danger", label: "Error" },
                  ] as const
                ).map((opt) => (
                  <label key={opt.value} className={checkClass}>
                    <input
                      type="radio"
                      name="toastType"
                      checked={variant === opt.value}
                      onChange={() => setVariant(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}

                <h5 className="mb-2 mt-4 text-sm font-bold uppercase text-[rgba(36,59,107,0.7)]">
                  Position
                </h5>
                {positions.map((opt) => (
                  <label key={opt.value} className={checkClass}>
                    <input
                      type="radio"
                      name="toastPos"
                      checked={position === opt.value}
                      onChange={() => setPosition(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div>
                <label className={labelClass}>Show Easing</label>
                <input
                  className={fieldClass}
                  placeholder="swing, linear"
                  value={showEasing}
                  onChange={(e: { target: { value: string } }) => setShowEasing(e.target.value)}
                />
                <label className={labelClass}>Hide Easing</label>
                <input
                  className={fieldClass}
                  placeholder="swing, linear"
                  value={hideEasing}
                  onChange={(e: { target: { value: string } }) => setHideEasing(e.target.value)}
                />
                <label className={labelClass}>Show Method</label>
                <input
                  className={fieldClass}
                  placeholder="show, fadeIn, slideDown"
                  value={showMethod}
                  onChange={(e: { target: { value: string } }) => setShowMethod(e.target.value)}
                />
                <label className={labelClass}>Hide Method</label>
                <input
                  className={fieldClass}
                  placeholder="hide, fadeOut, slideUp"
                  value={hideMethod}
                  onChange={(e: { target: { value: string } }) => setHideMethod(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Show Duration</label>
                <input
                  className={fieldClass}
                  type="number"
                  placeholder="ms"
                  value={showDuration}
                  onChange={(e: { target: { value: string } }) => setShowDuration(e.target.value)}
                />
                <label className={labelClass}>Hide Duration</label>
                <input
                  className={fieldClass}
                  type="number"
                  placeholder="ms"
                  value={hideDuration}
                  onChange={(e: { target: { value: string } }) => setHideDuration(e.target.value)}
                />
                <label className={labelClass}>Time out</label>
                <input
                  className={fieldClass}
                  type="number"
                  placeholder="ms"
                  value={timeOut}
                  onChange={(e: { target: { value: string } }) => setTimeOut(e.target.value)}
                />
                <label className={labelClass}>Extended time out</label>
                <input
                  className={fieldClass}
                  type="number"
                  placeholder="ms"
                  value={extendedTimeOut}
                  onChange={(e: { target: { value: string } }) =>
                    setExtendedTimeOut(e.target.value)
                  }
                />
              </div>
            </div>
          </CardBody>
          <CardFooter className="justify-between">
            <div>
              <Button
                variant="link"
                className="mb-0 text-[#d92550]"
                onClick={() => setToasts([])}
              >
                Clear Toasts
              </Button>
              <Button variant="link" className="mb-0" onClick={clearLast}>
                Clear Last Toast
              </Button>
            </div>
            <Button variant="success" className="mb-0" onClick={showToast}>
              Show Toast
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DemoSection title="Alerts">
            {alertVariants.map((v) => (
              <Alert key={v} variant={v}>
                This is a {v} alert — check it out!
              </Alert>
            ))}
          </DemoSection>

          <DemoSection title="Alerts Link Color">
            {alertVariants.map((v) => (
              <Alert key={"link-" + v} variant={v}>
                This is a {v} alert with{" "}
                <AlertLink>an example link</AlertLink>
                . Give it a click if you like.
              </Alert>
            ))}
          </DemoSection>

          <DemoSection title="Alerts Content">
            <Alert variant="success">
              <h4 className="mb-2 text-lg font-normal">Well done!</h4>
              <p className="mb-3">
                Aww yeah, you successfully read this important alert message. This example text is
                going to run a bit longer so that you can see how spacing within an alert works with
                this kind of content.
              </p>
              <hr className="my-3 border-current/20" />
              <p className="mb-0">
                Whenever you need to, be sure to use margin utilities to keep things nice and tidy.
              </p>
            </Alert>
          </DemoSection>

          <DemoSection title="Dismissable Alerts">
            {dismissOpen ? (
              <Alert variant="info" onClose={() => setDismissOpen(false)}>
                I am an alert and I can be dismissed!
              </Alert>
            ) : null}
          </DemoSection>
        </div>
      )}

      {displayed.length > 0 ? (
        <ToastStack position={position}>
          {displayed.map((t: ToastItem) => (
            <Toast
              key={t.id}
              open
              title={t.title}
              message={t.message}
              variant={t.variant}
              progress={t.progress}
              duration={t.duration || 5000}
              rtl={t.rtl}
              className={
                position === "top-full" || position === "bottom-full" ? "!w-full max-w-none" : ""
              }
              onClick={
                checks.addBehaviorOnToastClick
                  ? () => alert("You can perform some custom action after a toast goes away")
                  : undefined
              }
              onClose={
                t.closeButton
                  ? () =>
                      setToasts((prev: ToastItem[]) =>
                        prev.filter((x: ToastItem) => x.id !== t.id)
                      )
                  : undefined
              }
            />
          ))}
        </ToastStack>
      ) : null}
    </DemoPageShell>
  );
}
