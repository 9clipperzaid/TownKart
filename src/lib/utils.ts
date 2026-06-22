import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function userErrorMessage(error: unknown, fallback = "Something went wrong") {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (!raw) return fallback;

  const normalizeMessage = (message: string) => {
    if (/add a complete delivery address/i.test(message)) {
      return "Please add a complete delivery address before placing your order.";
    }
    return message;
  };

  const cleanJsonIssue = (value: unknown) => {
    if (Array.isArray(value)) {
      const issue = value.find((item) => typeof item?.message === "string");
      if (issue?.message) return normalizeMessage(issue.message);
    }
    if (value && typeof value === "object") {
      const item = value as { message?: unknown; error?: unknown };
      if (typeof item.message === "string") return normalizeMessage(item.message);
      if (typeof item.error === "string") return normalizeMessage(item.error);
    }
    return null;
  };

  try {
    const parsed = JSON.parse(raw);
    const message = cleanJsonIssue(parsed);
    if (message) return message;
  } catch {
    // Not JSON; fall through to plain text cleanup.
  }

  if (raw.includes('"message"')) {
    const match = raw.match(/"message"\s*:\s*"([^"]+)"/);
    if (match?.[1]) return normalizeMessage(match[1]);
  }

  if (/forbidden/i.test(raw)) return "You do not have permission to do that.";
  if (/failed to fetch|network/i.test(raw))
    return "Please check your internet connection and try again.";
  if (/uuid/i.test(raw)) return "Something went wrong while opening that item. Please try again.";
  if (/too_small|complete delivery address|path.*address/i.test(raw)) {
    return "Please add a complete delivery address before placing your order.";
  }

  return raw.length > 160 ? fallback : normalizeMessage(raw);
}
