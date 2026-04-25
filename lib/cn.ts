import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely (used for conditional `dark:` / state variants). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
