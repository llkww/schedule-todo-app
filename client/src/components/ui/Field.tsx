import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "../../lib/cn";

type FieldShellProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

function FieldShell({ label, htmlFor, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? <p className="field__error">{error}</p> : null}
      {!error && hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, id, required, className, ...props }: InputProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <input
        id={fieldId}
        className={cn("input", error && "input--error", className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, id, required, className, ...props }: TextareaProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <textarea
        id={fieldId}
        className={cn("input textarea", error && "input--error", className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Select({ label, error, hint, id, required, className, children, ...props }: SelectProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <select
        id={fieldId}
        className={cn("input select", error && "input--error", className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
