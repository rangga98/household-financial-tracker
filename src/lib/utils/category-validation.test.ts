import { describe, it, expect } from 'vitest'
import {
  validateCategoryName,
  validateCategoryType,
  validateIconName,
} from '@/lib/utils/category-validation'

describe('validateCategoryName', () => {
  it('returns valid for a normal name', () => {
    const result = validateCategoryName('Groceries')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns error for empty string', () => {
    const result = validateCategoryName('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Category name is required')
  })

  it('returns error for whitespace-only string', () => {
    const result = validateCategoryName('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Category name is required')
  })

  it('returns error for name exceeding 100 characters', () => {
    const longName = 'a'.repeat(101)
    const result = validateCategoryName(longName)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Category name must be 100 characters or less')
  })

  it('returns valid for name at exactly 100 characters', () => {
    const exactName = 'a'.repeat(100)
    const result = validateCategoryName(exactName)
    expect(result.valid).toBe(true)
  })

  it('trims whitespace before validating length', () => {
    const result = validateCategoryName('  Groceries  ')
    expect(result.valid).toBe(true)
  })
})

describe('validateCategoryType', () => {
  it('returns valid for fixed', () => {
    const result = validateCategoryType('fixed')
    expect(result.valid).toBe(true)
  })

  it('returns valid for variable', () => {
    const result = validateCategoryType('variable')
    expect(result.valid).toBe(true)
  })

  it('returns error for invalid type', () => {
    const result = validateCategoryType('invalid')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Category type must be Fixed or Variable')
  })

  it('returns error for empty string', () => {
    const result = validateCategoryType('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Category type must be Fixed or Variable')
  })
})

describe('validateIconName', () => {
  it('returns valid for a normal icon name', () => {
    const result = validateIconName('shopping-cart')
    expect(result.valid).toBe(true)
  })

  it('returns error for empty string', () => {
    const result = validateIconName('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Icon is required')
  })

  it('returns error for whitespace-only string', () => {
    const result = validateIconName('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Icon is required')
  })

  it('returns error for icon name exceeding 50 characters', () => {
    const longIcon = 'a'.repeat(51)
    const result = validateIconName(longIcon)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Icon name must be 50 characters or less')
  })

  it('returns valid for icon name at exactly 50 characters', () => {
    const exactIcon = 'a'.repeat(50)
    const result = validateIconName(exactIcon)
    expect(result.valid).toBe(true)
  })
})
