import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Lang } from "@/i18n/ui"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOCALE_TAG: Record<Lang, string> = { fr: "fr-FR", en: "en-US" };

export function formatDate(date: string, lang: Lang = "fr", opts?: Intl.DateTimeFormatOptions) {
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  return new Date(date).toLocaleDateString(LOCALE_TAG[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  });
}
