'use client';

import { useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { useCareersControllerApply } from '@/lib/api/generated/careers/careers';
import { ApiError } from '@/lib/api/fetcher';

interface CareerApplicationFormProps {
  careerId: string;
  jobTitle: string;
}

export function CareerApplicationForm({ careerId, jobTitle }: CareerApplicationFormProps) {
  const t = useTranslations('careers.detail.form');
  const { trigger, isMutating } = useCareersControllerApply(careerId);
  const [submitted, setSubmitted] = useState(false);
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
    const data = new FormData(event.currentTarget);
    try {
      await trigger({
        full_name: String(data.get('full_name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        cover_letter: String(data.get('cover_letter') ?? '') || undefined,
        cv,
      });
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('genericError'));
    }
  }

  if (submitted) {
    return (
      <div id="apply-form" className="scroll-mt-24 rounded-xl bg-blush p-6 text-sm font-semibold leading-6 text-primary" role="status">
        {t('successNote')}
      </div>
    );
  }

  return (
    <form id="apply-form" onSubmit={handleSubmit} className="scroll-mt-24 space-y-5 rounded-xl bg-blush p-6 sm:p-8" noValidate>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t('eyebrow')}</p>
        <h3 className="mt-2 text-xl font-bold text-foreground">{t('title', { title: jobTitle })}</h3>
      </div>

      {errorMessage ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput id="full_name" name="full_name" label={t('fullName')} autoComplete="name" required />
        <FormInput id="phone" name="phone" type="tel" label={t('phone')} autoComplete="tel" required />
      </div>
      <FormInput id="email" name="email" type="email" label={t('email')} autoComplete="email" required />

      <label htmlFor="cover_letter" className="block">
        <span className="mb-2 block text-sm font-bold text-foreground">{t('coverLetter')}</span>
        <textarea
          id="cover_letter"
          name="cover_letter"
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label htmlFor="cv" className="block">
        <span className="mb-2 block text-sm font-bold text-foreground">
          {t('cv')}<span aria-hidden="true"> *</span>
        </span>
        <input
          ref={fileInputRef}
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="block w-full text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary-foreground file:transition-colors hover:file:bg-primary-dark"
        />
        <span className="mt-1 block text-xs text-muted-foreground">{t('cvHint')}</span>
      </label>

      <button
        type="submit"
        disabled={isMutating}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {isMutating ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

function errorMessageFromApiError(error: ApiError): string {
  const body = error.body as { message?: string | string[] } | null;
  if (!body?.message) return 'Something went wrong';
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function FormInput({ id, label, className, ...props }: FormInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-foreground">{label}</span>
      <input
        id={id}
        className={`h-12 w-full rounded-lg border border-border bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/15 ${className ?? ''}`}
        {...props}
      />
    </label>
  );
}
