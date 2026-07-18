import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountUp } from './CountUp.jsx'

describe('CountUp', () => {
  it('renders the final value immediately under reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    render(<CountUp value={128} />)
    expect(screen.getByText('128')).toBeInTheDocument()
  })
})
