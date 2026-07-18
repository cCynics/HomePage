import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pane } from './Pane.jsx'

describe('Pane', () => {
  it('renders title and children when ready', () => {
    render(<Pane title="weather"><div>body</div></Pane>)
    expect(screen.getByText('weather')).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })
  it('shows a skeleton and hides children while loading', () => {
    render(<Pane title="x" loading><div>body</div></Pane>)
    expect(screen.queryByText('body')).not.toBeInTheDocument()
    expect(screen.getByTestId('pane-skeleton')).toBeInTheDocument()
  })
  it('shows unavailable on error', () => {
    render(<Pane title="x" error={new Error('e')}><div>body</div></Pane>)
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
    expect(screen.queryByText('body')).not.toBeInTheDocument()
  })
})
