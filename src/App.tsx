import { useEffect, useState } from "react";
import FeedbackForm, { type FeedbackPayload } from "./pages/Revuew";
import Welcome from "./pages/Welcome";
import logo from "./assets/finder-logo.png";
import { saveFeedback } from "./feedbackStorage";
import { DIR, type Lang } from "./i18n";

export default function App() {
  const [lang, setLang] = useState<Lang | null>(null);

  // Keep <html> in sync so the browser, screen readers and form controls use the right language and direction.
  useEffect(() => {
    if (!lang) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = DIR[lang];
  }, [lang]);

  const handleSubmit = async (payload: FeedbackPayload) => {
    saveFeedback(payload);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // No backend yet; the feedback is already saved in localStorage.
    }
  };

  if (!lang) {
    return <Welcome logoSrc={logo} onChoose={setLang} />;
  }
  return <FeedbackForm lang={lang} onLangChange={setLang} onSubmit={handleSubmit} logoSrc={logo} />;
}
