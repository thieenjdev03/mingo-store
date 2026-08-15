'use client';

import { useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCareersControllerApply } from '@/lib/api/generated/careers/careers';
import { ApiError } from '@/lib/api/fetcher';

interface CareerApplicationFormProps {
  careerId: string;
  jobTitle: string;
}

const MAX_CV_BYTES = 5 * 1024 * 1024;

export function CareerApplicationForm({ careerId, jobTitle }: CareerApplicationFormProps) {
  const t = useTranslations('careers.detail.form');
  const { trigger, isMutating } = useCareersControllerApply(careerId);
  const [submitted, setSubmitted] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [cvName, setCvName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const cv = fileInputRef.current?.files?.[0];
    if (!cv) {
      setErrorMessage(t('cvRequired'));
      return;
    }
    if (cv.size > MAX_CV_BYTES) {
      setErrorMessage(t('cvTooLarge'));
      return;
    }

    const data = new FormData(event.currentTarget);
    const familyName = String(data.get('family_name') ?? '').trim();
    const givenName = String(data.get('given_name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const portfolio = String(data.get('portfolio') ?? '').trim();

    try {
      await trigger({
        full_name: [familyName, givenName].filter(Boolean).join(' '),
        email: String(data.get('email') ?? '').trim(),
        phone: phone.startsWith('0') ? `+84${phone.slice(1)}` : phone,
        cover_letter: portfolio ? `Portfolio / social profile: ${portfolio}` : undefined,
        cv,
      });
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('genericError'));
    }
  }

  if (submitted) {
    return (
      <div id="apply-form" className="scroll-mt-24 rounded-3xl border border-primary/25 bg-primary/5 p-7 text-sm font-semibold leading-6 text-primary" role="status">
        {t('successNote')}
      </div>
    );
  }

  return (
    <form
      id="apply-form"
      aria-label={t('title', { title: jobTitle })}
      onSubmit={handleSubmit}
      className="scroll-mt-24 rounded-3xl border border-foreground/15 p-5 sm:p-7 lg:p-9"
    >
      {errorMessage ? (
        <div className="mb-7 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-5 sm:space-y-6">
        <FormInput id="family_name" name="family_name" label={t('familyName')} placeholder={t('familyName')} autoComplete="family-name" required />
        <FormInput id="given_name" name="given_name" label={t('givenName')} placeholder={t('givenName')} autoComplete="given-name" required />
        <FormInput id="email" name="email" type="email" label={t('email')} placeholder={t('emailPlaceholder')} autoComplete="email" required />

        <FormRow id="phone" label={t('phone')} required>
          <div className="flex h-12 overflow-hidden rounded-full border border-border bg-card transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 sm:h-14">
            <span className="flex shrink-0 items-center border-r border-border px-4 text-base text-muted-foreground">+84</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel-national"
              placeholder={t('phonePlaceholder')}
              required
              className="min-w-0 flex-1 bg-transparent px-4 text-base text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>
        </FormRow>

        <div className="my-8 border-t border-foreground/25" />

        <FormRow id="cv" label={t('cv')} required align="start">
          <div>
            <label className="inline-flex h-10 cursor-pointer items-center rounded-full border border-foreground/45 px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
              <span>{t('chooseFile')}</span>
              <input
                ref={fileInputRef}
                id="cv"
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                required
                className="sr-only"
                onChange={(event) => setCvName(event.target.files?.[0]?.name ?? '')}
              />
            </label>
            {cvName ? <p className="mt-2 break-all text-sm font-semibold text-foreground">{cvName}</p> : null}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{t('cvHint')}</p>
          </div>
        </FormRow>

        <FormInput
          id="portfolio"
          name="portfolio"
          type="url"
          label={t('portfolio')}
          placeholder={t('portfolioPlaceholder')}
          autoComplete="url"
          labelAlign="start"
        />
      </div>

      <label className="mt-10 flex cursor-pointer items-start gap-4 text-sm leading-6 text-muted-foreground">
        <input
          type="checkbox"
          required
          checked={acceptedPolicy}
          onChange={(event) => setAcceptedPolicy(event.target.checked)}
          className="mt-1 size-5 shrink-0 appearance-none rounded border-2 border-foreground/45 bg-transparent checked:border-primary checked:bg-primary checked:bg-[linear-gradient(135deg,transparent_42%,white_42%,white_56%,transparent_56%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <span>
          {t.rich('privacyAgreement', {
            policy: (chunks) => <Link href="/policies" className="font-semibold text-primary underline underline-offset-4">{chunks}</Link>,
          })}
        </span>
      </label>

      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          disabled={isMutating || !acceptedPolicy}
          className="flex h-12 min-w-48 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold uppercase text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted-foreground/70 disabled:text-white sm:h-14"
        >
          {isMutating ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  );
}

function errorMessageFromApiError(error: ApiError): string {
  const body = error.body as { message?: string | string[] } | null;
  if (!body?.message) return 'Something went wrong';
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

interface FormRowProps {
  id: string;
  label: string;
  required?: boolean;
  align?: 'center' | 'start';
  children: ReactNode;
}

function FormRow({ id, label, required, align = 'center', children }: FormRowProps) {
  return (
    <div className={`grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-5 ${align === 'start' ? 'sm:items-start' : 'sm:items-center'}`}>
      <label htmlFor={id} className="text-base font-medium leading-6 text-muted-foreground">
        {label}{required ? <span className="text-destructive" aria-hidden="true"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  labelAlign?: 'center' | 'start';
}

function FormInput({ id, label, labelAlign, className, required, ...props }: FormInputProps) {
  return (
    <FormRow id={id} label={label} required={required} align={labelAlign}>
      <input
        id={id}
        required={required}
        className={`h-12 w-full rounded-full border border-border bg-card px-5 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/45 focus:border-primary focus:ring-2 focus:ring-primary/15 sm:h-14 ${className ?? ''}`}
        {...props}
      />
    </FormRow>
  );
}
