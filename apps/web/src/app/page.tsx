import { Button } from '@/components/ui/button';

// Тимчасова сторінка: перевіряє, що шрифти, тема і shadcn/ui підключені.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-heading text-5xl tracking-tight sm:text-7xl">Барбершоп</h1>
      <p className="text-muted-foreground max-w-md">
        Каркас проекту готовий. Тут буде головна сторінка.
      </p>
      <Button size="lg">Записатися</Button>
    </main>
  );
}
