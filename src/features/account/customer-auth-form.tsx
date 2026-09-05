'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { authControllerLogin, authControllerRegister } from '@/lib/api/generated/auth/auth';
import {
  otpControllerSendOtp,
  otpControllerVerifyOtp,
  otpControllerSendPasswordResetOtp,
  otpControllerResetPassword,
} from '@/lib/api/generated/otp/otp';
import { checkAccountExists, claimGuestAccount } from './api';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token';
import { syncAdminSession } from '@/lib/admin/session-client';
import { ApiError } from '@/lib/api/fetcher';
import { mergeCart } from '@/features/cart/api';
import { notifyCartUpdated } from '@/features/cart/cart-token';

type AuthMode = 'login' | 'register' | 'forgot';

/**
 * Đăng nhập theo kiểu identifier-first. Bắt buộc phải có bước hỏi định danh trước:
 * khách mua hàng guest được định danh bằng SĐT và có thể KHÔNG có email nào, nên form
 * chỉ-email sẽ khoá họ khỏi chính tài khoản chứa đơn hàng của mình.
 */
type LoginStage = 'identifier' | 'password' | 'create-password';

/** Phân biệt email với SĐT để gửi đúng field cho backend (backend nhận cả hai). */
function toIdentifierPayload(raw: string): { email?: string; phone?: string } {
  const value = raw.trim();
  return value.includes('@') ? { email: value } : { phone: value };
}

/** Dữ liệu đăng ký giữ lại giữa bước điền form và bước xác thực OTP. */
interface PendingRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

/** Quốc gia mặc định — form đăng ký đã bỏ field này nhưng RegisterDto vẫn yêu cầu. */
const DEFAULT_COUNTRY = 'Vietnam';

/** Số giây chờ trước khi cho phép gửi lại mã OTP. */
const OTP_RESEND_COOLDOWN = 60;

interface CustomerAuthFormProps {
  mode: AuthMode;
}

