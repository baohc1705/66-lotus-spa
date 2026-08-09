import type { ReactNode } from "react";

type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  validMessage?: string;
  help?: string;
  required?: boolean;
  tooltip?: string;
  className?: string;
  children?: ReactNode;
  horizontal?: boolean;
  labelCols?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  validMessage,
  help,
  required = false,
  tooltip,
  className = "",
  children,
  horizontal = false,
  labelCols = "sm:w-1/6",
}: FormFieldProps) {
  const hasStar = (label ?? "").includes("*");
  const cleanLabel = (label ?? "").replace("*", "").trim();
  const showRequired = required || hasStar;

  const labelEl =
    cleanLabel || label === "" ? (
      <label
        htmlFor={htmlFor}
        title={tooltip}
        className={
          horizontal
            ? "col-form-label mb-0 pt-2 text-sm text-kit-body " + labelCols
            : "form-label mb-0.5 block text-sm text-kit-body"
        }
      >
        {cleanLabel}
        {showRequired ? <span className="ml-0.5 text-kit-danger">*</span> : null}
      </label>
    ) : null;

  const feedback = (
    <>
      {error ? <div className="mt-1 text-sm text-kit-danger">{error}</div> : null}
      {!error && validMessage ? (
        <div className="mt-1 text-sm text-kit-success">{validMessage}</div>
      ) : null}
      {help ? <small className="mt-1 block text-sm text-kit-muted">{help}</small> : null}
    </>
  );

  if (horizontal) {
    return (
      <div className={"relative mb-2 flex flex-col sm:flex-row sm:items-start " + className}>
        {labelEl}
        <div className="min-w-0 flex-1">
          {children}
          {feedback}
        </div>
      </div>
    );
  }

  return (
    <div className={"relative mb-2 " + className}>
      {labelEl}
      {children}
      {feedback}
    </div>
  );
}
