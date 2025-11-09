"use client"

import type React from "react"

import { useState } from "react"
import { createTask } from "@/app/tasks/actions"
import { useTransition } from "react"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function CreateTaskForm() {
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

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
        toast.success("Task created", "Your task was added")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create task"
        setError(message)
        toast.error("Create failed", message)
      }
    })
  }

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Add a new task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="What needs to be done?"
                aria-label="Task Description"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                className="bg-background"
              />
            </div>
            <Button type="submit" disabled={isPending} className="px-6">
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? "Adding..." : "Add Task"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
