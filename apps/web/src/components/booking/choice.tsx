import { cn } from 'cn';

// Вибір з групи як справжні radio-інпути: клавіатура й скрінрідери працюють без зайвого коду.
export function Choice({
  name,
  value,
  checked,
  onChange,
  disabled,
  className,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        'border-border hover:border-foreground/40 has-[:focus-visible]:outline-ring relative flex cursor-pointer rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
        checked && 'border-primary bg-primary/10 hover:border-primary',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {children}
    </label>
  );
}

export function StepTitle({
  n,
  children,
  id,
}: {
  n: number;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <legend id={id} className="flex items-baseline gap-3">
      <span className="eyebrow text-primary tabular-nums">0{n}</span>
      <span className="font-heading text-xl font-semibold sm:text-2xl">{children}</span>
    </legend>
  );
}
