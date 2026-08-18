import { ClientOnlyLoader } from '@/components/ui/client-only-loader';

export default function StorefrontLoading() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-5">
      <ClientOnlyLoader size="lg" />
    </main>
  );
}
