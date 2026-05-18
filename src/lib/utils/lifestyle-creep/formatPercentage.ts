/**
 * Format a percentage value for display
 * Handles null values (division by zero cases) gracefully
 * Adds + sign for positive values, - for negative
 * Appends % symbol
 */
export function formatPercentage(value: number | null): string {
  if (value === null) return 'N/A';

  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

/**
 * Format a percentage with color indicator for UI rendering
 * Returns object with formatted string and color class
 */
export function formatPercentageWithIndicator(value: number | null): {
  text: string;
  colorClass: string;
  isPositive: boolean | null;
} {
  if (value === null) {
    return {
      text: 'N/A',
      colorClass: 'text-gray-500',
      isPositive: null
    };
  }

  const isPositive = value > 0;
  const isZero = value === 0;

  let colorClass: string;
  if (isZero) {
    colorClass = 'text-gray-600';
  } else if (isPositive) {
    colorClass = 'text-emerald-600';
  } else {
    colorClass = 'text-rose-600';
  }

  return {
    text: formatPercentage(value),
    colorClass,
    isPositive
  };
}
