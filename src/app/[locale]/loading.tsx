import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';

export default function StorefrontLoading() {
  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-background px-5">
      <MeltingIceCreamLoader size="lg" />
    </main>
  );
}
