'use client';

import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

type AuthMode = 'login' | 'register' | 'forgot';

interface CustomerAuthFormProps {
  mode: AuthMode;
}

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function CustomerAuthForm({ mode }: CustomerAuthFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const config = {
    login: { title: t('loginTitle'), description: t('loginDescription'), submit: t('loginSubmit') },
    register: { title: t('registerTitle'), description: t('registerDescription'), submit: t('registerSubmit') },
    forgot: { title: t('forgotTitle'), description: t('forgotDescription'), submit: t('sendLink') },
  }[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    // TODO(auth): thay mock này bằng API đăng nhập/đăng ký/khôi phục khi backend sẵn sàng.
    await wait(650);
    console.info(`[mock:${mode}] submitted`);
    setSubmitting(false);
    if (mode === 'forgot') setSubmitted(true);
    else router.push('/account');
  }

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-lg px-5 sm:px-8">
        <section className="rounded-xl bg-card p-6 shadow-sm sm:p-10">
          {mode !== 'login' ? (
            <Link href="/login" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t('backToLogin')}
            </Link>
          ) : null}
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mingo members</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">{config.title}</h1>
          <p className="mt-3 leading-6 text-muted-foreground">{config.description}</p>

          {submitted ? (
            <div className="mt-8 rounded-lg bg-blush p-5 text-sm font-semibold leading-6 text-primary" role="status">
              {t('successNote')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {mode === 'register' ? <AuthInput id="fullName" name="fullName" label={t('fullName')} autoComplete="name" required /> : null}
              <AuthInput id="email" name="email" type="email" label={t('email')} placeholder={t('emailPlaceholder')} autoComplete="email" required />
              {mode !== 'forgot' ? (
                <div>
                  <div className="relative">
                    <AuthInput id="password" name="password" type={showPassword ? 'text' : 'password'} label={t('password')} placeholder={t('passwordPlaceholder')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute bottom-3 right-3 rounded p-1 text-muted-foreground hover:text-primary">
                      {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
                    </button>
                  </div>
                  {mode === 'login' ? <div className="mt-2 text-right"><Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark">{t('forgotPassword')}</Link></div> : null}
                </div>
              ) : null}
              {mode === 'register' ? <AuthInput id="confirmPassword" name="confirmPassword" type="password" label={t('confirmPassword')} autoComplete="new-password" minLength={6} required /> : null}
              <button type="submit" disabled={submitting} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
                {submitting ? t('submitting') : config.submit}
              </button>
            </form>
          )}

          {mode === 'login' ? <p className="mt-6 text-center text-sm text-muted-foreground">{t('newCustomer')} <Link href="/register" className="font-bold text-primary hover:text-primary-dark">{t('createAccount')}</Link></p> : null}
          {mode === 'register' ? <p className="mt-6 text-center text-sm text-muted-foreground">{t('alreadyAccount')} <Link href="/login" className="font-bold text-primary hover:text-primary-dark">{t('signIn')}</Link></p> : null}
          <p className="mt-6 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">{t('mockNote')}</p>
        </section>
      </div>
    </div>
  );
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function AuthInput({ id, label, className, ...props }: AuthInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-foreground">{label}</span>
      <input id={id} className={`h-12 w-full rounded-lg border border-border bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/15 ${className ?? ''}`} {...props} />
    </label>
  );
}
