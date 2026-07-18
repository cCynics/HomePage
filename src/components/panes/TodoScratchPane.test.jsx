import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoScratchPane } from './TodoScratchPane.jsx'

beforeEach(() => localStorage.clear())

describe('TodoScratchPane', () => {
  it('adds a todo on Enter and toggles it done', async () => {
    render(<TodoScratchPane />)
    await userEvent.type(screen.getByPlaceholderText(/add todo/i), 'ship it{Enter}')
    const item = screen.getByText('ship it')
    expect(item).toBeInTheDocument()
    await userEvent.click(item)
    expect(item).toHaveClass('line-through')
  })
})
