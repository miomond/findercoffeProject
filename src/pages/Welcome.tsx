import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "../components/ThemeToggle";
import type { Lang } from "../i18n";

interface WelcomeProps {
  logoSrc?: string;
  onChoose: (lang: Lang) => void;
}

const LANG_BUTTON =
  "group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border-2 border-line-strong bg-raised px-5 py-3 text-start transition hover:border-brand hover:bg-raised-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const OPTIONS: { lang: Lang; label: string; hint: string; hintLang: Lang; arrow: typeof faArrowLeft }[] = [
  { lang: "ar", label: "العربية", hint: "Arabic", hintLang: "en", arrow: faArrowLeft },
  { lang: "en", label: "English", hint: "الإنجليزية", hintLang: "ar", arrow: faArrowRight },
];

// Opening screen: a bilingual welcome and a single-choice language question.
export default function Welcome({ logoSrc, onChoose }: WelcomeProps) {
  return (
    <main
      className="relative grid min-h-dvh place-items-center bg-page bg-[radial-gradient(circle_at_15%_0%,rgba(250,126,2,0.16)_0,transparent_40%),radial-gradient(circle_at_90%_100%,rgba(250,126,2,0.10)_0,transparent_45%)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(4.5rem,env(safe-area-inset-top))]"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="brand-pattern pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
        <ThemeToggle />
      </div>

      <section className="screen-in relative w-full max-w-md rounded-[28px] bg-surface px-6 pb-8 pt-8 text-center shadow-[0_30px_80px_-30px_rgba(250,126,2,0.35)] ring-1 ring-line-soft sm:px-10">
        {logoSrc && (
          <img src={logoSrc} alt="finder CAFE" className="logo-glow mx-auto h-36 w-auto object-contain sm:h-44" />
        )}

        <h1 className="mt-5">
          <span dir="rtl" lang="ar" className="block text-3xl font-extrabold text-brand">
            أهلاً بك
          </span>
          <span
            dir="ltr"
            lang="en"
            className="mt-1 block text-2xl font-bold text-fg"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Welcome
          </span>
        </h1>

        <div className="mx-auto my-6 h-px w-24 bg-line-strong" />

        <div role="group" aria-labelledby="lang-question">
          <p id="lang-question" className="leading-snug">
            <span dir="rtl" lang="ar" className="block text-base font-bold text-fg">
              اختر لغتك المفضلة
            </span>
            <span dir="ltr" lang="en" className="block text-sm text-fg-muted">
              Choose your preferred language
            </span>
          </p>

          <div className="mt-5 grid gap-3">
            {OPTIONS.map((option) => (
              <button
                key={option.lang}
                type="button"
                lang={option.lang}
                dir={option.lang === "ar" ? "rtl" : "ltr"}
                onClick={() => onChoose(option.lang)}
                className={LANG_BUTTON}
              >
                <span className="leading-tight">
                  <span className="block text-xl font-extrabold text-fg">{option.label}</span>
                  <span lang={option.hintLang} className="block text-sm text-fg-muted">
                    {option.hint}
                  </span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition-transform group-hover:scale-110">
                  <FontAwesomeIcon icon={option.arrow} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
