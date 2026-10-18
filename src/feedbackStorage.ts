import type { FeedbackPayload } from "./pages/Revuew";

const STORAGE_KEY = "finder-feedback";

export interface StoredFeedback extends FeedbackPayload {
  submittedAt: string;
}

export function loadFeedback(): StoredFeedback[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? (saved as StoredFeedback[]) : [];
  } catch {
    // Storage blocked (e.g. private mode) or corrupted.
    return [];
  }
}

export function saveFeedback(payload: FeedbackPayload) {
  try {
    const list = loadFeedback();
    list.push({ ...payload, submittedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage can be full or blocked; the form still completes.
  }
}

export function latestFeedback(): StoredFeedback | undefined {
  return loadFeedback().at(-1);
}
