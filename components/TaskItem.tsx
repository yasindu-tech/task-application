"use client"

import type { Task } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toggleTask, deleteTask } from "@/app/tasks/actions"
import { useTransition } from "react"

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleTask(task.id, task.completed)
      } catch (error) {
        console.error("[v0] Error toggling task:", error)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id)
      } catch (error) {
        console.error("[v0] Error deleting task:", error)
      }
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50">
      <Checkbox checked={task.completed} onCheckedChange={handleToggle} disabled={isPending} className="h-5 w-5" />
      <span
        className={`flex-1 text-sm transition-all ${
          task.completed ? "line-through text-neutral-500" : "text-neutral-900"
        }`}
      >
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
