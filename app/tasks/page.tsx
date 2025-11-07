import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskItem } from "@/components/TaskItem"
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
          <CreateTaskForm />

          <Card>
            <CardHeader>
              <CardTitle>Tasks ({taskList.filter((t) => !t.completed).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {taskList.length === 0 ? (
                <p className="text-center text-neutral-600">No tasks yet. Create one to get started!</p>
              ) : (
                <div className="space-y-3">
                  {taskList.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
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
