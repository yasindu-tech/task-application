"use client"

import type { Task } from "@/lib/types"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Edit3 } from "lucide-react"
import { toggleTask, deleteTask, updateTask } from "@/app/tasks/actions"
import { useTransition } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { TaskCompletedError } from "@/lib/exceptions"

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const toast = useToast()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleTask(task.id, task.completed)
        toast.success(task.completed ? "Marked open" : "Completed", "Task state updated")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update task"
        toast.error("Toggle failed", message)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id)
        toast.error("Task deleted", "The task was removed")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete task"
        toast.error("Delete failed", message)
      }
    })
  }

  const handleSave = () => {
    const trimmed = editTitle.trim()
    if (!trimmed) {
      toast.error("Invalid title", "Task title cannot be empty")
      return
    }

    startTransition(async () => {
      try {
        await updateTask(task.id, trimmed)
        setIsEditing(false)
        toast.success("Title saved", "Task title updated")
      } catch (error) {
        if (error instanceof TaskCompletedError) {
          toast.error("Cannot edit", "Completed tasks cannot be edited")
        } else {
          const message = error instanceof Error ? error.message : "Failed to update task"
          toast.error("Update failed", message)
        }
      }
    })
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setIsEditing(false)
  }

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200">
      <div className="flex-shrink-0">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          disabled={isPending}
          className="h-5 w-5 rounded-md"
        />
      </div>

      
      {!isEditing ? (
        <span
          className={`flex-1 text-base transition-all ${
            task.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"
          }`}
        >
          {task.title}
        </span>
      ) : (
        <div className="flex-1">
          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-background" />
        </div>
      )}

      {!task.completed && !isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Edit task"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}

      {isEditing && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={isPending} className="px-3">
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="px-3">
            Cancel
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
