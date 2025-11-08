import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = body?.text

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: 'Missing "text" in request body' }), { status: 400 })
    }

    const supabase = await createClient()

    const result = await supabase.from("todos").insert([{ text }]).select()

    // supabase returns { data, error }
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message || String(result.error) }), { status: 500 })
    }

    const created = Array.isArray(result.data) ? result.data[0] : result.data

    return new Response(JSON.stringify(created), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 })
  }
}
