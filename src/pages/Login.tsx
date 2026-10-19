import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import ThemeToggle, { ROUND_BUTTON } from "../components/ThemeToggle";
import { checkCredentials } from "../auth";
import { DIR, T, type Lang } from "../i18n";

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginProps {
  lang: Lang;
  onLangChange?: (lang: Lang) => void;
  onSuccess: () => void;
  onBack: () => void;
  logoSrc?: string;
}

const INPUT_CLASS =
  "block h-12 w-full min-w-0 appearance-none rounded-xl border border-line bg-field px-3 text-base text-fg outline-none transition placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-danger/70";

interface LoginFieldProps {
  icon: IconDefinition;
  label: string;
  error?: string | false;
  children: React.ReactNode;
}

function LoginField({ icon, label, error, children }: LoginFieldProps) {
  return (
    <label className="block text-start">
      <span className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tile text-brand ring-1 ring-line-strong">
          <FontAwesomeIcon icon={icon} className="text-[15px]" aria-hidden="true" />
        </span>
        <span className="text-base font-bold text-fg">{label}</span>
      </span>
      <span className="mt-2 block">{children}</span>
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-danger-fg">
          {error}
        </span>
      )}
    </label>
  );
}

export default function Login({ lang, onLangChange, onSuccess, onBack, logoSrc }: LoginProps) {
  const t = T[lang];
  const other: Lang = lang === "ar" ? "en" : "ar";
  const [showPassword, setShowPassword] = useState(false);
  const [failed, setFailed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onSubmit",
    defaultValues: { username: "", password: "" },
  });

  const onValid: SubmitHandler<LoginFormValues> = (values) => {
    if (checkCredentials(values.username, values.password)) {
      setFailed(false);
      onSuccess();
    } else {
      setFailed(true);
    }
  };

  return (
    <main
      dir={DIR[lang]}
      lang={lang}
      className="relative grid min-h-dvh place-items-center bg-page bg-[radial-gradient(circle_at_15%_0%,rgba(250,126,2,0.16)_0,transparent_40%),radial-gradient(circle_at_90%_100%,rgba(250,126,2,0.10)_0,transparent_45%)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(4.5rem,env(safe-area-inset-top))]"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="brand-pattern pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex gap-2">
        {onLangChange && (
          <button
            type="button"
            lang={other}
            onClick={() => onLangChange(other)}
            aria-label={t.switchLangLabel}
            title={t.switchLangLabel}
            className={`${ROUND_BUTTON} text-sm font-extrabold hover:cursor-pointer`}
          >
            {t.switchLangShort}
          </button>
        )}
        <ThemeToggle lang={lang} />
      </div>

      <section className="screen-in relative w-full max-w-md rounded-[28px] bg-surface px-6 pb-8 pt-8 text-center shadow-[0_30px_80px_-30px_rgba(250,126,2,0.35)] ring-1 ring-line-soft sm:px-10">
        {logoSrc && (
          <img src={logoSrc} alt="finder CAFE" className="logo-glow mx-auto h-28 w-auto object-contain sm:h-36" />
        )}
        <h1 className="mt-5 text-3xl font-extrabold text-brand">{t.loginTitle}</h1>
        <p className="mt-2 text-base text-fg-soft">{t.loginSubtitle}</p>

        <div className="mx-auto my-6 h-px w-24 bg-line-strong" />

        <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5">
          <LoginField icon={faUser} label={t.username} error={errors.username && t.usernameError}>
            <input
              type="text"
              dir="ltr"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              className={`${INPUT_CLASS} rtl:text-right`}
              {...register("username", { validate: (value) => value.trim().length > 0 })}
            />
          </LoginField>

          <LoginField icon={faLock} label={t.password} error={errors.password && t.passwordError}>
            <span className="relative block">
              <input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                className={`${INPUT_CLASS} pe-12 rtl:text-right`}
                {...register("password", { validate: (value) => value.length > 0 })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                title={showPassword ? t.hidePassword : t.showPassword}
                className="absolute end-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-brand transition hover:cursor-pointer hover:bg-raised-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
              </button>
            </span>
          </LoginField>

          {failed && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-center text-base font-semibold text-danger-fg">
              {t.loginFailed}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-brand to-brand-deep px-6 py-4 text-on-brand shadow-[0_12px_28px_-12px_rgba(250,126,2,0.9)] transition-all hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-[0_16px_32px_-12px_rgba(250,126,2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="text-lg font-bold">{t.loginButton}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand transition hover:cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <FontAwesomeIcon icon={lang === "ar" ? faArrowRight : faArrowLeft} aria-hidden="true" />
          {t.backToForm}
        </button>
      </section>
    </main>
  );
}
