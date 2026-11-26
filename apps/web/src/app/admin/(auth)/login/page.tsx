import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';
import { site } from '@/config/site';

export const metadata: Metadata = { title: 'Вхід' };

export default function LoginPage() {
  return (
    <main id="main" className="mx-auto grid min-h-svh max-w-sm content-center gap-10 px-4">
      <div>
        <p className="font-heading text-lg font-bold tracking-[0.18em]">{site.name}</p>
        <h1 className="font-heading mt-6 text-4xl font-black uppercase">Вхід для команди</h1>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
