"use client"

import type React from "react"

import { useState } from "react"
import { createTask } from "@/app/tasks/actions"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/toast"

export function CreateTaskForm() {
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { success: toastSuccess, error: toastError } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Task title cannot be empty")
      return
    }

    startTransition(async () => {
      try {
        await createTask(title.trim())
        setTitle("")
        toastSuccess("Task created", "Your task was added")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create task"
        setError(message)
        console.error("[v0] Error creating task:", error)
        toastError("Task create failed", message)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="taskTitle">Task Description</Label>
            <Input
              id="taskTitle"
              placeholder="Enter a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {isPending ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

