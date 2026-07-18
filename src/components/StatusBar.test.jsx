import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from './StatusBar.jsx'

describe('StatusBar', () => {
  it('renders the mode and the current time', () => {
    render(<StatusBar now={new Date(2026, 6, 18, 21, 47, 32)} />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
    expect(screen.getByText(/9:47:32\s*pm/)).toBeInTheDocument()
  })
})
