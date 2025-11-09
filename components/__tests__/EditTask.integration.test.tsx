import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import '@testing-library/jest-dom'

import { TaskItem } from "@/components/TaskItem"

// Prepare jest mocks for actions and toast
const mockSuccess = jest.fn()
const mockError = jest.fn()

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: mockSuccess, error: mockError }),
}))

const updateTaskMock = jest.fn()

jest.mock("@/app/tasks/actions", () => ({
  updateTask: (...args: any[]) => updateTaskMock(...args),
  toggleTask: jest.fn(() => Promise.resolve()),
  deleteTask: jest.fn(() => Promise.resolve()),
}))

import { updateTask } from "@/app/tasks/actions"
import { TaskCompletedError } from "@/lib/exceptions"

describe("Task edit integration", () => {
  const baseTask = {
    id: "task-edit-1",
    title: "Original title",
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-1",
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("edits a task title successfully and shows success toast", async () => {
    // Arrange: make updateTask resolve
    updateTaskMock.mockResolvedValueOnce(undefined)

    const user = userEvent.setup()
    render(<TaskItem task={{ ...baseTask }} />)

    // open edit mode
    const editButton = screen.getByRole("button", { name: /Edit task/i })
    await user.click(editButton)

    const input = screen.getByDisplayValue("Original title") as HTMLInputElement
    await user.clear(input)
    await user.type(input, "Updated title")

    const save = screen.getByRole("button", { name: /Save/i })
    await user.click(save)

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith(baseTask.id, "Updated title")
      expect(mockSuccess).toHaveBeenCalled()
    })
  })

  it("shows error toast when server rejects with TaskCompletedError", async () => {
    // Arrange: make updateTask reject with TaskCompletedError
    updateTaskMock.mockRejectedValueOnce(new TaskCompletedError())

    const user = userEvent.setup()
    render(<TaskItem task={{ ...baseTask }} />)

    // open edit mode
    const editButton = screen.getByRole("button", { name: /Edit task/i })
    await user.click(editButton)

    const input = screen.getByDisplayValue("Original title") as HTMLInputElement
    await user.clear(input)
    await user.type(input, "Updated title")

    const save = screen.getByRole("button", { name: /Save/i })
    await user.click(save)

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith(baseTask.id, "Updated title")
      expect(mockError).toHaveBeenCalledWith("Cannot edit", expect.any(String))
    })
  })
})
