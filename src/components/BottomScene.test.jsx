import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BottomScene } from './BottomScene.jsx'

describe('BottomScene', () => {
  it('renders a decorative, non-interactive scene', () => {
    const { container } = render(<BottomScene />)
    const root = container.firstChild
    expect(root).toHaveAttribute('aria-hidden')
    expect(root.className).toMatch(/pointer-events-none/)
  })
})
