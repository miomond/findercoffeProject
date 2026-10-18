import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAddressCard,
  faBellConcierge,
  faBroom,
  faCakeCandles,
  faCheck,
  faCoins,
  faCouch,
  faFaceGrinBeam,
  faFaceSadTear,
  faMugSaucer,
  faPhone,
  faRotateLeft,
  faStar as faStarSolid,
  faStopwatch,
  faUser,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faLightbulb, faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { latestFeedback } from "../feedbackStorage";
import ThemeToggle, { ROUND_BUTTON } from "../components/ThemeToggle";
import { DIR, T, type Lang } from "../i18n";

type CategoryKey =
  | "beverages"
  | "food"
  | "service"
  | "cleanliness"
  | "ambience"
  | "speed"
  | "value";

type RatingLevel = "1" | "2" | "3" | "4" | "5";
type VisitAgain = "yes" | "maybe" | "no";

interface FeedbackFormValues {
  fullName: string;
  phone: string;
  birthday: string;
  ratings: Record<CategoryKey, RatingLevel | "">;
  liked: string;
  suggestions: string;
  overall: number;
  visitAgain: VisitAgain | "";
}

export interface FeedbackPayload {
  fullName: string;
  phone: string;
  birthday: string | null;
  ratings: Record<CategoryKey, number>;
  liked: string;
  suggestions: string;
  overall: number;
  visitAgain: VisitAgain;
}

interface FeedbackFormProps {
  lang: Lang;
  onLangChange?: (lang: Lang) => void;
  onSubmit?: (payload: FeedbackPayload) => Promise<void> | void;
  logoSrc?: string;
}

// Brand palette (finder CAFE logo: orange #FA7E02). Values live in index.css so they switch with the theme.
const C = {
  orange: "var(--color-brand)",
  ink: "var(--color-on-brand)",
  raised: "var(--color-raised)",
  line: "var(--color-line-strong)",
  muted: "var(--color-faint)",
  cream: "#F6EEE5",
};

interface IconProps {
  icon: IconDefinition;
  className?: string;
}

function Icon({ icon, className = "text-[17px]" }: IconProps) {
  return <FontAwesomeIcon icon={icon} className={className} aria-hidden="true" />;
}

interface CupLevelProps {
  level: number;
}

function CupLevel({ level }: CupLevelProps) {
  return (
    <span className="relative block text-2xl" aria-hidden="true">
      <FontAwesomeIcon icon={faMugSaucer} className="block text-line-strong" />
      <span className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: `${level * 20}%` }}>
        <FontAwesomeIcon icon={faMugSaucer} className="absolute bottom-0 left-0 block text-brand" />
      </span>
    </span>
  );
}

interface CoffeeBeanProps {
  filled: boolean;
}

