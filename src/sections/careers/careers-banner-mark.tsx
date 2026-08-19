import Image from 'next/image';

/** Decorative career banner mark. Its fixed right anchor keeps the M stroke aligned across listing and JD pages. */
export function CareersBannerMark() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[66%] sm:block lg:w-[66%]" aria-hidden="true">
      <Image
        src="/assets/mingo/m-stroke-orange.png"
        alt=""
        fill
        priority
        sizes="72vw"
        className="object-cover object-right object-top"
      />
    </div>
  );
}
