import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import ThemeToggle from "../components/ThemeToggle";
import { loadFeedback } from "../feedbackStorage";
import { DIR, T, type Lang } from "../i18n";

interface ReviewDetailsProps {
  lang: Lang;
  logoSrc?: string;
}

function Stars({ value }: { value: number }) {
  if (!value) return <span className="text-faint">—</span>;
  return (
    <span className="inline-flex gap-0.5 text-brand" dir="ltr" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FontAwesomeIcon key={n} icon={n <= value ? faStarSolid : faStarRegular} />
      ))}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <p className="text-sm font-bold text-fg-muted">{label}</p>
      <div className="mt-1 text-base text-fg" dir="auto">
        {children}
      </div>
    </div>
  );
}

export default function ReviewDetails({ lang, logoSrc }: ReviewDetailsProps) {
  const t = T[lang];
  const { id } = useParams();
  const review = loadFeedback().find((r) => r.submittedAt === id);
  const back = lang === "ar" ? "العودة إلى لوحة التحكم" : "Back to dashboard";
  const notFound = lang === "ar" ? "لم يتم العثور على التقييم" : "Review not found";
  const title = lang === "ar" ? "تفاصيل التقييم" : "Review details";

  const date = review
    ? new Date(review.submittedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "";

  return (
    <main
      dir={DIR[lang]}
      lang={lang}
      className="min-h-dvh bg-page px-3 py-6 sm:px-4 sm:py-12"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="screen-in relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-surface shadow-[0_30px_80px_-30px_rgba(250,126,2,0.35)] ring-1 ring-line-soft">
        <header className="relative flex items-center justify-between gap-4 bg-gradient-to-b from-header to-surface px-5 py-6 sm:px-10">
          <div>
            <h1 className="text-3xl font-extrabold text-brand md:text-4xl">{title}</h1>
            {review && <p className="mt-2 text-fg-soft">{date}</p>}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle lang={lang} />
            {logoSrc && <img src={logoSrc} alt="finder CAFE" className="logo-glow h-16 w-auto object-contain" />}
          </div>
        </header>

        <div className="space-y-4 px-4 pb-8 sm:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 font-bold text-brand hover:underline"
          >
            <FontAwesomeIcon icon={lang === "ar" ? faArrowRight : faArrowLeft} aria-hidden="true" />
            {back}
          </Link>

          {!review ? (
            <p className="rounded-2xl border border-line bg-panel p-10 text-center text-base font-bold text-fg-muted">
              {notFound}
            </p>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <Field label={t.colName}>
                  <span className="font-bold">{review.fullName || t.empty}</span>
                </Field>
                <Field label={t.tableNumber}>
                  <span dir="ltr">{review.tableNumber || t.empty}</span>
                </Field>
                <Field label={t.colPhone}>
                  <span dir="ltr">{review.phone || t.empty}</span>
                </Field>
                <Field label={t.colBirthday}>
                  <span dir="ltr">{review.birthday || t.empty}</span>
                </Field>
                <Field label={t.colOverall}>
                  <Stars value={review.overall} />
                </Field>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                {Object.entries(t.categoryLabels).map(([key, label]) => (
                  <Field key={key} label={label}>
                    {review.ratings?.[key as keyof typeof review.ratings] || t.empty}
                  </Field>
                ))}
              </section>

              <Field label={t.colVisit}>{review.visitAgain ? t.visitLabels[review.visitAgain] : t.empty}</Field>
              <Field label={t.colLiked}>{review.liked || t.empty}</Field>
              <Field label={t.colSuggestions}>{review.suggestions || t.empty}</Field>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
