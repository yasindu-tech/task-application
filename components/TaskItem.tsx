"use client"

import type { Task } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Edit3, X } from "lucide-react"
import { toggleTask, deleteTask, updateTask } from "@/app/tasks/actions"
import { useToast } from "@/components/ui/toast"
import { useTransition } from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const { success: toastSuccess, error: toastError } = useToast()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleTask(task.id, task.completed)
        toastSuccess("Task updated", task.completed ? "Marked open" : "Marked done")
      } catch (error) {
        console.error("[v0] Error toggling task:", error)
        toastError("Toggle failed", error instanceof Error ? error.message : String(error))
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id)
        // show a red toast for deletions (user requested delete notifications be red)
        toastError("Task deleted", "Task was removed")
      } catch (error) {
        console.error("[v0] Error deleting task:", error)
        toastError("Delete failed", error instanceof Error ? error.message : String(error))
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateTask(task.id, editTitle.trim())
        setIsEditing(false)
        toastSuccess("Task updated", "Title saved")
      } catch (error) {
        console.error("[v0] Error updating task:", error)
        toastError("Update failed", error instanceof Error ? error.message : String(error))
      }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditTitle(task.title)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50">
      <Checkbox checked={task.completed} onCheckedChange={handleToggle} disabled={isPending} className="h-5 w-5" />

      {!isEditing ? (
        <>
          <span
            className={`flex-1 text-sm transition-all ${
              task.completed ? "line-through text-neutral-500" : "text-neutral-900"
            }`}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-2">
            {!task.completed && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={isPending}>
                <Edit3 className="h-4 w-4" />
              </Button>
            )}

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
        </>
      ) : (
        <div className="flex w-full items-center gap-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1"
            disabled={task.completed}
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || editTitle.trim().length === 0 || task.completed}
          >
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isPending}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
