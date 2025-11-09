import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock the toast hook so components don't require provider
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}))

// Mock the server action module. The mock createTask will call a test-provided
// global callback if present so the test harness can update its local state.
jest.mock("@/app/tasks/actions", () => ({
  createTask: jest.fn((title: string) => {
    // Call back into the test harness to add the task to the in-test state
      if (globalThis.__TEST_ADD_TASK) {
      // allow the harness to synchronously add the task
      globalThis.__TEST_ADD_TASK(title)
    }
    return Promise.resolve()
  }),
}))

import { CreateTaskForm } from "@/components/CreateTaskForm"
import { TaskList } from "@/components/TaskList"
import type { Task } from "@/lib/types"

declare global {
  // helper the mocked createTask will call during tests
  var __TEST_ADD_TASK: ((title: string) => void) | undefined
}

describe("CreateTaskForm + TaskList integration", () => {
  afterEach(() => {
    // clean up the test helper by unsetting it
    globalThis.__TEST_ADD_TASK = undefined
  })

  it("adds a new task and it appears in the list", async () => {
    const initialTasks: Task[] = [
      {
        id: "1",
        title: "Existing task",
        completed: false,
        created_at: new Date(Date.now() - 1000 * 60).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60).toISOString(),
        user_id: "test-user",
      },
    ]

    function TestHarness() {
      const [tasks, setTasks] = React.useState<Task[]>(initialTasks)

      // expose a helper that the mocked createTask calls
      globalThis.__TEST_ADD_TASK = (title: string) => {
        const newTask: Task = {
          id: String(Date.now()),
          title,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: "test-user",
        }
        setTasks((s) => [newTask, ...s])
      }

      return (
        <div>
          <CreateTaskForm />
          <TaskList tasks={tasks} />
        </div>
      )
    }

    render(<TestHarness />)

    // Ensure the existing task is present
    expect(screen.getByText("Existing task")).toBeInTheDocument()

    const input = screen.getByLabelText(/Task Description/i) as HTMLInputElement
    await userEvent.type(input, "My new task")

    const addButton = screen.getByRole("button", { name: /Add Task/i })
    userEvent.click(addButton)

    // Wait for the new task to appear in the list
    await waitFor(() => {
      expect(screen.getByText("My new task")).toBeInTheDocument()
    })
  })
})
