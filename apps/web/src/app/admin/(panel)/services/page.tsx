import type { AdminCategory, AdminService } from '@barbershop/shared';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ActionForm } from '@/components/admin/action-form';
import { AdminField, inputClass } from '@/components/admin/field';
import { Skeleton } from '@/components/ui/skeleton';
import { saveService } from '@/lib/admin/actions';
import { adminApi } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'Послуги' };

export default function ServicesAdminPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-black uppercase sm:text-4xl">Послуги</h1>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm">
        Зміни одразу з’являються на сайті. Вимкнена послуга зникає з прайсу й онлайн-запису, але
        старі записи на неї лишаються.
      </p>
      <Suspense fallback={<Skeleton className="mt-8 h-96 rounded-2xl" />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  const [services, categories] = await Promise.all([
    adminApi<AdminService[]>('/admin/services'),
    adminApi<AdminCategory[]>('/admin/categories'),
  ]);
  return (
    <div className="mt-8 grid gap-4">
      {services.map((s) => (
        <details key={s.id} className="border-border group rounded-xl border open:pb-2">
          <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-3 p-4">
            <span
              className={
                s.isActive ? 'font-semibold' : 'text-muted-foreground font-semibold line-through'
              }
            >
              {s.name}
            </span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {s.category ?? 'Без категорії'} · {s.durationMin} хв ·{' '}
              {(s.priceCents / 100).toFixed(0)} ₴
            </span>
          </summary>
          <ServiceForm service={s} categories={categories} />
        </details>
      ))}
      <details className="border-primary/40 rounded-xl border border-dashed">
        <summary className="text-primary cursor-pointer list-none p-4 font-semibold">
          + Нова послуга
        </summary>
        <ServiceForm categories={categories} />
      </details>
    </div>
  );
}

function ServiceForm({
  service,
  categories,
}: {
  service?: AdminService;
  categories: AdminCategory[];
}) {
  return (
    <ActionForm action={saveService} className="grid gap-4 px-4 pb-4" resetOnSuccess={!service}>
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminField label="Назва" className="sm:col-span-2">
          <input name="name" required defaultValue={service?.name} className={inputClass} />
        </AdminField>
        <AdminField label="Slug (для адреси)">
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={service?.slug}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Категорія">
          <select name="categoryId" defaultValue={service?.categoryId ?? ''} className={inputClass}>
            <option value="">Без категорії</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Ціна, ₴">
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={service ? service.priceCents / 100 : ''}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Тривалість, хв">
          <input
            name="durationMin"
            type="number"
            min="5"
            step="5"
            required
            defaultValue={service?.durationMin ?? 60}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Порядок">
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={service?.sortOrder ?? 0}
            className={inputClass}
          />
        </AdminField>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={service?.isActive ?? true}
            className="accent-primary size-4"
          />
          Показувати на сайті
        </label>
        <AdminField label="Опис" className="sm:col-span-2 lg:col-span-4">
          <input
            name="description"
            defaultValue={service?.description ?? ''}
            className={inputClass}
          />
        </AdminField>
      </div>
    </ActionForm>
  );
}
