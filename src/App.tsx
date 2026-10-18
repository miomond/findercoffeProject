import FeedbackForm, { type FeedbackPayload } from "./pages/Revuew";
import logo from "./assets/finder-logo.png";
import { saveFeedback } from "./feedbackStorage";

export default function App() {
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

  return <FeedbackForm onSubmit={handleSubmit} logoSrc={logo} />;
}
