import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

/**
 * Merge class names conditionally.
 * Usage: cn('base-class', condition && 'conditional-class', 'another-class')
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/**
 * Format a date string or Date object to a readable format.
 * Example: "Apr 17, 2026 — 10:30 AM"
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy — h:mm a')
}

/**
 * Format a date as relative time.
 * Example: "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/**
 * Format a date for display with smart "Today" / "Yesterday" prefix.
 * Example: "Today, 10:30 AM" or "Yesterday, 6:00 PM" or "Apr 15, 3:00 PM"
 */
export function formatSmartDate(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

/**
 * Format a time duration in hours to a readable string.
 * Example: 4.5 → "4.5 hrs", 0.5 → "30 min"
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${hours.toFixed(1)} hrs`
}

/**
 * Format a large number with commas.
 * Example: 4280 → "4,280"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN')
}

/**
 * Format a percentage.
 * Example: 78.4 → "78.4%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Severity color mapping (CSS variable references).
 */
export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'var(--critical)',
  HIGH: 'var(--high)',
  MEDIUM: 'var(--medium)',
  LOW: 'var(--low)',
}

/**
 * Status color mapping.
 */
export const STATUS_COLORS: Record<string, string> = {
  reported: '#EF4444',
  assigned: '#F97316',
  in_progress: '#EAB308',
  resolved: '#22C55E',
  escalated: '#A855F7',
  cancelled: '#64748B',
}

/**
 * Category emoji mapping.
 */
export const CATEGORY_ICONS: Record<string, string> = {
  roads: '🛣️',
  water_pipeline: '🚰',
  electrical: '⚡',
  sanitation: '🗑️',
  structural: '🏗️',
  traffic: '🚦',
  environment: '🌳',
}

/**
 * Source type icon mapping.
 */
export const SOURCE_ICONS: Record<string, string> = {
  car_sensor: '🚗',
  '360_capture': '📸',
  manual_complaint: '✍️',
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}
