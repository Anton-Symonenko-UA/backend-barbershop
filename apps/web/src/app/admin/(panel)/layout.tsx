import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { site } from '@/config/site';
import { logout } from '@/lib/admin/actions';
import { getMe } from '@/lib/admin/session';

export default function PanelLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="min-h-svh">
      <header className="border-border bg-background/90 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
          <Link href="/" className="font-heading font-bold tracking-[0.18em]">
            {site.name}
          </Link>
          <Suspense fallback={<Skeleton className="h-9 w-72 rounded-full" />}>
            <NavWithUser />
          </Suspense>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}

async function NavWithUser() {
  const me = await getMe();
  return (
    <>
      <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
        <AdminNav role={me.role} />
      </div>
      <div className="ml-auto flex items-center gap-3 sm:ml-0">
        <span className="text-muted-foreground hidden text-sm md:inline">{me.email}</span>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="rounded-full">
            <LogOutIcon aria-hidden className="size-4" />
            Вийти
          </Button>
        </form>
      </div>
    </>
  );
}
