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
  onSubmit?: (payload: FeedbackPayload) => Promise<void> | void;
  logoSrc?: string;
}

// Brand palette, taken from the finder CAFE logo (orange #FA7E02 on black).
const C = {
  orange: "#FA7E02",
  ink: "#0B0908",
  surface: "#151110",
  raised: "#1D1714",
  line: "#3A2D24",
  muted: "#6B5444",
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
    <span className="relative block text-xl sm:text-2xl" aria-hidden="true">
      <FontAwesomeIcon icon={faMugSaucer} className="block text-[#3A2D24]" />
      <span className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: `${level * 20}%` }}>
        <FontAwesomeIcon icon={faMugSaucer} className="absolute bottom-0 left-0 block text-[#FA7E02]" />
      </span>
    </span>
  );
}

interface CoffeeBeanProps {
  filled: boolean;
}

function CoffeeBean({ filled }: CoffeeBeanProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true">
      <g transform="rotate(-35 12 12)">
        <ellipse
          cx="12"
          cy="12"
          rx="6.5"
          ry="9.5"
          fill={filled ? C.orange : C.raised}
          stroke={filled ? C.orange : C.muted}
          strokeWidth={1.6}
        />
        <path
          d="M12 2.5c-2.6 3-2.6 6.4 0 9.5s2.6 6.5 0 9.5"
          fill="none"
          stroke={filled ? C.ink : C.muted}
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

// The label column sizes to its widest one-line category name; the five rating columns share the rest.
const GRID_COLS =
  "grid grid-cols-[min-content_repeat(5,minmax(0,1fr))] sm:grid-cols-[minmax(min-content,1.5fr)_repeat(5,minmax(0,1fr))]";

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-xl border border-[#2E241D] bg-[#120E0C] px-3 text-sm text-[#F6EEE5] outline-none transition [color-scheme:dark] placeholder:text-[#6B5444] focus:border-[#FA7E02] focus:ring-2 focus:ring-[#FA7E02]/30 aria-[invalid=true]:border-[#FF6B5A]/70";

// Latest allowed birthday (YYYY-MM-DD).
const TODAY = new Date().toISOString().slice(0, 10);

const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return /^\+?[\d\s-]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15;
};

const TEXTAREA_CLASS =
  "mt-3 w-full resize-none rounded-xl border border-[#2E241D] bg-[#120E0C] bg-[linear-gradient(transparent_31px,#2A211B_32px)] bg-[length:100%_32px] px-3 text-sm leading-8 text-[#F6EEE5] outline-none transition focus:border-[#FA7E02] focus:ring-2 focus:ring-[#FA7E02]/30";

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
  kind: "yes" | "no";
  onClose: () => void;
}

function VisitReaction({ kind, onClose }: VisitReactionProps) {
  const happy = kind === "yes";
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClose}
      className="reaction-fade fixed inset-0 z-50 grid place-items-center bg-[#0B0908]/70 px-6 backdrop-blur-sm"
    >
      <div className="reaction-pop relative flex w-full max-w-xs flex-col items-center overflow-hidden rounded-3xl border border-[#3A2D24] bg-[#151110] px-6 pb-7 pt-10 text-center shadow-[0_24px_60px_-20px_rgba(250,126,2,0.45)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {happy
            ? BUBBLES.map((bubble, i) => (
                <span
                  key={i}
                  className="bubble absolute -bottom-6 rounded-full border border-[#FA7E02]/70 bg-[#FA7E02]/15"
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
                  className="drop absolute top-0 h-3 w-1.5 rounded-full bg-[#6B5444]"
                  style={{ left: `${drop.left}%`, animationDelay: `${drop.delay}s` }}
                />
              ))}
        </div>
        <FontAwesomeIcon
          icon={happy ? faFaceGrinBeam : faFaceSadTear}
          className={`relative text-7xl ${happy ? "emoji-bounce text-[#FA7E02]" : "emoji-sad text-[#A8927F]"}`}
          aria-hidden="true"
        />
        <p className="relative mt-5 text-2xl font-extrabold text-[#F6EEE5]">
          {happy ? "شكراً لك! بانتظارك" : "يؤسفنا ذلك"}
        </p>
        <p lang="en" className="relative mt-1 text-sm text-[#A8927F]">
          {happy ? "Thank you! We can't wait to see you again" : "We're sorry to hear that. We'll do better"}
        </p>
      </div>
    </div>
  );
}

interface FinderLogoProps {
  logoSrc?: string;
}

