export interface Task {
  id: string
  created_at: string
  updated_at: string
  title: string
  completed: boolean
  user_id: string
}

export interface SignUpForm {
  email: string
  password: string
  confirmPassword: string
}

export interface SignInForm {
  email: string
  password: string
}
