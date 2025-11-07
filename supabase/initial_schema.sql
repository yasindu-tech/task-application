-- Create the tasks table with user_id foreign key to auth.users
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) on the tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own tasks
CREATE POLICY "Allow users to select their own tasks" ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT tasks with their own user_id
CREATE POLICY "Allow users to insert their own tasks" ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE tasks that belong to them
CREATE POLICY "Allow users to update their own tasks" ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE tasks that belong to them
CREATE POLICY "Allow users to delete their own tasks" ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
