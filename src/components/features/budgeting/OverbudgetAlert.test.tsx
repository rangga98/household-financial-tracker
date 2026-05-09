import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OverbudgetAlert } from './OverbudgetAlert'

describe('OverbudgetAlert', () => {
  it('renders alert with category name and percentage', () => {
    render(<OverbudgetAlert categoryName="Dining Out" percentageUsed={85} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Dining Out/)).toBeInTheDocument()
    expect(screen.getByText(/85%/)).toBeInTheDocument()
  })

  it('uses destructive styling', () => {
    render(<OverbudgetAlert categoryName="Hobbies" percentageUsed={92} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('border-red-200')
  })

  it('displays warning message text', () => {
    render(<OverbudgetAlert categoryName="Groceries" percentageUsed={81} />)

    expect(
      screen.getByText(/spending is at 81% of your monthly limit/i)
    ).toBeInTheDocument()
  })
})
