"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
// import { Button } from "@/components/ui/button" // Commented out as we are replacing it with native button
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Commented out as we are replacing it with native div
// import { Input } from "@/components/ui/input" // Commented out as we are replacing it with native input
// import { Label } from "@/components/ui/label" // Commented out as we are replacing it with native label

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/tasks`,
          },
        })
        if (error) throw error

        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setError(null)
        alert("Sign up successful! Please check your email to confirm your account.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        router.push("/tasks")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-sm">
        <div className="rounded border bg-white p-6 shadow">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p className="text-sm text-muted-foreground">{isSignUp ? "Create a new account to get started" : "Sign in to your account"}</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              {isSignUp && (
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Sign Up" : "Sign In"}
              </button>
              <div className="text-center text-sm">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </form>
        </div>
      </div>
    </div>
  )
}
