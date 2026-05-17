import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolicyForm } from './PolicyForm'

describe('PolicyForm', () => {
  it('renders all required fields', () => {
    render(<PolicyForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/policy name/i)).toBeDefined()
    expect(screen.getByLabelText(/insurer/i)).toBeDefined()
    expect(screen.getByLabelText(/coverage amount/i)).toBeDefined()
    expect(screen.getByLabelText(/premium amount/i)).toBeDefined()
    expect(screen.getByLabelText(/start date/i)).toBeDefined()
  })

  it('shows validation error when name is empty on submit', async () => {
    render(<PolicyForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getAllByText('Policy name is required').length).toBeGreaterThan(0)
    })
  })

  it('shows validation error when premiumAmount is empty on submit', async () => {
    render(<PolicyForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getAllByText('Premium amount must be greater than zero').length).toBeGreaterThan(0)
    })
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<PolicyForm mode="create" onSuccess={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields in edit mode', () => {
    render(
      <PolicyForm
        mode="edit"
        initialValues={{
          name: 'Jiwa AIA',
          insurer: 'AIA',
          coverageAmount: 1_000_000_000,
          premiumAmount: 2_000_000,
        }}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect((screen.getByLabelText(/policy name/i) as HTMLInputElement).value).toBe('Jiwa AIA')
    expect((screen.getByLabelText(/insurer/i) as HTMLInputElement).value).toBe('AIA')
  })
})
