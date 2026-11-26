'use client';

import type { Role } from '@barbershop/shared';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

const items: { href: string; label: string; roles: Role[] }[] = [
  { href: '/admin/bookings', label: 'Записи', roles: ['ADMIN', 'BARBER'] },
  { href: '/admin/barbers', label: 'Майстри й графік', roles: ['ADMIN', 'BARBER'] },
  { href: '/admin/services', label: 'Послуги', roles: ['ADMIN'] },
  { href: '/admin/reviews', label: 'Відгуки', roles: ['ADMIN'] },
];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Розділи адмінки" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {items
          .filter((i) => i.roles.includes(role))
          .map((i) => {
            const active = pathname.startsWith(i.href);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'hover:bg-muted block rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors',
                    active && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  {i.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
