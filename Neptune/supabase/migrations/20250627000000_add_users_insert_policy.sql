-- Add missing insert policy for users table
-- This allows users to create their own user record during first-time login

create policy "users: Self-insert"
  on public.users for insert
  with check ( id = (select auth.uid()) );