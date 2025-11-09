import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { TaskItem } from "@/components/TaskItem"
import { CreateTaskForm } from "@/components/CreateTaskForm"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Zap } from "lucide-react"

export default async function TasksPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/login")
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("completed", { ascending: true })
    .order("created_at", { ascending: false })

  const fetchError = tasksError ? String(tasksError.message || tasksError) : null

  const taskList: Task[] = tasks || []
  const completedCount = taskList.filter((t) => t.completed).length
  const pendingCount = taskList.filter((t) => !t.completed).length
  const completionRate = taskList.length > 0 ? Math.round((completedCount / taskList.length) * 100) : 0

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Tasks</h1>
              <p className="mt-1 text-sm text-muted-foreground">{userData.user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Tasks</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{taskList.length}</p>
              </div>
              <Zap className="h-8 w-8 text-primary/20" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{completedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/20" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progress</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{completionRate}%</p>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {completionRate}
              </div>
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        <CreateTaskForm />

        {/* Tasks Section */}
        <div className="mt-8">
          {fetchError && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              There was a problem loading your tasks: {fetchError}
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Active Tasks</h2>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {pendingCount} pending
                </Badge>
              )}
            </div>
          </div>

          {taskList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
              <Circle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-foreground">No tasks yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create one above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {taskList
                .filter((t) => !t.completed)
                .map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
            </div>
          )}
        </div>

        {/* Completed Tasks Section */}
        {completedCount > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Completed ({completedCount})</h2>
            <div className="space-y-3">
              {taskList
                .filter((t) => t.completed)
                .map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect("/login")
      }}
    >
      <Button variant="outline" size="sm">
        Sign Out
      </Button>
    </form>
  )
}
