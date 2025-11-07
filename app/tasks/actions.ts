"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title cannot be empty").max(500),
})

export async function createTask(title: string) {
  try {
    const validatedData = CreateTaskSchema.parse({ title })
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase.from("tasks").insert({
      title: validatedData.title,
      completed: false,
      user_id: userData.user.id,
    })

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    console.error("[v0] Error creating task:", error)
    throw error
  }
}

export async function toggleTask(taskId: string, completed: boolean) {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", taskId)
      .eq("user_id", userData.user.id)

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    console.error("[v0] Error toggling task:", error)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userData.user.id)

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    console.error("[v0] Error deleting task:", error)
    throw error
  }
}
