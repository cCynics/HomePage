import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorldClocksPane } from './WorldClocksPane.jsx'

describe('WorldClocksPane', () => {
  it('lists the configured cities', () => {
    render(<WorldClocksPane />)
    expect(screen.getByText('Tallinn')).toBeInTheDocument()
    expect(screen.getByText('Sydney')).toBeInTheDocument()
  })
})