function FinderLogo({ logoSrc }: FinderLogoProps) {
  if (logoSrc) {
    return <img src={logoSrc} alt="finder CAFE" className="logo-glow h-32 w-auto object-contain sm:h-40" />;
  }
  return (
    <div className="logo-glow flex flex-col items-center text-[#FA7E02]" aria-label="finder CAFE" dir="ltr">
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
      <ellipse cx="60" cy="104" rx="46" ry="8" fill={C.orange} opacity="0.12" />
      <circle cx="60" cy="58" r="46" fill={C.raised} />
      <circle cx="60" cy="58" r="46" fill="none" stroke={C.line} strokeWidth="2" />
      <circle cx="60" cy="58" r="36" fill="#3B2416" />
      <circle cx="60" cy="58" r="36" fill="none" stroke={C.orange} strokeWidth="2" />
      <path
        d="M60 82c-12-8-20-15-20-24a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 9-8 16-20 24Z"
        fill={C.cream}
      />
      <path d="M60 82V52" stroke="#3B2416" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="22" cy="100" rx="5" ry="3.2" fill={C.orange} transform="rotate(-30 22 100)" />
      <ellipse cx="102" cy="96" rx="5" ry="3.2" fill={C.orange} transform="rotate(25 102 96)" />
    </svg>
  );
}

interface FieldProps {
  icon: IconDefinition;
  ar: string;
  en: string;
  optional?: boolean;
  error?: { ar: string; en: string } | false;
  children: ReactNode;
}

function Field({ icon, ar, en, optional, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-[#F6EEE5]">
        <Icon icon={icon} className="text-[14px] text-[#FA7E02]" />
        {ar}
        <span lang="en" className="text-[11px] font-normal text-[#A8927F]">
          {en}
          {optional ? " (optional)" : ""}
        </span>
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-[#FF8A7A]">
          {error.ar} <span lang="en">· {error.en}</span>
        </span>
      )}
    </label>
  );
}

interface SectionTitleProps {
  icon: ReactNode;
  ar: string;
  en: string;
}

function SectionTitle({ icon, ar, en }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FA7E02] text-[#0B0908] shadow-[0_0_16px_-4px_rgba(250,126,2,0.7)]">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-bold text-[#F6EEE5]">{ar}</p>
        <p lang="en" className="text-xs text-[#A8927F]">
          {en}
        </p>
      </div>
    </div>
  );
}

