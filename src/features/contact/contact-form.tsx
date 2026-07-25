'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { Link } from '@/i18n/navigation';
import { FormField } from '@/components/ui/form-field';
import { createContactFormSchema, type ContactFormValues } from './schema';
import { useSubmitContact } from './use-submit-contact';

const DEPARTMENTS = ['customerCare', 'business', 'orderComplaint', 'other'] as const;

export function ContactForm() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);
  const { isSubmitting, submitContact } = useSubmitContact();
  const schema = useMemo(
    () =>
      createContactFormSchema({
        required: t('validation.required'),
        email: t('validation.email'),
        phone: t('validation.phone'),
        messageMin: t('validation.messageMin'),
      }),
    [t],
  );

  const resolver = useMemo<Resolver<ContactFormValues>>(
    () => async (values) => {
      const parsed = schema.safeParse(values);
      if (parsed.success) return { values: parsed.data, errors: {} };

      const errors = parsed.error.issues.reduce<FieldErrors<ContactFormValues>>((result, issue) => {
        const field = issue.path[0] as keyof ContactFormValues | undefined;
        if (field && !result[field]) {
          result[field] = { type: issue.code, message: issue.message };
        }
        return result;
      }, {});

      return { values: {}, errors };
    },
    [schema],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver, mode: 'onBlur', shouldFocusError: true });

  const onSubmit = async (values: ContactFormValues) => {
    await submitContact(values);
    reset();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-card px-5 py-16 text-center sm:px-10 sm:py-20">
        <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">{t('success.title')}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-foreground">{t('success.description')}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 h-12 rounded-md bg-primary px-8 font-bold normal-case text-primary-foreground transition hover:bg-primary-dark"
        >
          {t('success.sendAnother')}
        </button>
      </div>
    );
  }

  const fieldError = (name: keyof ContactFormValues) => errors[name]?.message;
  const describedBy = (name: keyof ContactFormValues) => (fieldError(name) ? `${name}-error` : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-card p-3 sm:p-5">
      <div className="grid gap-5 sm:gap-[22px]">
        <FormField id="fullName" label={t('fields.fullName')} error={fieldError('fullName')}>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(fieldError('fullName'))}
            aria-describedby={describedBy('fullName')}
            {...register('fullName')}
            className="mt-1 h-11 w-full bg-transparent text-foreground outline-none"
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <FormField id="email" label={t('fields.email')} error={fieldError('email')}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(fieldError('email'))}
              aria-describedby={describedBy('email')}
              {...register('email')}
              className="mt-1 h-11 w-full bg-transparent text-foreground outline-none"
            />
          </FormField>
          <FormField id="phone" label={t('fields.phone')} error={fieldError('phone')}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(fieldError('phone'))}
              aria-describedby={describedBy('phone')}
              {...register('phone')}
              className="mt-1 h-11 w-full bg-transparent text-foreground outline-none"
            />
          </FormField>
        </div>

        <FormField id="department" label={t('fields.department')} error={fieldError('department')}>
          <select
            id="department"
            aria-invalid={Boolean(fieldError('department'))}
            aria-describedby={describedBy('department')}
            defaultValue=""
            {...register('department')}
            className="mt-1 h-11 w-full appearance-none bg-transparent text-foreground outline-none"
          >
            <option value="" disabled />
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {t(`departments.${department}`)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="subject" label={t('fields.subject')} error={fieldError('subject')}>
          <input
            id="subject"
            type="text"
            aria-invalid={Boolean(fieldError('subject'))}
            aria-describedby={describedBy('subject')}
            {...register('subject')}
            className="mt-1 h-11 w-full bg-transparent text-foreground outline-none"
          />
        </FormField>

        <FormField id="message" label={t('fields.message')} error={fieldError('message')}>
          <textarea
            id="message"
            rows={5}
            aria-invalid={Boolean(fieldError('message'))}
            aria-describedby={describedBy('message')}
            {...register('message')}
            className="mt-1 min-h-24 w-full resize-y bg-transparent text-foreground outline-none"
          />
        </FormField>

        <div className="flex min-h-[92px] items-center justify-center bg-blush px-4 text-center text-[15px] font-bold leading-6 text-primary sm:px-8 sm:text-[17px]">
          <p>
            {t('privacy.prefix')}{' '}
            <Link href="/policies" className="underline underline-offset-2 hover:text-primary-dark">
              {t('privacy.link')}
            </Link>
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[92px] w-full bg-primary px-6 text-base font-bold normal-case text-primary-foreground transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70 sm:text-lg"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  );
}
