"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { success: toastSuccess, error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/login`

      const { data, error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (supabaseError) throw supabaseError

      setEmail("")
      toastSuccess("Check your inbox", "If an account exists you will receive reset instructions")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email"
      setError(msg)
      toastError("Reset failed", msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>Enter your email and we will send you instructions to reset your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset email"}
              </Button>

              <div className="text-center text-sm">
                <a href="/login" className="underline underline-offset-4 hover:text-primary">
                  Back to sign in
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
