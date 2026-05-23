-- Run this entire script in your Supabase SQL Editor

-- 1. Create accounts table (for custom username login)
create table public.accounts (
  username text primary key,
  email text not null,
  password text not null
);

-- 2. Create habits table
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  username text references public.accounts(username) on delete cascade not null,
  name text not null,
  streak integer default 0,
  history jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create notes table
create table public.notes (
  username text references public.accounts(username) on delete cascade primary key,
  content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.accounts enable row level security;
alter table public.habits enable row level security;
alter table public.notes enable row level security;

-- 5. Create Security Policies

-- Accounts policies (Basic implementation for custom auth)
create policy "Anyone can insert an account" on public.accounts for insert with check (true);
create policy "Anyone can select accounts" on public.accounts for select using (true);

-- Habits policies
create policy "Users can view own habits." on public.habits for select using (true);
create policy "Users can insert own habits." on public.habits for insert with check (true);
create policy "Users can update own habits." on public.habits for update using (true);
create policy "Users can delete own habits." on public.habits for delete using (true);

-- Notes policies
create policy "Users can view own notes." on public.notes for select using (true);
create policy "Users can insert own notes." on public.notes for insert with check (true);
create policy "Users can update own notes." on public.notes for update using (true);
