import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import FeedbackForm, { type FeedbackPayload } from "./pages/Revuew";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReviewDetails from "./pages/ReviewDetails";
import logo from "./assets/finder-logo.png";
import { saveFeedback } from "./feedbackStorage";
import { isLoggedIn, setLoggedIn } from "./auth";
import { DIR, type Lang } from "./i18n";

export default function App() {
  const [lang, setLangState] = useState<Lang | null>(() => {
    const saved = localStorage.getItem("finder-lang");
    return saved === "ar" || saved === "en" ? saved : null;
  });
  const setLang = (next: Lang) => {
    localStorage.setItem("finder-lang", next);
    setLangState(next);
  };
  const navigate = useNavigate();

  // Keep <html> in sync so the browser, screen readers and form controls use the right language and direction.
  useEffect(() => {
    const active = lang ?? "en";
    document.documentElement.lang = active;
    document.documentElement.dir = DIR[active];
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          lang ? (
            <FeedbackForm lang={lang} onLangChange={setLang} onSubmit={handleSubmit} logoSrc={logo} />
          ) : (
            <Welcome logoSrc={logo} onChoose={setLang} />
          )
        }
      />
      <Route
        path="/login"
        element={
          isLoggedIn() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              lang={lang ?? "en"}
              onLangChange={setLang}
              logoSrc={logo}
              onBack={() => navigate("/")}
              onSuccess={() => {
                setLoggedIn(true);
                navigate("/dashboard", { replace: true });
              }}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isLoggedIn() ? (
            <Dashboard
              lang={lang ?? "en"}
              onLangChange={setLang}
              logoSrc={logo}
              onLogout={() => {
                setLoggedIn(false);
                navigate("/login", { replace: true });
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/review/:id"
        element={
          isLoggedIn() ? (
            <ReviewDetails lang={lang ?? "en"} logoSrc={logo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
