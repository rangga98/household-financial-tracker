import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EducationCalculator } from './EducationCalculator'

const mockOnCreateFund = vi.fn()

describe('EducationCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders currentCost, inflationRate and years fields', () => {
    render(<EducationCalculator onCreateFund={mockOnCreateFund} />)

    expect(screen.getByLabelText(/current cost/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/inflation rate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/years/i)).toBeInTheDocument()
  })

  it('shows validation error when currentCost is empty', async () => {
    render(<EducationCalculator onCreateFund={mockOnCreateFund} />)

    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(screen.getByText(/current cost.*required|required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when years is less than 1', async () => {
    render(<EducationCalculator onCreateFund={mockOnCreateFund} />)

    fireEvent.change(screen.getByLabelText(/current cost/i), { target: { value: '50000000' } })
    fireEvent.change(screen.getByLabelText(/years/i), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 1 year/i)).toBeInTheDocument()
    })
  })

  it('displays computed future value after valid form submission', async () => {
    render(<EducationCalculator onCreateFund={mockOnCreateFund} />)

    fireEvent.change(screen.getByLabelText(/current cost/i), { target: { value: '50000000' } })
    fireEvent.change(screen.getByLabelText(/inflation rate/i), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText(/years/i), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(screen.getByText(/81\.\d{3}\.7|81,444,731|81 juta/i)).toBeInTheDocument()
    })
  })

  it('shows Create Fund button after calculation', async () => {
    render(<EducationCalculator onCreateFund={mockOnCreateFund} />)

    fireEvent.change(screen.getByLabelText(/current cost/i), { target: { value: '50000000' } })
    fireEvent.change(screen.getByLabelText(/inflation rate/i), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText(/years/i), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create fund/i })).toBeInTheDocument()
    })
  })

  it('calls onCreateFund with the computed futureValue when Create Fund is clicked', async () => {
    render(<EducationCalculator onCreateFund={mockOnCreateFund} />)

    fireEvent.change(screen.getByLabelText(/current cost/i), { target: { value: '50000000' } })
    fireEvent.change(screen.getByLabelText(/inflation rate/i), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText(/years/i), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create fund/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))

    expect(mockOnCreateFund).toHaveBeenCalledWith(expect.any(Number))
    const calledWith = (mockOnCreateFund.mock.calls[0] as number[])[0]
    expect(calledWith).toBeCloseTo(81_444_731.34, 0)
  })
})
