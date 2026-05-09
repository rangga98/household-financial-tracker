import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmergencyFundSetup } from './EmergencyFundSetup'

const mockOnSubmit = vi.fn()

describe('EmergencyFundSetup', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Initial Render', () => {
    it('should render the setup title', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      expect(screen.getByText('Setup Emergency Fund Target')).toBeDefined()
    })

    it('should render marital status options', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      expect(screen.getByText('Single')).toBeDefined()
      expect(screen.getByText('Married')).toBeDefined()
    })

    it('should render dependents options', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      expect(screen.getByText('None')).toBeDefined()
      expect(screen.getByText('1')).toBeDefined()
      expect(screen.getByText('2')).toBeDefined()
      expect(screen.getByText('3+')).toBeDefined()
    })

    it('should render monthly expense input', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      expect(screen.getByPlaceholderText('5.000.000')).toBeDefined()
    })

    it('should render submit button', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      expect(screen.getByText('🚀 Set Emergency Fund Target')).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should select Single marital status by default', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const singleButton = screen.getByText('Single').closest('button')
      expect(singleButton?.className).toContain('border-blue-500')
    })

    it('should change marital status to Married when clicked', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('Married'))
      const marriedButton = screen.getByText('Married').closest('button')
      expect(marriedButton?.className).toContain('border-pink-500')
    })

    it('should change dependents when clicked', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('2'))
      const twoButton = screen.getByText('2').closest('button')
      expect(twoButton?.className).toContain('border-green-500')
    })

    it('should accept numeric input in expense field', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })
      expect((input as HTMLInputElement).value).toBe('5000000')
    })

    it('should strip non-numeric characters from expense field', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5.000.abc' } })
      expect((input as HTMLInputElement).value).toBe('5000')
    })
  })

  describe('Target Calculation', () => {
    it('should show 6x target for single with no dependents', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })

      await waitFor(() => {
        expect(screen.getByText('Rp 30.000.000')).toBeDefined()
      })
    })

    it('should show 6x target for married with no children', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('Married'))
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '4000000' } })

      await waitFor(() => {
        expect(screen.getByText('Rp 24.000.000')).toBeDefined()
      })
    })

    it('should show 12x target for married with children', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('Married'))
      fireEvent.click(screen.getByText('2'))
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })

      await waitFor(() => {
        expect(screen.getByText('Rp 60.000.000')).toBeDefined()
      })
    })

    it('should show 6x multiplier badge for single', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })

      await waitFor(() => {
        expect(screen.getByText('6× multiplier')).toBeDefined()
      })
    })

    it('should show 12× multiplier badge for married with children', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('Married'))
      fireEvent.click(screen.getByText('2'))
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })

      await waitFor(() => {
        expect(screen.getByText('12× multiplier')).toBeDefined()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is submitted', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('Married'))
      fireEvent.click(screen.getByText('1'))
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })
      fireEvent.click(screen.getByText('🚀 Set Emergency Fund Target'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          maritalStatus: 'married',
          dependents: 1,
          monthlyLivingExpenseEstimate: 5000000,
        })
      })
    })

    it('should disable button when expense is empty', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const button = screen.getByText('🚀 Set Emergency Fund Target') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })

    it('should disable button when expense is 0', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '0' } })
      const button = screen.getByText('🚀 Set Emergency Fund Target') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })

    it('should show loading state when isLoading is true', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} isLoading={true} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })
      expect(screen.getByText('Setting up...')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '99999999999' } })

      await waitFor(() => {
        expect(screen.getByText(/Rp 599.999.999.994/)).toBeDefined()
      })
    })

    it('should show hint about static estimate', () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      expect(screen.getByText(/static estimate/)).toBeDefined()
    })

    it('should show correct description for married with children', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      fireEvent.click(screen.getByText('Married'))
      fireEvent.click(screen.getByText('2'))
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })

      await waitFor(() => {
        expect(screen.getByText('Higher target recommended for families with children')).toBeDefined()
      })
    })

    it('should show correct description for standard case', async () => {
      render(<EmergencyFundSetup onSubmit={mockOnSubmit} />)
      const input = screen.getByPlaceholderText('5.000.000')
      fireEvent.change(input, { target: { value: '5000000' } })

      await waitFor(() => {
        expect(screen.getByText('Standard 6-month emergency fund')).toBeDefined()
      })
    })
  })
})
