type SheetResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
};

export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  message: string;
  featured?: boolean;
  image_url?: string;
  image_alt?: string;
  created_at: string;
};

const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;

function getAppsScriptUrl() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_")) {
    throw new Error("Google Apps Script URL ontbreekt. Zet VITE_GOOGLE_APPS_SCRIPT_URL in .env.");
  }
  return APPS_SCRIPT_URL;
}

async function appsScriptPost<T>(action: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(getAppsScriptUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, data }),
  });

  const json = (await response.json()) as SheetResponse<T>;
  if (!json.ok) {
    throw new Error(json.error || "Er ging iets mis bij het opslaan.");
  }
  return json.data as T;
}

async function appsScriptGet<T>(action: string): Promise<T> {
  const url = new URL(getAppsScriptUrl());
  url.searchParams.set("action", action);

  const response = await fetch(url.toString());
  const json = (await response.json()) as SheetResponse<T>;
  if (!json.ok) {
    throw new Error(json.error || "Kon gegevens niet laden.");
  }
  return json.data as T;
}

export function submitQuoteRequest(data: Record<string, unknown>) {
  return appsScriptPost("submitQuote", data);
}

export function submitContactMessage(data: Record<string, unknown>) {
  return appsScriptPost("submitContact", data);
}

export function submitReviewToSheet(data: Record<string, unknown>) {
  return appsScriptPost("submitReview", data);
}

export function fetchPublicReviews() {
  return appsScriptGet<PublicReview[]>("publicReviews");
}
