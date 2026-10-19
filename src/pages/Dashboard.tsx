import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faChartLine,
  faMagnifyingGlass,
  faUsers,
  faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import ThemeToggle, { ROUND_BUTTON } from "../components/ThemeToggle";
import { loadFeedback } from "../feedbackStorage";
import { DIR, T, type Lang } from "../i18n";

interface DashboardProps {
  lang: Lang;
  onLangChange?: (lang: Lang) => void;
  onLogout: () => void;
  logoSrc?: string;
}

interface SearchValues {
  query: string;
}

const TH = "whitespace-nowrap px-3 py-3 text-start text-sm font-extrabold text-fg";
const TD = "px-3 py-3 align-top text-sm text-fg-soft";

function Stars({ value }: { value: number }) {
  if (!value) return <span className="text-faint">—</span>;
  return (
    <span className="inline-flex gap-0.5 text-brand" dir="ltr" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FontAwesomeIcon key={n} icon={n <= value ? faStarSolid : faStarRegular} className="text-[13px]" />
      ))}
    </span>
  );
}

interface StatCardProps {
  icon: typeof faUsers;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-on-brand shadow-[0_0_16px_-4px_rgba(250,126,2,0.7)]">
        <FontAwesomeIcon icon={icon} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-fg-muted">{label}</p>
        <p className="text-2xl font-extrabold text-fg">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ lang, onLangChange, onLogout, logoSrc }: DashboardProps) {
  const t = T[lang];
  const navigate = useNavigate();
  const other: Lang = lang === "ar" ? "en" : "ar";

  // Reads the same localStorage list that the feedback form writes to.
  const rows = useMemo(() => loadFeedback().slice().reverse(), []);

  const { register, control } = useForm<SearchValues>({ defaultValues: { query: "" } });
  const query = useWatch({ control, name: "query" }).trim().toLowerCase();

  const filtered = rows.filter(
    (row) => !query || row.fullName.toLowerCase().includes(query) || row.phone.toLowerCase().includes(query),
  );

  const rated = rows.filter((row) => row.overall > 0);
  const average = rated.length ? (rated.reduce((sum, row) => sum + row.overall, 0) / rated.length).toFixed(1) : t.empty;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main
      dir={DIR[lang]}
      lang={lang}
      className="min-h-dvh bg-page bg-[radial-gradient(circle_at_15%_0%,rgba(250,126,2,0.16)_0,transparent_40%),radial-gradient(circle_at_90%_100%,rgba(250,126,2,0.10)_0,transparent_45%)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-4 sm:py-12"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="brand-pattern pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="screen-in relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-surface shadow-[0_30px_80px_-30px_rgba(250,126,2,0.35)] ring-1 ring-line-soft sm:rounded-[28px]">
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
                className={`${ROUND_BUTTON} text-sm font-extrabold hover:cursor-pointer`}
              >
                {t.switchLangShort}
              </button>
            )}
            <ThemeToggle lang={lang} />
            <button
              type="button"
              onClick={onLogout}
              aria-label={t.logout}
              title={t.logout}
              className={`${ROUND_BUTTON} hover:cursor-pointer`}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-lg" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
            <div className="text-center sm:text-start">
              <h1 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">{t.dashTitle}</h1>
              <p className="mt-3 text-base text-fg-soft">{t.dashSubtitle}</p>
            </div>
            {logoSrc && (
              <img src={logoSrc} alt="finder CAFE" className="logo-glow order-first h-24 w-auto object-contain sm:order-none sm:h-28" />
            )}
          </div>
        </header>

        <div className="space-y-5 px-3 pb-8 sm:px-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <StatCard icon={faUsers} label={t.totalSubmissions} value={String(rows.length)} />
            <StatCard icon={faChartLine} label={t.avgOverall} value={average} />
          </section>

          <section className="rounded-2xl border border-line bg-panel p-3 sm:p-4">
            <label className="relative block">
              <span className="sr-only">{t.search}</span>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-brand"
                aria-hidden="true"
              />
              <input
                type="search"
                dir="auto"
                placeholder={t.search}
                className="block h-12 w-full min-w-0 appearance-none rounded-xl border border-line bg-field ps-10 pe-3 text-base text-fg outline-none transition placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/30"
                {...register("query")}
              />
            </label>

            <div className="mt-4 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[960px] border-collapse">
                <thead className="bg-tile">
                  <tr>
                    <th scope="col" className={TH}>{t.colNo}</th>
                    <th scope="col" className={TH}>{t.colDate}</th>
                    <th scope="col" className={TH}>{t.colName}</th>
                    <th scope="col" className={TH}>{t.colTable}</th>
                    <th scope="col" className={TH}>{t.colPhone}</th>
                    <th scope="col" className={TH}>{t.colBirthday}</th>
                    <th scope="col" className={TH}>{t.colOverall}</th>
                    {Object.entries(t.categoryLabels).map(([key, label]) => (
                      <th key={key} scope="col" className={TH}>{label}</th>
                    ))}
                    <th scope="col" className={TH}>{t.colVisit}</th>
                    <th scope="col" className={TH}>{t.colLiked}</th>
                    <th scope="col" className={TH}>{t.colSuggestions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="px-3 py-10 text-center text-base font-bold text-fg-muted">
                        {t.noData}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, i) => (
                      <tr key={row.submittedAt + i} tabIndex={0} onClick={() => navigate(`/review/${encodeURIComponent(row.submittedAt)}`)} onKeyDown={(e) => { if (e.key === "Enter") navigate(`/review/${encodeURIComponent(row.submittedAt)}`); }} className="transition-colors odd:bg-raised even:bg-surface hover:cursor-pointer hover:bg-raised-hover">
                        <td className={TD}>{filtered.length - i}</td>
                        <td className={`${TD} whitespace-nowrap`}>{formatDate(row.submittedAt)}</td>
                        <td className={`${TD} font-bold text-fg`}>{row.fullName || t.empty}</td>
                        <td className={`${TD} whitespace-nowrap`} dir="ltr">{row.tableNumber || t.empty}</td>
                        <td className={`${TD} whitespace-nowrap`} dir="ltr">{row.phone || t.empty}</td>
                        <td className={`${TD} whitespace-nowrap`} dir="ltr">{row.birthday || t.empty}</td>
                        <td className={TD}><Stars value={row.overall} /></td>
                        {Object.keys(t.categoryLabels).map((key) => (
                          <td key={key} className={TD}>
                            {row.ratings?.[key as keyof typeof row.ratings] || t.empty}
                          </td>
                        ))}
                        <td className={TD}>{row.visitAgain ? t.visitLabels[row.visitAgain] : t.empty}</td>
                        <td className={`${TD} min-w-48`} dir="auto">{row.liked || t.empty}</td>
                        <td className={`${TD} min-w-48`} dir="auto">{row.suggestions || t.empty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
