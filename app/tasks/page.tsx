import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskItem } from "@/components/TaskItem"
import TaskList from "@/components/TaskList"
import { CreateTaskForm } from "@/components/CreateTaskForm"

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
    // order by completion status first (incomplete/false first), then newest first
    .order("completed", { ascending: true })
    .order("created_at", { ascending: false })

  if (tasksError) {
    console.error("[v0] Error fetching tasks:", tasksError)
  }

  const taskList: Task[] = tasks || []

  return (
    <main className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Tasks</h1>
            <p className="mt-2 text-sm text-neutral-600">Signed in as {userData.user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-6">
          {/* Dashboard summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            <Card className="h-20 flex flex-col justify-center">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-sm text-neutral-500">Total tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{taskList.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="h-20 flex flex-col justify-center">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-sm text-neutral-500">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{taskList.filter((t) => t.completed).length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="h-20 flex flex-col justify-center">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-sm text-neutral-500">Remaining</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{taskList.filter((t) => !t.completed).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <CreateTaskForm />

          <Card>
            <CardHeader>
              <CardTitle>Tasks ({taskList.filter((t) => !t.completed).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {taskList.length === 0 ? (
                <p className="text-center text-neutral-600">No tasks yet. Create one to get started!</p>
              ) : (
                <TaskList tasks={taskList} />
              )}
            </CardContent>
          </Card>
        </div>
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
      <Button variant="outline">Sign Out</Button>
    </form>
  )
}
