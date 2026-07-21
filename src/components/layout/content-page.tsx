import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ContentPageProps {
  eyebrow?: string;
  title: string;
  intro: string;
  body: string;
  cta: string;
  ctaHref: string;
  children?: React.ReactNode;
}

export function ContentPage({ eyebrow, title, intro, body, cta, ctaHref, children }: ContentPageProps) {
  return (
    <div className="bg-ivory py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <section className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              {eyebrow ? <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
              <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">{title}</h1>
              <p className="mt-6 max-w-2xl text-xl font-semibold leading-relaxed text-foreground">{intro}</p>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{body}</p>
              <Link href={ctaHref} className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">
                {cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="relative hidden min-h-full overflow-hidden bg-sand lg:block" aria-hidden="true">
              <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/15" />
              <div className="absolute bottom-14 left-12 size-32 rounded-full bg-card/55" />
              <div className="absolute bottom-24 right-16 size-44 rotate-12 rounded-[48px] bg-primary/75" />
            </div>
          </div>
          {children ? <div className="border-t border-border px-6 py-8 sm:px-12 lg:px-16">{children}</div> : null}
        </section>
      </div>
    </div>
  );
}
