import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'


jest.mock('@/app/tasks/actions', () => ({
  toggleTask: jest.fn(() => Promise.resolve()),
  deleteTask: jest.fn(() => Promise.resolve()),
  updateTask: jest.fn(() => Promise.resolve()),
}))

// Mock toast so TaskItem can call useToast without a provider
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}))

import { TaskItem } from '@/components/TaskItem'
import { toggleTask } from '@/app/tasks/actions'

describe('TaskItem (adapted from TodoItem spec)', () => {
  const baseTask = {
    id: 'task-1',
    title: 'Buy milk',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-1',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('displays the provided text', () => {
    render(<TaskItem task={{ ...baseTask, title: 'Buy milk' }} />)

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('checkbox reflects the `completed` state when false', () => {
    render(<TaskItem task={{ ...baseTask, completed: false }} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox).not.toBeChecked()
  })

  it('checkbox reflects the `completed` state when true', () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox).toBeChecked()
  })

  it('calls toggleTask once when the checkbox is clicked', async () => {
    const user = userEvent.setup()

    render(<TaskItem task={{ ...baseTask, completed: false }} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    await waitFor(() => {
      expect(toggleTask).toHaveBeenCalledTimes(1)
    })
  })
})