export default function FeedbackForm({ onSubmit, logoSrc }: FeedbackFormProps) {
  const [hoverStar, setHoverStar] = useState(0);
  const [hoverRating, setHoverRating] = useState<{ key: CategoryKey; value: number } | null>(null);
  const [reaction, setReaction] = useState<{ kind: "yes" | "no"; id: number } | null>(null);

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
  };

  const ratings = useWatch({ control, name: "ratings" });

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <main
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-[#0B0908] bg-[radial-gradient(circle_at_15%_0%,rgba(250,126,2,0.16)_0,transparent_40%),radial-gradient(circle_at_90%_100%,rgba(250,126,2,0.10)_0,transparent_45%)] px-4 py-8 sm:py-12"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] bg-[#151110] shadow-[0_30px_80px_-30px_rgba(250,126,2,0.35)] ring-1 ring-[#2A211B]">
        <header className="relative overflow-hidden bg-gradient-to-b from-[#1F1612] to-[#151110] px-6 pb-6 pt-8 sm:px-10">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#FA7E02]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-[#FA7E02]/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-right">
              <h1 className="text-4xl font-extrabold text-[#FA7E02] sm:text-5xl">رأيك يهمنا</h1>
              <p
                lang="en"
                className="mt-1 text-sm font-semibold tracking-[0.25em] text-[#D9C7B5]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                YOUR FEEDBACK MATTERS
              </p>
              <p className="mt-3 text-sm text-[#D9C7B5]">ساعدنا نقدم لك تجربة أفضل دائماً</p>
              <p lang="en" className="text-xs text-[#A8927F]">
                Help us serve you a better experience always
              </p>
            </div>
            <FinderLogo logoSrc={logoSrc} />
            <div className="hidden sm:block">
              <LatteArt />
            </div>
          </div>
        </header>

        {isSubmitSuccessful ? (
          <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#FA7E02] text-[#0B0908] shadow-[0_0_30px_-6px_rgba(250,126,2,0.8)]">
              <Icon icon={faCheck} className="text-3xl" />
            </span>
            <p className="text-2xl font-extrabold text-[#F6EEE5]">شكراً لوقتك .. نعتز برأيك</p>
            <p lang="en" className="text-sm text-[#A8927F]">
              Thank you for your time. We value your feedback
            </p>
          </section>
        ) : (
          <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-6 px-4 pb-8 sm:px-8">
            <section className="rounded-2xl border border-[#2E241D] bg-[#1A1512] p-4">
              <SectionTitle icon={<Icon icon={faAddressCard} />} ar="بياناتك" en="Your details" />
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field
                  icon={faUser}
                  ar="الاسم الكامل"
                  en="Full name"
                  error={errors.fullName && { ar: "أدخل اسمك الكامل", en: "Enter your full name" }}
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
                  ar="رقم الجوال"
                  en="Phone number"
                  error={errors.phone && { ar: "أدخل رقم جوال صحيح", en: "Enter a valid phone number" }}
                >
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+966 5X XXX XXXX"
                    aria-invalid={Boolean(errors.phone)}
                    className={`${INPUT_CLASS} text-right`}
                    {...register("phone", { validate: isValidPhone })}
                  />
                </Field>
                <Field
                  icon={faCakeCandles}
                  ar="تاريخ الميلاد"
                  en="Birthday"
                  optional
                  error={errors.birthday && { ar: "تاريخ غير صحيح", en: "Invalid date" }}
                >
                  <input
                    type="date"
                    dir="ltr"
                    max={TODAY}
                    autoComplete="bday"
                    aria-invalid={Boolean(errors.birthday)}
                    className={`${INPUT_CLASS} text-right`}
                    {...register("birthday", { validate: (value) => !value || value <= TODAY })}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-[#2E241D] bg-[#1A1512] p-2 sm:p-3">
              <div className={`${GRID_COLS} items-end gap-x-1 px-2 pb-3 pt-2 sm:px-3`}>
                <div className="leading-tight">
                  <p className="text-[15px] font-bold text-[#F6EEE5]">من فضلك قيم تجربتك معنا</p>
                  <p lang="en" className="text-xs text-[#A8927F]">
                    Please rate your experience with us
                  </p>
                </div>
                {LEVELS.map((level) => (
                  <div key={level.value} className="flex flex-col items-center gap-1 text-center text-[#A8927F]">
                    <CupLevel level={Number(level.value)} />
                    <span className="text-[10px] font-bold leading-tight text-[#D9C7B5] sm:text-xs">
                      {level.ar}
                    </span>
                    <span lang="en" className="hidden text-[10px] leading-none sm:block">
                      {level.en}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {CATEGORIES.map((category) => {
                  const hasError = Boolean(errors.ratings?.[category.key]);
                  const shown =
                    hoverRating?.key === category.key ? hoverRating.value : Number(ratings[category.key] || 0);
                  return (
                    <div
                      key={category.key}
                      role="radiogroup"
                      aria-label={`${category.ar} - ${category.en}`}
                      onMouseLeave={() => setHoverRating(null)}
                      className={`${GRID_COLS} items-center gap-x-1 rounded-xl px-2 py-2.5 transition-colors odd:bg-[#1D1714] even:bg-[#151110] hover:bg-[#261D17] sm:px-3 ${
                        hasError ? "ring-1 ring-[#FF6B5A]/60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#241C17] text-[#FA7E02] ring-1 ring-[#3A2D24] sm:h-8 sm:w-8">
                          {category.icon}
                        </span>
                        <div className="whitespace-nowrap leading-tight">
                          <p className="text-[13px] font-bold text-[#F6EEE5] sm:text-sm">{category.ar}</p>
                          <p lang="en" className="text-[11px] text-[#A8927F]">
                            {category.en}
                          </p>
                        </div>
                      </div>
                      {LEVELS.map((level) => (
                        <label
                          key={level.value}
                          className="flex cursor-pointer justify-center py-1"
                          onMouseEnter={() => setHoverRating({ key: category.key, value: Number(level.value) })}
                        >
                          <input
                            type="radio"
                            value={level.value}
                            aria-label={`${category.en} - ${level.en}`}
                            className="peer sr-only"
                            {...register(`ratings.${category.key}` as const, { required: true })}
                          />
                          <span className="rounded-full transition-transform duration-150 hover:scale-110 peer-checked:scale-110 peer-focus-visible:ring-2 peer-focus-visible:ring-[#FA7E02] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#151110]">
                            <CoffeeBean filled={shown >= Number(level.value)} />
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#2E241D] bg-[#1A1512] p-4">
                <SectionTitle
                  icon={<Icon icon={faLightbulb} />}
                  ar="هل لديك أي اقتراحات لتحسين تجربتنا؟"
                  en="Do you have any suggestions to improve our experience?"
                />
                <textarea
                  rows={4}
                  dir="auto"
                  className={TEXTAREA_CLASS}
                  {...register("suggestions", { maxLength: 1000 })}
                />
              </div>
              <div className="rounded-2xl border border-[#2E241D] bg-[#1A1512] p-4">
                <SectionTitle icon={<Icon icon={faHeart} />} ar="ما أكثر شيء أعجبك؟" en="What did you like the most?" />
                <textarea rows={4} dir="auto" className={TEXTAREA_CLASS} {...register("liked", { maxLength: 1000 })} />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-2xl border bg-[#1A1512] p-4 ${
                  errors.visitAgain ? "border-[#FF6B5A]/60" : "border-[#2E241D]"
                }`}
              >
                <SectionTitle
                  icon={<Icon icon={faRotateLeft} />}
                  ar="هل ستزورنا مرة أخرى؟"
                  en="Will you visit us again?"
                />
                <div role="radiogroup" aria-label="Will you visit us again?" className="mt-4 grid grid-cols-3 gap-2">
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
                      <span className="flex items-center justify-center gap-2 rounded-full border-2 border-[#3A2D24] bg-[#1D1714] px-3 py-2 text-[#F6EEE5] transition-all hover:border-[#FA7E02]/70 peer-checked:border-[#FA7E02] peer-checked:bg-[#FA7E02] peer-checked:text-[#0B0908] peer-checked:shadow-[0_0_20px_-6px_rgba(250,126,2,0.8)] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FA7E02] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#151110]">
                        <span className="text-center leading-tight">
                          <span className="block text-sm font-bold">{option.ar}</span>
                          <span lang="en" className="block text-[11px] opacity-80">
                            {option.en}
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                className={`rounded-2xl border bg-[#1A1512] p-4 ${
                  errors.overall ? "border-[#FF6B5A]/60" : "border-[#2E241D]"
                }`}
              >
                <SectionTitle icon={<Icon icon={faStarRegular} />} ar="تقييمك العام" en="Overall Rating" />
                <Controller
                  name="overall"
                  control={control}
                  rules={{ validate: (value) => value > 0 }}
                  render={({ field }) => (
                    <div
                      role="radiogroup"
                      aria-label="Overall Rating"
                      className="mt-4 flex items-center justify-center gap-1.5 sm:gap-2"
                      onMouseLeave={() => setHoverStar(0)}
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
                            onMouseEnter={() => setHoverStar(star)}
                            onFocus={() => setHoverStar(star)}
                            onBlur={() => {
                              setHoverStar(0);
                              field.onBlur();
                            }}
                            onClick={() => field.onChange(star)}
                            className="rounded-full p-0.5 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#FA7E02]"
                          >
                            <Icon
                              icon={active ? faStarSolid : faStarRegular}
                              className={`text-[34px] sm:text-[38px] ${active ? "text-[#FA7E02]" : "text-[#6B5444]"}`}
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
              <p role="alert" className="rounded-xl bg-[#FF6B5A]/10 px-4 py-2.5 text-center text-sm font-semibold text-[#FF8A7A]">
                من فضلك أكمل الحقول المطلوبة
                <span lang="en" className="block text-xs font-normal">
                  Please complete the required fields
                </span>
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-[#FA7E02] to-[#E06A00] px-6 py-4 text-[#0B0908] shadow-[0_12px_28px_-12px_rgba(250,126,2,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(250,126,2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA7E02] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151110] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0B0908]/30 border-t-[#0B0908]" />
              ) : (
                <span className="text-lg font-bold">إرسال</span>
              )}
              <span lang="en" className="text-sm opacity-80">
                Submit
              </span>
            </button>

            <footer className="flex items-center gap-4 pt-2">
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#3A2D24]" />
              <div className="text-center leading-tight">
                <p className="font-bold text-[#FA7E02]">شكراً لوقتك .. نعتز برأيك</p>
                <p lang="en" className="text-xs text-[#A8927F]">
                  Thank you for your time. We value your feedback
                </p>
              </div>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#3A2D24]" />
            </footer>
          </form>
        )}
      </div>

      {reaction && <VisitReaction key={reaction.id} kind={reaction.kind} onClose={() => setReaction(null)} />}
    </main>
  );
}
