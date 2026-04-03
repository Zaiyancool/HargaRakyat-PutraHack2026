/**
 * Centralized formatting utilities for currency, percentages, and dates.
 * Ensures consistent formatting across all components.
 */

/**
 * Format a number as Malaysian Ringgit currency (RM X.XX)
 * @param value - The numeric value to format
 * @returns Formatted string (e.g., "RM 12.50")
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `RM ${value.toFixed(2)}`;
}

/**
 * Format a number as a percentage with +/- prefix
 * @param value - The numeric value to format (e.g., 5.3 for 5.3%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "+5.3%", "-2.1%")
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a date as a readable string
 * @param date - The date to format (Date object or timestamp)
 * @param format - Format type: 'short' (e.g., "Jan 1"), 'long' (e.g., "January 1, 2025"), 'date' (e.g., "2025-01-01")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number | null | undefined,
  format: "short" | "long" | "date" = "short"
): string {
  if (!date) return "N/A";

  const d = date instanceof Date ? date : new Date(date);

  switch (format) {
    case "short":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "long":
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    case "date":
      return d.toISOString().split("T")[0];
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format a number with commas for thousands separator
 * @param value - The numeric value to format
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("en-US");
}

/**
 * Calculate and format percentage change with color indication
 * @param current - Current value
 * @param previous - Previous value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Object with formatted percentage and direction
 */
export function formatPriceChange(
  current: number | null | undefined,
  previous: number | null | undefined,
  decimals: number = 1
): { percent: string; direction: "up" | "down" | "neutral" } {
  if (!current || !previous || previous === 0) {
    return { percent: "N/A", direction: "neutral" };
  }

  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "neutral";
  const percent = formatPercent(change, decimals);

  return { percent, direction };
}