function CoffeeBean({ filled }: CoffeeBeanProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9 sm:h-7 sm:w-7" aria-hidden="true">
      <g transform="rotate(-35 12 12)">
        <ellipse
          cx="12"
          cy="12"
          rx="6.5"
          ry="9.5"
          style={{ fill: filled ? C.orange : C.raised, stroke: filled ? C.orange : C.muted }}
          strokeWidth={1.6}
        />
        <path
          d="M12 2.5c-2.6 3-2.6 6.4 0 9.5s2.6 6.5 0 9.5"
          fill="none"
          style={{ stroke: filled ? C.ink : C.muted }}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

interface Level {
  value: RatingLevel;
  ar: string;
  en: string;
}

const LEVELS: Level[] = [
  { value: "1", ar: "ضعيف", en: "Poor" },
  { value: "2", ar: "مقبول", en: "Fair" },
  { value: "3", ar: "جيد", en: "Good" },
  { value: "4", ar: "جيد جداً", en: "Very Good" },
  { value: "5", ar: "ممتاز", en: "Excellent" },
];

interface Category {
  key: CategoryKey;
  ar: string;
  en: string;
  icon: ReactNode;
}

const CATEGORIES: Category[] = [
  { key: "beverages", ar: "جودة المشروبات", en: "Beverages Quality", icon: <Icon icon={faMugSaucer} /> },
  { key: "food", ar: "جودة الطعام", en: "Food Quality", icon: <Icon icon={faUtensils} /> },
  { key: "service", ar: "الخدمة", en: "Service", icon: <Icon icon={faBellConcierge} /> },
  { key: "cleanliness", ar: "النظافة", en: "Cleanliness", icon: <Icon icon={faBroom} /> },
  { key: "ambience", ar: "الأجواء", en: "Ambience", icon: <Icon icon={faCouch} /> },
  { key: "speed", ar: "سرعة الخدمة", en: "Service Speed", icon: <Icon icon={faStopwatch} /> },
  { key: "value", ar: "القيمة مقابل السعر", en: "Value for Money", icon: <Icon icon={faCoins} /> },
];

const VISIT_OPTIONS: { value: VisitAgain; ar: string; en: string }[] = [
  { value: "no", ar: "لا", en: "No" },
  { value: "maybe", ar: "ربما", en: "Maybe" },
  { value: "yes", ar: "نعم", en: "Yes" },
];

// Phones: the label spans the full width and the five ratings sit underneath it.
// sm and up: one row per category, label column sized to its widest one-line name.
const GRID_COLS = "grid grid-cols-5 sm:grid-cols-[minmax(min-content,1.5fr)_repeat(5,minmax(0,1fr))]";
const LABEL_CELL = "col-span-5 sm:col-span-1";
// Every row shares the table's columns, so the name column is as wide as the longest name in all rows.
const ROW = "col-span-full grid grid-cols-subgrid";

const INPUT_CLASS =
  "mt-2 block h-12 w-full min-w-0 appearance-none rounded-xl border border-line bg-field px-3 text-base text-fg outline-none transition placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-danger/70";

// Latest allowed birthday (YYYY-MM-DD).
const TODAY = new Date().toISOString().slice(0, 10);

const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return /^\+?[\d\s-]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15;
};

const TEXTAREA_CLASS =
  "mt-3 block w-full resize-none sm:mt-0 rounded-xl border border-line bg-field bg-[linear-gradient(transparent_31px,var(--color-line-soft)_32px)] bg-[length:100%_32px] px-3 text-base leading-8 text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

const REACTION_MS = 2800;

const BUBBLES = [
  { left: 6, size: 14, delay: 0, drift: -10 },
  { left: 16, size: 22, delay: 0.35, drift: 12 },
  { left: 27, size: 10, delay: 0.15, drift: -6 },
  { left: 38, size: 18, delay: 0.6, drift: 8 },
  { left: 50, size: 12, delay: 0.05, drift: -14 },
  { left: 60, size: 24, delay: 0.45, drift: 10 },
  { left: 71, size: 11, delay: 0.25, drift: -8 },
  { left: 81, size: 19, delay: 0.7, drift: 14 },
  { left: 90, size: 13, delay: 0.1, drift: -12 },
  { left: 45, size: 9, delay: 0.85, drift: 6 },
];

const DROPS = [
  { left: 22, delay: 0.3 },
  { left: 40, delay: 0.9 },
  { left: 62, delay: 0.55 },
  { left: 78, delay: 1.1 },
];

interface VisitReactionProps {
  lang: Lang;
  kind: "yes" | "no";
  onClose: () => void;
}

function VisitReaction({ lang, kind, onClose }: VisitReactionProps) {
  const happy = kind === "yes";
  const t = T[lang];
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClose}
      className="reaction-fade fixed inset-0 z-50 grid place-items-center bg-page/70 px-6 backdrop-blur-sm"
    >
      <div className="reaction-pop relative flex w-full max-w-xs flex-col items-center overflow-hidden rounded-3xl border border-line-strong bg-surface px-6 pb-7 pt-10 text-center shadow-[0_24px_60px_-20px_rgba(250,126,2,0.45)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {happy
            ? BUBBLES.map((bubble, i) => (
                <span
                  key={i}
                  className="bubble absolute -bottom-6 rounded-full border border-brand/70 bg-brand/15"
                  style={
                    {
                      left: `${bubble.left}%`,
                      width: bubble.size,
                      height: bubble.size,
                      animationDelay: `${bubble.delay}s`,
                      "--drift": `${bubble.drift}px`,
                    } as CSSProperties
                  }
                />
              ))
            : DROPS.map((drop, i) => (
                <span
                  key={i}
                  className="drop absolute top-0 h-3 w-1.5 rounded-full bg-faint"
                  style={{ left: `${drop.left}%`, animationDelay: `${drop.delay}s` }}
                />
              ))}
        </div>
        <FontAwesomeIcon
          icon={happy ? faFaceGrinBeam : faFaceSadTear}
          className={`relative text-7xl ${happy ? "emoji-bounce text-brand" : "emoji-sad text-fg-muted"}`}
          aria-hidden="true"
        />
        <p className="relative mt-5 text-2xl font-extrabold text-fg">
          {happy ? t.reactionYesTitle : t.reactionNoTitle}
        </p>
        <p className="relative mt-1 text-[15px] text-fg-muted">{happy ? t.reactionYesText : t.reactionNoText}</p>
      </div>
    </div>
  );
}

