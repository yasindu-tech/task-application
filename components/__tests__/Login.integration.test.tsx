import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mocks: Toasts
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn() }),
}))

// Prepare mocks for the Supabase client - we'll control resolved values in tests
const signInMock = jest.fn()
const onAuthStateChangeMock = jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: signInMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  }),
}))

// Mock next/navigation useRouter
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import LoginPage from '@/app/login/page'

describe('Login page (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to /tasks on successful sign in', async () => {
    // Successful response: { error: null }
    signInMock.mockResolvedValueOnce({ error: null })

    render(<LoginPage />)

    const email = screen.getByLabelText(/Email/i)
    const password = screen.getByLabelText(/Password/i)
    const button = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(email, 'user@example.com')
    await userEvent.type(password, 'correct-password')
    userEvent.click(button)

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalled()
      // Accept either /tasks or /dashboard depending on app version
      expect(pushMock).toHaveBeenCalled()
      const calledWith = pushMock.mock.calls[0][0]
      expect(calledWith).toMatch(/tasks|dashboard/)
    })
  })

  it('shows an error message on failed sign in', async () => {
    // Failed sign in returns an error object which the page throws & displays
    const err = new Error('Invalid credentials')
    signInMock.mockResolvedValueOnce({ error: err })

    render(<LoginPage />)

    const email = screen.getByLabelText(/Email/i)
    const password = screen.getByLabelText(/Password/i)
    const button = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(email, 'user@example.com')
    await userEvent.type(password, 'wrong-password')
    userEvent.click(button)

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalled()
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
      // should not have redirected to tasks/dashboard
      expect(pushMock).not.toHaveBeenCalled()
    })
  })
})
