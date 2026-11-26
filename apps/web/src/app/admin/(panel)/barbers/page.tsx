import {
  formatMinutes,
  utcToZoned,
  type AdminBarber,
  type AdminService,
  type Me,
} from '@barbershop/shared';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ActionButton, ActionForm } from '@/components/admin/action-form';
import { AdminField, inputClass } from '@/components/admin/field';
import { Skeleton } from '@/components/ui/skeleton';
import { addTimeOff, removeTimeOff, saveBarber, saveHours } from '@/lib/admin/actions';
import { adminApi, getMe } from '@/lib/admin/session';
import { formatShortDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Майстри й графік' };

const WEEK = [
  { d: 1, label: 'Пн' },
  { d: 2, label: 'Вт' },
  { d: 3, label: 'Ср' },
  { d: 4, label: 'Чт' },
  { d: 5, label: 'Пт' },
  { d: 6, label: 'Сб' },
  { d: 0, label: 'Нд' },
];

export default function BarbersAdminPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-black uppercase sm:text-4xl">Майстри й графік</h1>
      <Suspense fallback={<Skeleton className="mt-8 h-96 rounded-2xl" />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  const me = await getMe();
  const [barbers, services] = await Promise.all([
    adminApi<AdminBarber[]>('/admin/barbers'),
    adminApi<AdminService[]>('/admin/services'),
  ]);
  return (
    <div className="mt-8 grid gap-10">
      {barbers.length === 0 && (
        <p className="text-muted-foreground">Ваш акаунт ще не прив’язаний до профілю майстра.</p>
      )}
      {barbers.map((b) => (
        <BarberCard key={b.id} barber={b} services={services} me={me} />
      ))}
      {me.role === 'ADMIN' && (
        <details className="border-primary/40 rounded-xl border border-dashed">
          <summary className="text-primary cursor-pointer list-none p-4 font-semibold">
            + Новий майстер
          </summary>
          <ProfileForm services={services} />
        </details>
      )}
    </div>
  );
}

function BarberCard({
  barber,
  services,
  me,
}: {
  barber: AdminBarber;
  services: AdminService[];
  me: Me;
}) {
  const hours = new Map(barber.workingHours.map((h) => [h.weekday, h]));
  return (
    <section
      aria-labelledby={`barber-${barber.id}`}
      className="border-border rounded-2xl border p-4 sm:p-6"
    >
      <h2 id={`barber-${barber.id}`} className="font-heading text-2xl font-semibold">
        {barber.name}
        {!barber.isActive && (
          <span className="text-muted-foreground ml-3 text-sm font-normal">прихований</span>
        )}
      </h2>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="eyebrow text-muted-foreground mb-4">Робочі години</h3>
          <ActionForm action={saveHours} className="grid gap-4">
            <input type="hidden" name="barberId" value={barber.id} />
            <fieldset className="grid gap-2">
              <legend className="sr-only">Дні тижня</legend>
              {WEEK.map(({ d, label }) => {
                const h = hours.get(d);
                return (
                  <div key={d} className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name={`on-${d}`}
                        defaultChecked={Boolean(h)}
                        className="accent-primary size-4"
                      />
                      {label}
                    </label>
                    <input
                      type="time"
                      step={900}
                      name={`start-${d}`}
                      aria-label={`${label}, початок`}
                      defaultValue={formatMinutes(h?.startMin ?? 600)}
                      className={inputClass}
                    />
                    <input
                      type="time"
                      step={900}
                      name={`end-${d}`}
                      aria-label={`${label}, кінець`}
                      defaultValue={formatMinutes(h?.endMin ?? 1200)}
                      className={inputClass}
                    />
                  </div>
                );
              })}
            </fieldset>
          </ActionForm>
        </div>

        <div>
          <h3 className="eyebrow text-muted-foreground mb-4">Вихідні й відпустки</h3>
          {barber.timeOff.length > 0 ? (
            <ul className="mb-6 grid gap-2">
              {barber.timeOff.map((t) => {
                const end = new Date(new Date(t.endsAt).getTime() - 1);
                const same = utcToZoned(new Date(t.startsAt)).date === utcToZoned(end).date;
                return (
                  <li
                    key={t.id}
                    className="bg-card flex items-center justify-between gap-3 rounded-lg p-3 text-sm"
                  >
                    <span>
                      {formatShortDate(t.startsAt)}
                      {!same && ` – ${formatShortDate(end)}`}
                      {t.reason && <span className="text-muted-foreground"> · {t.reason}</span>}
                    </span>
                    <ActionButton
                      run={removeTimeOff.bind(null, barber.id, t.id)}
                      variant="ghost"
                      confirm="Видалити ці вихідні?"
                    >
                      Видалити
                    </ActionButton>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground mb-6 text-sm">Запланованих вихідних немає.</p>
          )}
          <ActionForm
            action={addTimeOff}
            submitLabel="Додати вихідні"
            className="grid gap-4"
            resetOnSuccess
          >
            <input type="hidden" name="barberId" value={barber.id} />
            <div className="grid grid-cols-2 gap-3">
              <AdminField label="З">
                <input type="date" name="from" required className={inputClass} />
              </AdminField>
              <AdminField label="По (включно)">
                <input type="date" name="to" className={inputClass} />
              </AdminField>
            </div>
            <AdminField label="Причина (необов’язково)">
              <input name="reason" maxLength={200} className={inputClass} />
            </AdminField>
          </ActionForm>
          <p className="text-muted-foreground mt-3 text-xs">
            Наявні записи на ці дні не скасовуються автоматично: перевірте їх у розділі «Записи».
          </p>
        </div>
      </div>

      {me.role === 'ADMIN' && (
        <details className="mt-8">
          <summary className="text-primary cursor-pointer text-sm font-semibold">
            Профіль і послуги
          </summary>
          <ProfileForm barber={barber} services={services} />
        </details>
      )}
    </section>
  );
}

function ProfileForm({ barber, services }: { barber?: AdminBarber; services: AdminService[] }) {
  return (
    <ActionForm action={saveBarber} className="grid gap-4 p-4" resetOnSuccess={!barber}>
      {barber && <input type="hidden" name="id" value={barber.id} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminField label="Ім’я">
          <input name="name" required defaultValue={barber?.name} className={inputClass} />
        </AdminField>
        <AdminField label="Slug (для адреси)">
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={barber?.slug}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Посада">
          <input name="title" defaultValue={barber?.title ?? ''} className={inputClass} />
        </AdminField>
        <AdminField label="Спеціалізація">
          <input name="specialty" defaultValue={barber?.specialty ?? ''} className={inputClass} />
        </AdminField>
        <AdminField label="Практикує з (рік)">
          <input
            name="experienceSince"
            type="number"
            min="1970"
            max="2100"
            defaultValue={barber?.experienceSince ?? ''}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Порядок">
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={barber?.sortOrder ?? 0}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Фото (URL)" className="sm:col-span-2">
          <input
            name="photoUrl"
            type="url"
            defaultValue={barber?.photoUrl ?? ''}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Instagram (URL)">
          <input
            name="instagram"
            type="url"
            defaultValue={barber?.instagram ?? ''}
            className={inputClass}
          />
        </AdminField>
        <AdminField label="Про майстра" className="sm:col-span-2 lg:col-span-3">
          <textarea
            name="bio"
            rows={3}
            defaultValue={barber?.bio ?? ''}
            className={`${inputClass} h-auto py-2`}
          />
        </AdminField>
      </div>
      <fieldset>
        <legend className="text-muted-foreground mb-2 text-sm">Послуги майстра</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="serviceIds"
                value={s.id}
                defaultChecked={barber ? barber.serviceIds.includes(s.id) : true}
                className="accent-primary size-4"
              />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={barber?.isActive ?? true}
          className="accent-primary size-4"
        />
        Показувати на сайті й у записі
      </label>
    </ActionForm>
  );
}
