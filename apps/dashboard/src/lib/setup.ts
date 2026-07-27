/**
 * Client-side setup progress for day-0 dashboard.
 * Real server-side keys/sites come later; this keeps the UX honest and sticky.
 */

export const PROD_API_URL = "https://api-production-cc4e.up.railway.app";
export const LOCAL_API_URL = "http://127.0.0.1:8000";

const KEYS = {
  apiKey: "gryphon.setup.apiKey",
  apiUrl: "gryphon.setup.apiUrl",
  installDone: "gryphon.setup.installDone",
  siteDone: "gryphon.setup.siteDone",
} as const;

export type SetupState = {
  apiKey: string;
  apiUrl: string;
  installDone: boolean;
  siteDone: boolean;
};

export type SetupStepId = "key" | "install" | "site";

export function readSetupState(): SetupState {
  if (typeof window === "undefined") {
    return {
      apiKey: "",
      apiUrl: PROD_API_URL,
      installDone: false,
      siteDone: false,
    };
  }
  return {
    apiKey: localStorage.getItem(KEYS.apiKey) ?? "",
    apiUrl: localStorage.getItem(KEYS.apiUrl) ?? PROD_API_URL,
    installDone: localStorage.getItem(KEYS.installDone) === "1",
    siteDone: localStorage.getItem(KEYS.siteDone) === "1",
  };
}

function notifySetupChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gryphon-setup-changed"));
  }
}

export function writeApiKey(value: string) {
  localStorage.setItem(KEYS.apiKey, value.trim());
  notifySetupChanged();
}

export function writeApiUrl(value: string) {
  localStorage.setItem(KEYS.apiUrl, value.trim() || PROD_API_URL);
  notifySetupChanged();
}

export function writeInstallDone(done: boolean) {
  localStorage.setItem(KEYS.installDone, done ? "1" : "0");
  notifySetupChanged();
}

export function writeSiteDone(done: boolean) {
  localStorage.setItem(KEYS.siteDone, done ? "1" : "0");
  notifySetupChanged();
}

export function clearSetupState() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  notifySetupChanged();
}

export function hasApiKey(state: SetupState): boolean {
  return state.apiKey.trim().length >= 8;
}

export function currentStep(state: SetupState): SetupStepId | "done" {
  if (!hasApiKey(state)) return "key";
  if (!state.installDone) return "install";
  if (!state.siteDone) return "site";
  return "done";
}

export function setupProgress(state: SetupState): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = 3;
  let completed = 0;
  if (hasApiKey(state)) completed += 1;
  if (state.installDone) completed += 1;
  if (state.siteDone) completed += 1;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}
