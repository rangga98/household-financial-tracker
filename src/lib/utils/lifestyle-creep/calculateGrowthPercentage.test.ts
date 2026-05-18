import { describe, it, expect } from 'vitest';
import { calculateGrowthPercentage, calculateAverage } from './calculateGrowthPercentage';

describe('calculateAverage', () => {
  it('should calculate average of positive numbers', () => {
    expect(calculateAverage([10, 20, 30])).toBe(20);
  });

  it('should calculate average of negative numbers', () => {
    expect(calculateAverage([-10, -20, -30])).toBe(-20);
  });

  it('should calculate average with mixed positive and negative', () => {
    expect(calculateAverage([-10, 0, 10])).toBe(0);
  });

  it('should return 0 for empty array', () => {
    expect(calculateAverage([])).toBe(0);
  });

  it('should handle single value', () => {
    expect(calculateAverage([42])).toBe(42);
  });

  it('should handle decimal values', () => {
    expect(calculateAverage([10.5, 20.5, 30.5])).toBe(20.5);
  });
});

describe('calculateGrowthPercentage', () => {
  it('should calculate positive growth', () => {
    expect(calculateGrowthPercentage(100, 150)).toBe(50);
  });

  it('should calculate negative growth (decline)', () => {
    expect(calculateGrowthPercentage(100, 75)).toBe(-25);
  });

  it('should return null for zero baseline (division by zero)', () => {
    expect(calculateGrowthPercentage(0, 100)).toBeNull();
  });

  it('should handle zero growth', () => {
    expect(calculateGrowthPercentage(100, 100)).toBe(0);
  });

  it('should be precise to 0.01%', () => {
    const result = calculateGrowthPercentage(1000, 1234.56);
    expect(result).toBeCloseTo(23.456, 2);
  });

  it('should handle very small numbers', () => {
    expect(calculateGrowthPercentage(0.01, 0.02)).toBe(100);
  });

  it('should handle large numbers', () => {
    expect(calculateGrowthPercentage(1000000, 1500000)).toBe(50);
  });

  it('should round to 2 decimal places', () => {
    const result = calculateGrowthPercentage(100, 133.333333);
    expect(result).toBe(33.33);
  });

  it('should return null when baseline is exactly zero', () => {
    expect(calculateGrowthPercentage(0, 0)).toBeNull();
  });

  it('should calculate growth when current is zero', () => {
    expect(calculateGrowthPercentage(100, 0)).toBe(-100);
  });
});
