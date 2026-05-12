import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 * This utility is used by shadcn-nuxt components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
