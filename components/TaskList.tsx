"use client"

import React, { useMemo, useState } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { TaskItem } from "@/components/TaskItem"

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [sortMode, setSortMode] = useState<"incomplete-first" | "complete-first">("incomplete-first")

  const sorted = useMemo(() => {
    const copy = [...tasks]
    // group by completed then sort by created_at desc within each group
    copy.sort((a, b) => {
      if (a.completed === b.completed) {
        // newer first
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      // when incomplete-first, false (incomplete) should come before true
      if (sortMode === "incomplete-first") {
        return Number(a.completed) - Number(b.completed)
      }
      // complete-first
      return Number(b.completed) - Number(a.completed)
    })
    return copy
  }, [tasks, sortMode])

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="task-sort" className="text-sm text-neutral-700">
            Sort:
          </label>
          <select
            id="task-sort"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as "incomplete-first" | "complete-first")}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="incomplete-first">Uncompleted</option>
            <option value="complete-first">Completed</option>
          </select>
        </div>
        <div className="text-sm text-neutral-600">{sorted.length} tasks</div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-neutral-600">No tasks yet. Create one to get started!</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList
