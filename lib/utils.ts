import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'IDR', locale = 'en-ID') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: Date | string, locale = 'en-ID') {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(date);
}

export function toISODate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().split('T')[0];
}

export const uuid = () =>
  typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
