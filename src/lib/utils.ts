import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function userErrorMessage(error: unknown, fallback = "Something went wrong") {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const issue = parsed.find((item) => typeof item?.message === "string");
      if (issue?.message) return issue.message;
    }
    if (typeof parsed?.message === "string") return parsed.message;
    if (typeof parsed?.error === "string") return parsed.error;
  } catch {
    // Not JSON; fall through to plain text cleanup.
  }

  if (raw.includes('"message"')) {
    const match = raw.match(/"message"\s*:\s*"([^"]+)"/);
    if (match?.[1]) return match[1];
  }

  return raw.length > 160 ? fallback : raw;
}
