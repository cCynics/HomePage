import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandBar } from './CommandBar.jsx'

describe('CommandBar', () => {
  it('navigates on Enter using resolveCommand', async () => {
    const onNavigate = vi.fn()
    render(<CommandBar onNavigate={onNavigate} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'gh{Enter}')
    expect(onNavigate).toHaveBeenCalledWith('https://github.com')
  })
  it('opens help on "?"', async () => {
    render(<CommandBar onNavigate={() => {}} />)
    await userEvent.type(screen.getByRole('textbox'), '?')
    expect(screen.getByText(/aliases/i)).toBeInTheDocument()
  })
})
