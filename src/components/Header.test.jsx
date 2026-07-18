import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Header } from './Header.jsx'

describe('Header', () => {
  const now = new Date(2026, 6, 18, 21, 47, 32)
  it('shows the clock and greeting', () => {
    render(<Header now={now} />)
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(screen.getByText('pm')).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return /good evening/i.test(content) && element?.textContent.includes('nick')
    })).toBeInTheDocument()
  })
  it('renders the banner text', () => {
    render(<Header now={now} />)
    expect(screen.getByLabelText('ghost-shell')).toBeInTheDocument()
  })
})
