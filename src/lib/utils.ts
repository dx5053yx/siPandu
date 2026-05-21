import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as Rupiah */
export function rupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Generate a short unique id */
export function shortId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/** Format date to Indonesian locale */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format time to HH:mm */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Slugify a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}
