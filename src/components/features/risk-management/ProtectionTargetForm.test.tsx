import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProtectionTargetForm } from './ProtectionTargetForm'
import type { ProtectionTarget } from '@/types/risk-management'

describe('ProtectionTargetForm', () => {
  it('renders target amount input', () => {
    render(
      <ProtectionTargetForm existingTarget={null} onSuccess={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByLabelText(/target amount/i)).toBeDefined()
  })

  it('shows validation error when amount is zero', async () => {
    render(
      <ProtectionTargetForm existingTarget={null} onSuccess={vi.fn()} onCancel={vi.fn()} />
    )
    await userEvent.click(screen.getByRole('button', { name: /save|set|confirm/i }))
    await waitFor(() => {
      expect(screen.getByText(/greater.*zero|must be.*positive|required/i)).toBeDefined()
    })
  })

  it('pre-fills existing target amount', () => {
    const existing: ProtectionTarget = { id: 'g1', householdId: 'hh-1', targetAmount: 2_000_000_000 }
    render(
      <ProtectionTargetForm existingTarget={existing} onSuccess={vi.fn()} onCancel={vi.fn()} />
    )
    const input = screen.getByLabelText(/target amount/i) as HTMLInputElement
    expect(Number(input.value)).toBe(2_000_000_000)
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ProtectionTargetForm existingTarget={null} onSuccess={vi.fn()} onCancel={onCancel} />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
