export function validateCategoryName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Category name is required' }
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Category name must be 100 characters or less' }
  }
  return { valid: true }
}

export function validateCategoryType(type: string): { valid: boolean; error?: string } {
  if (!type || !['fixed', 'variable'].includes(type)) {
    return { valid: false, error: 'Category type must be Fixed or Variable' }
  }
  return { valid: true }
}

export function validateIconName(icon: string): { valid: boolean; error?: string } {
  if (!icon || icon.trim().length === 0) {
    return { valid: false, error: 'Icon is required' }
  }
  if (icon.trim().length > 50) {
    return { valid: false, error: 'Icon name must be 50 characters or less' }
  }
  return { valid: true }
}
