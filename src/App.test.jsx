import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App shell', () => {
  it('renders the banner and status bar', () => {
    render(<App />)
    expect(screen.getByLabelText('ghost-shell')).toBeInTheDocument()
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
  })
})
