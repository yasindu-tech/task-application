"use server"

import { createClient } from "@/lib/supabase/server"
import { UnauthorizedError, TaskCompletedError } from "@/lib/exceptions"
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
      throw new UnauthorizedError()
    }

    const { error } = await supabase.from("tasks").insert({
      title: validatedData.title,
      completed: false,
      user_id: userData.user.id,
    })

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Error creating task: ${msg}`)
    throw error
  }
}

export async function toggleTask(taskId: string, completed: boolean) {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new UnauthorizedError()
    }

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", taskId)
      .eq("user_id", userData.user.id)

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Error toggling task: ${msg}`)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new UnauthorizedError()
    }

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userData.user.id)

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Error deleting task: ${msg}`)
    throw error
  }
}

export async function updateTask(taskId: string, title: string) {
  try {
    const validated = CreateTaskSchema.parse({ title })
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      throw new UnauthorizedError()
    }

    // Ensure the task belongs to the user and is not completed before updating
    const { data: existingTask, error: fetchError } = await supabase
      .from("tasks")
      .select("id, completed")
      .eq("id", taskId)
      .eq("user_id", userData.user.id)
      .single()

    if (fetchError) throw fetchError
    if (existingTask?.completed) {
      throw new TaskCompletedError()
    }

    const { error } = await supabase
      .from("tasks")
      .update({ title: validated.title })
      .eq("id", taskId)
      .eq("user_id", userData.user.id)

    if (error) throw error

    revalidatePath("/tasks")
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Error updating task: ${msg}`)
    throw error
  }
}
