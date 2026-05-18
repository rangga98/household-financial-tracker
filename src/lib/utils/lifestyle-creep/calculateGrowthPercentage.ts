/**
 * Calculate average of an array of numbers
 * Returns 0 for empty arrays to avoid division issues
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate growth percentage between baseline and current value
 * Returns null if baseline is 0 (division by zero protection)
 * Returns value rounded to 2 decimal places for precision (SC-003)
 */
export function calculateGrowthPercentage(
  baseline: number,
  current: number
): number | null {
  if (baseline === 0) return null;
  const growth = ((current - baseline) / baseline) * 100;
  return Math.round(growth * 100) / 100; // 2 decimal precision (0.01% accuracy)
}
