import type { AdminReview } from '@barbershop/shared';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ActionButton } from '@/components/admin/action-form';
import { Stars } from '@/components/site/reviews';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteReview, setReviewPublished } from '@/lib/admin/actions';
import { adminApi } from '@/lib/admin/session';
import { formatShortDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Відгуки' };

export default function ReviewsAdminPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-black uppercase sm:text-4xl">Відгуки</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Нові відгуки з сайту чекають на публікацію. Опубліковані видно на головній і в
        структурованих даних для Google.
      </p>
      <Suspense fallback={<Skeleton className="mt-8 h-96 rounded-2xl" />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  const reviews = await adminApi<AdminReview[]>('/admin/reviews');
  const pending = reviews.filter((r) => !r.isPublished);
  const published = reviews.filter((r) => r.isPublished);
  return (
    <div className="mt-8 grid gap-12">
      <Group
        title={`На модерації · ${pending.length}`}
        items={pending}
        empty="Нових відгуків немає."
      />
      <Group
        title={`Опубліковані · ${published.length}`}
        items={published}
        empty="Поки нічого не опубліковано."
      />
    </div>
  );
}

function Group({ title, items, empty }: { title: string; items: AdminReview[]; empty: string }) {
  return (
    <section>
      <h2 className="eyebrow text-muted-foreground mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{empty}</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((r) => (
            <li key={r.id} className="border-border grid gap-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-3">
                  <Stars rating={r.rating} />
                  <span className="font-semibold">{r.authorName}</span>
                  <span className="text-muted-foreground text-sm">
                    {formatShortDate(r.createdAt)}
                    {r.barberName && ` · ${r.barberName}`}
                  </span>
                </p>
                <div className="flex gap-2">
                  <ActionButton
                    run={setReviewPublished.bind(null, r.id, !r.isPublished)}
                    variant={r.isPublished ? 'outline' : 'default'}
                  >
                    {r.isPublished ? 'Приховати' : 'Опублікувати'}
                  </ActionButton>
                  <ActionButton
                    run={deleteReview.bind(null, r.id)}
                    variant="destructive"
                    confirm="Видалити відгук назавжди?"
                  >
                    Видалити
                  </ActionButton>
                </div>
              </div>
              <p className="text-pretty">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
