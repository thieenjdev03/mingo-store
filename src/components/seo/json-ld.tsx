import { headers } from 'next/headers';

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export async function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: json }} />;
}
