import Link from 'next/link';
import { cn } from 'cn';
import { PageContainer, PageShell } from '@/components/site/page-shell';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageShell>
      <PageContainer className="min-h-[70vh]">
        <p className="eyebrow text-primary">Помилка 404</p>
        <h1 className="font-heading mt-4 text-[clamp(3rem,12vw,10rem)] leading-[0.9] font-black uppercase">
          Не та <br /> адреса
        </h1>
        <p className="text-muted-foreground mt-8 max-w-md">
          Такої сторінки немає. Можливо, її перенесли, або в посиланні помилка.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={cn(buttonVariants(), 'h-12 rounded-full px-7')}>
            На головну
          </Link>
          <Link
            href="/booking"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-full px-7')}
          >
            Записатися
          </Link>
        </div>
      </PageContainer>
    </PageShell>
  );
}
