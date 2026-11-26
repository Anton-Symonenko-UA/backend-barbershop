import { cn } from 'cn';

// Поле форми адмінки: нативні інпути, щоб форми працювали і без JavaScript
export function AdminField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('grid gap-1.5 text-sm', className)}>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-3';
