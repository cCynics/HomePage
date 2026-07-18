import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LinksPane } from './LinksPane.jsx'

describe('LinksPane', () => {
  it('renders each link with an href', () => {
    render(<LinksPane />)
    const gh = screen.getByRole('link', { name: /github/i })
    expect(gh).toHaveAttribute('href', 'https://github.com')
  })
})
