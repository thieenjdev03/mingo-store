import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';

export default function AdminLoading() {
  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-muted/30 px-5">
      <MeltingIceCreamLoader size="lg" />
    </main>
  );
}