interface FinderLogoProps {
  logoSrc?: string;
}

function FinderLogo({ logoSrc }: FinderLogoProps) {
  if (logoSrc) {
    return <img src={logoSrc} alt="finder CAFE" className="logo-glow h-28 w-auto object-contain sm:h-32 md:h-40" />;
  }
  return (
    <div className="logo-glow flex flex-col items-center text-brand" aria-label="finder CAFE" dir="ltr">
      <span className="text-4xl font-extrabold leading-none" style={{ fontFamily: "'Fraunces', serif" }}>
        finder
      </span>
      <span className="mt-1 text-xs font-bold tracking-[0.45em]" style={{ fontFamily: "'Fraunces', serif" }}>
        CAFE
      </span>
    </div>
  );
}

function LatteArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
      <ellipse cx="60" cy="104" rx="46" ry="8" style={{ fill: C.orange }} opacity="0.12" />
      <circle cx="60" cy="58" r="46" style={{ fill: C.raised }} />
      <circle cx="60" cy="58" r="46" fill="none" style={{ stroke: C.line }} strokeWidth="2" />
      <circle cx="60" cy="58" r="36" fill="#3B2416" />
      <circle cx="60" cy="58" r="36" fill="none" style={{ stroke: C.orange }} strokeWidth="2" />
      <path
        d="M60 82c-12-8-20-15-20-24a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 9-8 16-20 24Z"
        style={{ fill: C.cream }}
      />
      <path d="M60 82V52" stroke="#3B2416" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="22" cy="100" rx="5" ry="3.2" style={{ fill: C.orange }} transform="rotate(-30 22 100)" />
      <ellipse cx="102" cy="96" rx="5" ry="3.2" style={{ fill: C.orange }} transform="rotate(25 102 96)" />
    </svg>
  );
}

interface FieldProps {
  icon: IconDefinition;
  label: string;
  optional?: string;
  error?: string | false;
  className?: string;
  children: ReactNode;
}

function Field({ icon, label, optional, error, className = "", children }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tile text-brand ring-1 ring-line-strong">
          <Icon icon={icon} className="text-[15px]" />
        </span>
        <span className="text-base font-bold text-fg">
          {label}
          {optional && <span className="ms-1.5 text-sm font-normal text-fg-muted">{optional}</span>}
        </span>
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-danger-fg">
          {error}
        </span>
      )}
    </label>
  );
}

interface SectionTitleProps {
  icon: ReactNode;
  title: string;
}

function SectionTitle({ icon, title }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-on-brand shadow-[0_0_16px_-4px_rgba(250,126,2,0.7)]">
        {icon}
      </span>
      <p className="text-base font-bold leading-snug text-fg sm:text-[17px]">{title}</p>
    </div>
  );
}

interface ThankYouProps {
  name: string;
  visitAgain: VisitAgain;
}

function ThankYou({ lang, name, visitAgain }: ThankYouProps & { lang: Lang }) {
  const t = T[lang];
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  return (
    <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-on-brand shadow-[0_0_30px_-6px_rgba(250,126,2,0.8)]">
        <Icon icon={faCheck} className="text-3xl" />
      </span>
      <p className="text-2xl font-extrabold leading-snug text-fg sm:text-3xl">
        {t.greet}
        {firstName && (
          <>
            {t.nameSeparator}
            <bdi className="text-brand">{firstName}</bdi>
          </>
        )}
      </p>
      <p className="max-w-md text-base leading-relaxed text-fg-soft">{t.thanksBody}</p>
      <p className="mt-2 rounded-2xl border border-line bg-panel px-5 py-3 text-[15px] font-bold leading-relaxed text-fg">
        {t.closing[visitAgain]}
      </p>
      <p className="mt-2 text-sm font-bold text-brand">{t.team}</p>
    </section>
  );
}