export function CustomerAuthForm({ mode }: CustomerAuthFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  // Bước xác thực OTP của luồng đăng ký: chỉ hiện sau khi đã gửi mã đến email.
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [otpValue, setOtpValue] = useState('');
  // Bước đặt mật khẩu mới của luồng quên mật khẩu: email đã nhận OTP.
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Backend verifyOtp sẽ tự tạo tài khoản, nên phải register (đặt đúng mật khẩu) TRƯỚC khi
  // verify. Cờ này đảm bảo chỉ register 1 lần dù người dùng nhập sai OTP rồi thử lại.
  const [accountCreated, setAccountCreated] = useState(false);
  // Đăng nhập 2 bước (identifier-first): nhập email/SĐT -> check-exists -> rẽ nhánh sang
  // nhập mật khẩu (tài khoản thường) hoặc tạo mật khẩu (tài khoản guest từ checkout).
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginStage, setLoginStage] = useState<LoginStage>('identifier');

  // Đếm ngược cooldown gửi lại OTP.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Hỗ trợ session cũ chỉ còn trong localStorage: đồng bộ lại cookie trước khi hiển thị form.
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    let cancelled = false;
    syncAdminSession(accessToken).then((user) => {
      if (cancelled) return;
      if (!user) {
        clearAccessToken();
        return;
      }
      if (user.role === 'admin') window.location.replace('/admin');
      else router.replace('/');
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const config = {
    login: { title: t('loginTitle'), description: t('loginDescription'), submit: t('loginSubmit') },
    register: { title: t('registerTitle'), description: t('registerDescription'), submit: t('registerSubmit') },
    forgot: { title: t('forgotTitle'), description: t('forgotDescription'), submit: t('sendLink') },
  }[mode];

  const otpStep = mode === 'register' && pending !== null;
  const resetStep = mode === 'forgot' && resetEmail !== null;

  async function completeAuthentication(accessToken: string, role: string) {
    setAccessToken(accessToken);
    const sessionUser = await syncAdminSession(accessToken);
    if (!sessionUser || sessionUser.role !== role) throw new Error('Session could not be verified');
    await mergeCartAfterAuthentication(locale);
    if (role === 'admin') window.location.replace('/admin');
    else router.push('/');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');

    try {
      if (mode === 'login') {
        const identifier = toIdentifierPayload(loginIdentifier);

        // Bước 1: hỏi định danh, chưa hỏi mật khẩu — vì chưa biết tài khoản đã có
        // mật khẩu hay là tài khoản guest chưa từng đặt mật khẩu.
        if (loginStage === 'identifier') {
          const account = await checkAccountExists(identifier);
          if (!account.exists) {
            setErrorMessage(t('accountNotFound'));
            return;
          }
          setLoginStage(account.hasPassword ? 'password' : 'create-password');
          return;
        }

        // Tài khoản guest (checkout không đăng nhập) -> đặt mật khẩu đầu tiên rồi vào luôn.
        if (loginStage === 'create-password') {
          if (password !== String(data.get('confirmPassword') ?? '')) {
            setErrorMessage(t('passwordMismatch'));
            return;
          }
          const claimed = await claimGuestAccount({ ...identifier, password });
          await completeAuthentication(claimed.accessToken, claimed.user.role);
          return;
        }

        const res = await authControllerLogin({ ...identifier, password });
        await completeAuthentication(res.accessToken, res.user.role);
        return;
      }

      if (mode === 'register') {
        const confirmPassword = String(data.get('confirmPassword') ?? '');
        if (password !== confirmPassword) {
          setErrorMessage(t('passwordMismatch'));
          return;
        }
        const firstName = String(data.get('firstName') ?? '');
        const lastName = String(data.get('lastName') ?? '');
        const phoneNumber = String(data.get('phoneNumber') ?? '');

        // SĐT đã có đơn hàng guest (checkout không cần đăng nhập) -> tài khoản passwordless
        // đã tồn tại. Claim thẳng bằng set-password (không cần OTP, theo quyết định sản phẩm:
        // ai biết SĐT của đơn hàng thì được nhận tài khoản đó) thay vì đăng ký mới.
        const account = await checkAccountExists({ phone: phoneNumber });
        if (account.exists && account.hasPassword) {
          setErrorMessage(t('phoneAlreadyRegistered'));
          return;
        }
        if (account.exists && !account.hasPassword) {
          const loginRes = await claimGuestAccount({ phone: phoneNumber, email, password, firstName, lastName });
          await completeAuthentication(loginRes.accessToken, loginRes.user.role);
          return;
        }

        // Chưa có tài khoản nào -> xác thực email trước khi tạo tài khoản: gửi OTP rồi
        // chuyển sang bước nhập mã.
        try {
          await otpControllerSendOtp({ email });
        } catch (error) {
          // Nếu OTP trước vẫn còn hiệu lực, backend từ chối gửi lại — nhưng mã đã nằm trong
          // email của người dùng, vẫn cho sang bước nhập mã thay vì chặn. Các lỗi khác
          // (email đã tồn tại...) thì ném ra để hiển thị và giữ ở bước điền form.
          if (!isOtpStillValidError(error)) throw error;
        }
        setAccountCreated(false);
        setPending({ email, password, firstName, lastName, phoneNumber });
        setOtpValue('');
        setResendCooldown(OTP_RESEND_COOLDOWN);
        return;
      }

      // forgot: gửi OTP đặt lại mật khẩu (backend: /api/v1/otp/send-password-reset) rồi sang
      // bước nhập mã + mật khẩu mới (/api/v1/otp/reset-password).
      try {
        await otpControllerSendPasswordResetOtp({ email });
      } catch (error) {
        // Nuốt lỗi "email không tồn tại" để tránh dò tài khoản; lỗi mạng thật thì báo chung.
        if (!(error instanceof ApiError)) throw error;
      }
      setResetEmail(email);
      setOtpValue('');
      setResendCooldown(OTP_RESEND_COOLDOWN);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  // Bước 2 của đăng ký. Thứ tự bắt buộc theo backend hiện tại:
  //   register (đặt đúng mật khẩu + hồ sơ) -> verifyOtp (đánh dấu email đã xác thực; vì user
  //   đã tồn tại nên KHÔNG bị tự tạo account mật khẩu ngẫu nhiên) -> login.
  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) return;
    setErrorMessage(null);
    setInfoMessage(null);
    setSubmitting(true);
    try {
      // Chỉ tạo tài khoản một lần; nếu người dùng nhập sai OTP rồi thử lại thì bỏ qua bước này.
      if (!accountCreated) {
        await authControllerRegister({
          email: pending.email,
          password: pending.password,
          firstName: pending.firstName,
          lastName: pending.lastName,
          phoneNumber: pending.phoneNumber,
          country: DEFAULT_COUNTRY,
        });
        setAccountCreated(true);
      }
      await otpControllerVerifyOtp({ email: pending.email, otp: otpValue.trim() });
      // Backend không trả accessToken khi đăng ký — đăng nhập lại ngay bằng thông tin vừa tạo.
      const loginRes = await authControllerLogin({ email: pending.email, password: pending.password });
      await completeAuthentication(loginRes.accessToken, loginRes.user.role);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('otpInvalid'));
    } finally {
      setSubmitting(false);
    }
  }

  // Bước 2 của quên mật khẩu: một request vừa xác thực OTP vừa đổi mật khẩu.
  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetEmail) return;
    setErrorMessage(null);
    setInfoMessage(null);
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get('newPassword') ?? '');
    if (newPassword !== String(data.get('confirmPassword') ?? '')) {
      setErrorMessage(t('passwordMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      await otpControllerResetPassword({ email: resetEmail, otp: otpValue.trim(), newPassword });
      setResetEmail(null);
      setSubmitted(true);
      router.push('/login');
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('otpInvalid'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    // pending = luồng đăng ký, resetEmail = luồng quên mật khẩu.
    if ((!pending && !resetEmail) || resendCooldown > 0) return;
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      if (resetEmail) await otpControllerSendPasswordResetOtp({ email: resetEmail });
      else if (pending) await otpControllerSendOtp({ email: pending.email });
      setInfoMessage(t('otpResent'));
      setResendCooldown(OTP_RESEND_COOLDOWN);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('genericError'));
    }
  }

  // Quay lại bước điền form (đổi email) — bỏ trạng thái OTP đang chờ.
  function backToForm() {
    setPending(null);
    setResetEmail(null);
    setOtpValue('');
    setErrorMessage(null);
    setInfoMessage(null);
    setResendCooldown(0);
    setAccountCreated(false);
  }

  /** Quay lại bước nhập định danh của luồng đăng nhập (đổi email/SĐT). */
  function backToIdentifier() {
    setLoginStage('identifier');
    setErrorMessage(null);
    setInfoMessage(null);
  }

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <section className="rounded-xl bg-card p-6 shadow-sm sm:p-10">
          {mode !== 'login' ? (
            <Link href="/login" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t('backToLogin')}
            </Link>
          ) : null}
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mingo members</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {otpStep ? t('otpTitle') : resetStep ? t('resetTitle') : config.title}
          </h1>
          <p className="mt-3 leading-6 text-muted-foreground">
            {otpStep && pending
              ? t('otpDescription', { email: pending.email })
              : resetStep && resetEmail
                ? t('resetDescription', { email: resetEmail })
                : config.description}
          </p>

          {submitted ? (
            <div className="mt-8 rounded-lg bg-blush p-5 text-sm font-semibold leading-6 text-primary" role="status">
              {mode === 'forgot' ? t('resetSuccess') : t('successNote')}
            </div>
          ) : resetStep ? (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
              {errorMessage ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
                  {errorMessage}
                </div>
              ) : null}
              {infoMessage ? (
                <div className="rounded-lg bg-blush p-4 text-sm font-semibold text-primary" role="status">
                  {infoMessage}
                </div>
              ) : null}
              <AuthInput
                id="otp"
                name="otp"
                label={t('otpLabel')}
                placeholder={t('otpPlaceholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="tracking-[0.5em]"
                required
                autoFocus
              />
              <div className="relative">
                <AuthInput
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  label={t('newPassword')}
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute bottom-3 right-3 rounded p-1 text-muted-foreground hover:text-primary">
                  {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
                </button>
              </div>
              <AuthInput id="confirmPassword" name="confirmPassword" type="password" label={t('confirmPassword')} autoComplete="new-password" minLength={8} required />
              <button type="submit" disabled={submitting || otpValue.length < 6} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
                {submitting ? t('resetSubmitting') : t('resetSubmit')}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={backToForm} className="font-semibold text-muted-foreground hover:text-primary">
                  {t('otpChangeEmail')}
                </button>
                <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0} className="font-semibold text-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:text-muted-foreground">
                  {resendCooldown > 0 ? t('otpResendIn', { seconds: resendCooldown }) : t('otpResend')}
                </button>
              </div>
            </form>
          ) : otpStep ? (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
              {errorMessage ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
                  {errorMessage}
                </div>
              ) : null}
              {infoMessage ? (
                <div className="rounded-lg bg-blush p-4 text-sm font-semibold text-primary" role="status">
                  {infoMessage}
                </div>
              ) : null}
              <AuthInput
                id="otp"
                name="otp"
                label={t('otpLabel')}
                placeholder={t('otpPlaceholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="tracking-[0.5em]"
                required
                autoFocus
              />
              <button type="submit" disabled={submitting || otpValue.length < 6} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
                {submitting ? t('otpVerifying') : t('otpSubmit')}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={backToForm} className="font-semibold text-muted-foreground hover:text-primary">
                  {t('otpChangeEmail')}
                </button>
                <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0} className="font-semibold text-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:text-muted-foreground">
                  {resendCooldown > 0 ? t('otpResendIn', { seconds: resendCooldown }) : t('otpResend')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {errorMessage ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
                  {errorMessage}
                </div>
              ) : null}
              {mode === 'register' ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <AuthInput id="firstName" name="firstName" label={t('firstName')} autoComplete="given-name" required />
                  <AuthInput id="lastName" name="lastName" label={t('lastName')} autoComplete="family-name" required />
                </div>
              ) : null}
              {mode === 'login' ? (
                <AuthInput
                  id="loginIdentifier"
                  name="loginIdentifier"
                  label={t('identifierLabel')}
                  placeholder={t('identifierPlaceholder')}
                  autoComplete="username"
                  value={loginIdentifier}
                  onChange={(event) => setLoginIdentifier(event.target.value)}
                  readOnly={loginStage !== 'identifier'}
                  required
                  autoFocus
                />
              ) : (
                <AuthInput id="email" name="email" type="email" label={t('email')} placeholder={t('emailPlaceholder')} autoComplete="email" required />
              )}
              {mode === 'register' ? (
                <AuthInput id="phoneNumber" name="phoneNumber" type="tel" label={t('phoneNumber')} autoComplete="tel" required />
              ) : null}
              {/* Tài khoản guest chưa từng có mật khẩu -> đổi nhãn thành "tạo mật khẩu" cho đúng thực tế. */}
              {loginStage === 'create-password' && mode === 'login' ? (
                <p className="rounded-lg bg-blush p-4 text-sm font-semibold leading-6 text-primary" role="status">
                  {t('createPasswordHint')}
                </p>
              ) : null}
              {mode === 'register' || (mode === 'login' && loginStage !== 'identifier') ? (
                <div>
                  <div className="relative">
                    <AuthInput
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label={loginStage === 'create-password' && mode === 'login' ? t('createPasswordLabel') : t('password')}
                      placeholder={t('passwordPlaceholder')}
                      autoComplete={mode === 'login' && loginStage === 'password' ? 'current-password' : 'new-password'}
                      minLength={8}
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute bottom-3 right-3 rounded p-1 text-muted-foreground hover:text-primary">
                      {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
                    </button>
                  </div>
                  {mode === 'login' && loginStage === 'password' ? <div className="mt-2 text-right"><Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark">{t('forgotPassword')}</Link></div> : null}
                </div>
              ) : null}
              {mode === 'register' || (mode === 'login' && loginStage === 'create-password') ? (
                <AuthInput id="confirmPassword" name="confirmPassword" type="password" label={t('confirmPassword')} autoComplete="new-password" minLength={8} required />
              ) : null}
              <button type="submit" disabled={submitting} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
                {submitting
                  ? t('submitting')
                  : mode === 'login' && loginStage === 'identifier'
                    ? t('identifierContinue')
                    : mode === 'login' && loginStage === 'create-password'
                      ? t('createPasswordSubmit')
                      : config.submit}
              </button>
              {mode === 'login' && loginStage !== 'identifier' ? (
                <button type="button" onClick={backToIdentifier} className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-primary">
                  {t('identifierChange')}
                </button>
              ) : null}
            </form>
          )}

          {mode === 'login' ? <p className="mt-6 text-center text-sm text-muted-foreground">{t('newCustomer')} <Link href="/register" className="font-bold text-primary hover:text-primary-dark">{t('createAccount')}</Link></p> : null}
          {mode === 'register' ? <p className="mt-6 text-center text-sm text-muted-foreground">{t('alreadyAccount')} <Link href="/login" className="font-bold text-primary hover:text-primary-dark">{t('signIn')}</Link></p> : null}
        </section>
      </div>
    </div>
  );
}

async function mergeCartAfterAuthentication(locale: string): Promise<void> {
  try {
    await mergeCart(locale);
    notifyCartUpdated();
  } catch {
    // Đăng nhập vẫn thành công nếu merge giỏ lỗi; CartProvider sẽ tải lại và hiển thị lỗi API khi cần.
  }
}

function errorMessageFromApiError(error: ApiError): string {
  const body = error.body as { message?: string | string[] } | null;
  if (!body?.message) return 'Something went wrong';
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

/**
 * Backend từ chối gửi OTP mới khi mã cũ VẪN còn hiệu lực (message chứa "hiệu lực").
 * Trường hợp này mã đã ở email người dùng nên ta vẫn cho vào bước nhập mã.
 */
function isOtpStillValidError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return errorMessageFromApiError(error).toLowerCase().includes('hiệu lực');
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
