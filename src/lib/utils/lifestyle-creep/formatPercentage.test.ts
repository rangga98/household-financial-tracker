import { describe, it, expect } from 'vitest';
import { formatPercentage, formatPercentageWithIndicator } from './formatPercentage';

describe('formatPercentage', () => {
  it('should format positive values with + sign', () => {
    expect(formatPercentage(15.5)).toBe('+15.5%');
  });

  it('should format negative values with - sign', () => {
    expect(formatPercentage(-10)).toBe('-10%');
  });

  it('should format zero without sign', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('should return N/A for null values', () => {
    expect(formatPercentage(null)).toBe('N/A');
  });
});

describe('formatPercentageWithIndicator', () => {
  it('should return emerald color for positive values', () => {
    const result = formatPercentageWithIndicator(15);
    expect(result.text).toBe('+15%');
    expect(result.colorClass).toBe('text-emerald-600');
    expect(result.isPositive).toBe(true);
  });

  it('should return rose color for negative values', () => {
    const result = formatPercentageWithIndicator(-15);
    expect(result.text).toBe('-15%');
    expect(result.colorClass).toBe('text-rose-600');
    expect(result.isPositive).toBe(false);
  });

  it('should return gray color for zero', () => {
    const result = formatPercentageWithIndicator(0);
    expect(result.text).toBe('0%');
    expect(result.colorClass).toBe('text-gray-600');
    expect(result.isPositive).toBe(false);
  });

  it('should return N/A for null values', () => {
    const result = formatPercentageWithIndicator(null);
    expect(result.text).toBe('N/A');
    expect(result.colorClass).toBe('text-gray-500');
    expect(result.isPositive).toBeNull();
  });
});