export default function FeedbackForm({ lang, onLangChange, onSubmit, logoSrc }: FeedbackFormProps) {
  const t = T[lang];
  const other: Lang = lang === "ar" ? "en" : "ar";
  const [hoverStar, setHoverStar] = useState(0);
  const [hoverRating, setHoverRating] = useState<{ key: CategoryKey; value: number } | null>(null);
  const [reaction, setReaction] = useState<{ kind: "yes" | "no"; id: number } | null>(null);
  const [thanks, setThanks] = useState<ThankYouProps | null>(null);

  useEffect(() => {
    if (!reaction) return;
    const timer = window.setTimeout(() => setReaction(null), REACTION_MS);
    return () => window.clearTimeout(timer);
  }, [reaction]);

  const showReaction = (answer: string) => {
    setReaction((prev) =>
      answer === "yes" || answer === "no" ? { kind: answer, id: (prev?.id ?? 0) + 1 } : null,
    );
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful, submitCount },
  } = useForm<FeedbackFormValues>({
    mode: "onSubmit",
    defaultValues: {
      fullName: "",
      phone: "",
      birthday: "",
      ratings: {
        beverages: "",
        food: "",
        service: "",
        cleanliness: "",
        ambience: "",
        speed: "",
        value: "",
      },
      liked: "",
      suggestions: "",
      overall: 0,
      visitAgain: "",
    },
  });

  const onValid: SubmitHandler<FeedbackFormValues> = async (values) => {
    const payload: FeedbackPayload = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      birthday: values.birthday || null,
      ratings: {
        beverages: Number(values.ratings.beverages),
        food: Number(values.ratings.food),
        service: Number(values.ratings.service),
        cleanliness: Number(values.ratings.cleanliness),
        ambience: Number(values.ratings.ambience),
        speed: Number(values.ratings.speed),
        value: Number(values.ratings.value),
      },
      liked: values.liked.trim(),
      suggestions: values.suggestions.trim(),
      overall: values.overall,
      visitAgain: values.visitAgain as VisitAgain,
    };
    if (onSubmit) {
      await onSubmit(payload);
    }
    // Personalise the thank-you from what was just saved; fall back to the form if storage is unavailable.
    const saved = latestFeedback();
    setThanks({
      name: saved?.fullName ?? payload.fullName,
      visitAgain: saved?.visitAgain ?? payload.visitAgain,
    });
  };

  const ratings = useWatch({ control, name: "ratings" });

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <main
      dir={DIR[lang]}
      lang={lang}
      className="min-h-dvh bg-page bg-[radial-gradient(circle_at_15%_0%,rgba(250,126,2,0.16)_0,transparent_40%),radial-gradient(circle_at_90%_100%,rgba(250,126,2,0.10)_0,transparent_45%)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-4 sm:py-12"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="brand-pattern pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl sm:rounded-[28px] bg-surface shadow-[0_30px_80px_-30px_rgba(250,126,2,0.35)] ring-1 ring-line-soft">
        <header className="relative overflow-hidden bg-gradient-to-b from-header to-surface px-5 pb-6 pt-6 sm:px-10 sm:pt-8">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute end-3 top-3 z-10 flex gap-2 sm:end-4 sm:top-4">
            {onLangChange && (
              <button
                type="button"
                lang={other}
                onClick={() => onLangChange(other)}
                aria-label={t.switchLangLabel}
                title={t.switchLangLabel}
                className={`${ROUND_BUTTON} text-sm font-extrabold`}
              >
                {t.switchLangShort}
              </button>
            )}
            <ThemeToggle lang={lang} />
          </div>
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
            <div className="text-center sm:text-start">
              <h1 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">{t.title}</h1>
              <p className="mt-3 text-base text-fg-soft">{t.subtitle}</p>
            </div>
            <div className="order-first sm:order-none">
              <FinderLogo logoSrc={logoSrc} />
            </div>
            <div className="hidden md:block">
              <LatteArt />
            </div>
          </div>
        </header>

        {isSubmitSuccessful && thanks ? (
          <ThankYou lang={lang} name={thanks.name} visitAgain={thanks.visitAgain} />
        ) : (
          <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5 px-3 pb-8 sm:space-y-6 sm:px-8">
            <section className="rounded-2xl border border-line bg-panel p-4">
              <SectionTitle icon={<Icon icon={faAddressCard} />} title={t.details} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field
                  className="sm:col-span-2 md:col-span-1"
                  icon={faUser}
                  label={t.fullName}
                  error={errors.fullName && t.fullNameError}
                >
                  <input
                    type="text"
                    dir="auto"
                    autoComplete="name"
                    maxLength={100}
                    aria-invalid={Boolean(errors.fullName)}
                    className={INPUT_CLASS}
                    {...register("fullName", { validate: (value) => value.trim().length >= 2 })}
                  />
                </Field>
                <Field
                  icon={faPhone}
                  label={t.phone}
                  error={errors.phone && t.phoneError}
                >
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+20 1X XXX XXXX"
                    aria-invalid={Boolean(errors.phone)}
                    className={`${INPUT_CLASS} rtl:text-right`}
                    {...register("phone", { validate: isValidPhone })}
                  />
                </Field>
                <Field
                  icon={faCakeCandles}
                  label={t.birthday}
                  optional={t.optional}
                  error={errors.birthday && t.birthdayError}
                >
                  <input
                    type="date"
                    dir="ltr"
                    max={TODAY}
                    autoComplete="bday"
                    aria-invalid={Boolean(errors.birthday)}
                    className={`${INPUT_CLASS} rtl:text-right`}
                    {...register("birthday", { validate: (value) => !value || value <= TODAY })}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-panel p-2 sm:p-3">
              <div className={`${GRID_COLS} gap-x-1 gap-y-1`}>
              <div className={`${ROW} mb-2 items-end px-2 pb-1 pt-2 sm:px-3`}>
                <p className={`${LABEL_CELL} mb-4 text-base font-bold leading-snug text-fg sm:mb-0 sm:text-[17px]`}>
                  {t.rateTitle}
                </p>
                {LEVELS.map((level) => (
                  <div key={level.value} className="flex flex-col items-center gap-1 text-center text-fg-muted">
                    <CupLevel level={Number(level.value)} />
                    <span className="text-sm font-bold leading-tight text-fg-soft">{level[lang]}</span>
                  </div>
                ))}
              </div>

                {CATEGORIES.map((category) => {
                  const hasError = Boolean(errors.ratings?.[category.key]);
                  const shown =
                    hoverRating?.key === category.key ? hoverRating.value : Number(ratings[category.key] || 0);
                  return (
                    <div
                      key={category.key}
                      role="radiogroup"
                      aria-label={category[lang]}
                      onPointerLeave={() => setHoverRating(null)}
                      className={`${ROW} items-center rounded-xl px-2 py-3 transition-colors sm:py-2.5 odd:bg-raised even:bg-surface hover:bg-raised-hover sm:px-3 ${
                        hasError ? "ring-1 ring-danger/60" : ""
                      }`}
                    >
                      <div className={`${LABEL_CELL} mb-1 flex items-center gap-2.5 sm:mb-0`}>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tile text-brand ring-1 ring-line-strong sm:h-8 sm:w-8">
                          {category.icon}
                        </span>
                        <p className="whitespace-nowrap text-base font-bold text-fg">{category[lang]}</p>
                      </div>
                      {LEVELS.map((level) => (
                        <label
                          key={level.value}
                          className="flex cursor-pointer justify-center py-1.5 sm:py-1"
                          onPointerEnter={(event) => {
                            if (event.pointerType === "mouse") {
                              setHoverRating({ key: category.key, value: Number(level.value) });
                            }
                          }}
                        >
                          <input
                            type="radio"
                            value={level.value}
                            aria-label={`${category[lang]} - ${level[lang]}`}
                            className="peer sr-only"
                            {...register(`ratings.${category.key}` as const, { required: true })}
                            onClick={() => {
                              // Clicking the selected bean again clears the row (radios can't do this on their own).
                              if (ratings[category.key] === level.value) {
                                setValue(`ratings.${category.key}`, "", {
                                  shouldDirty: true,
                                  shouldValidate: submitCount > 0,
                                });
                                setHoverRating(null);
                              }
                            }}
                          />
                          <span className="rounded-full transition-transform duration-150 hover:scale-110 peer-checked:scale-110 peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
                            <CoffeeBean filled={shown >= Number(level.value)} />
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 sm:gap-y-3">
              <div className="rounded-2xl border border-line bg-panel p-4 sm:row-span-2 sm:grid sm:grid-rows-subgrid">
                <SectionTitle icon={<Icon icon={faLightbulb} />} title={t.suggestions} />
                <textarea
                  rows={4}
                  dir="auto"
                  className={TEXTAREA_CLASS}
                  {...register("suggestions", { maxLength: 1000 })}
                />
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4 sm:row-span-2 sm:grid sm:grid-rows-subgrid">
                <SectionTitle icon={<Icon icon={faHeart} />} title={t.liked} />
                <textarea rows={4} dir="auto" className={TEXTAREA_CLASS} {...register("liked", { maxLength: 1000 })} />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-2xl border bg-panel p-4 ${
                  errors.visitAgain ? "border-danger/60" : "border-line"
                }`}
              >
                <SectionTitle icon={<Icon icon={faRotateLeft} />} title={t.visitAgain} />
                <div role="radiogroup" aria-label={t.visitAgain} className="mt-4 grid grid-cols-3 gap-2">
                  {VISIT_OPTIONS.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={option.value}
                        className="peer sr-only"
                        {...register("visitAgain", {
                          required: true,
                          onChange: (event) => showReaction(event.target.value),
                        })}
                      />
                      <span className="flex items-center justify-center gap-2 rounded-full border-2 border-line-strong bg-raised min-h-14 px-3 py-2 text-fg transition-all hover:border-brand/70 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-on-brand peer-checked:shadow-[0_0_20px_-6px_rgba(250,126,2,0.8)] peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
                        <span className="text-base font-bold">{option[lang]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                className={`rounded-2xl border bg-panel p-4 ${
                  errors.overall ? "border-danger/60" : "border-line"
                }`}
              >
                <SectionTitle icon={<Icon icon={faStarRegular} />} title={t.overall} />
                <Controller
                  name="overall"
                  control={control}
                  rules={{ validate: (value) => value > 0 }}
                  render={({ field }) => (
                    <div
                      role="radiogroup"
                      aria-label={t.overall}
                      className="mt-4 flex items-center justify-center gap-1 md:gap-2"
                      onPointerLeave={() => setHoverStar(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverStar || field.value) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            role="radio"
                            aria-checked={field.value === star}
                            aria-label={`${star} / 5`}
                            onPointerEnter={(event) => {
                              if (event.pointerType === "mouse") setHoverStar(star);
                            }}
                            onBlur={field.onBlur}
                            onClick={() => {
                              // Clicking the selected star again clears the rating.
                              if (field.value === star) {
                                field.onChange(0);
                                setHoverStar(0);
                              } else {
                                field.onChange(star);
                              }
                            }}
                            className="rounded-full p-1 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            <Icon
                              icon={active ? faStarSolid : faStarRegular}
                              className={`text-[34px] sm:text-[30px] md:text-[38px] ${active ? "text-brand" : "text-faint"}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </section>

            {hasErrors && (
              <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-center text-base font-semibold text-danger-fg">
                {t.required}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-brand to-brand-deep px-6 py-4 text-on-brand shadow-[0_12px_28px_-12px_rgba(250,126,2,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(250,126,2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-brand/30 border-t-on-brand" />
              ) : (
                <span className="text-lg font-bold">{t.submit}</span>
              )}
            </button>

            <footer className="flex items-center gap-4 pt-2">
              {/* Lines fade out towards the page edges in both directions. */}
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line-strong rtl:bg-gradient-to-l" />
              <p className="text-center font-bold leading-snug text-brand">{t.footer}</p>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line-strong rtl:bg-gradient-to-r" />
            </footer>
          </form>
        )}
      </div>

      {reaction && <VisitReaction key={reaction.id} lang={lang} kind={reaction.kind} onClose={() => setReaction(null)} />}
    </main>
  );
}
