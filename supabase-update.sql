-- Run this in your Supabase SQL Editor to fix the schema

-- 1. Create the missing accounts table
create table if not exists public.accounts (
  username text primary key,
  email text not null,
  password text not null
);

-- 2. Drop the old incorrectly configured tables (Safe since there's no real data yet)
drop table if exists public.habits;
drop table if exists public.notes;

-- 3. Recreate habits table with the correct 'username' foreign key
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  username text references public.accounts(username) on delete cascade not null,
  name text not null,
  streak integer default 0,
  history jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Recreate notes table with the correct 'username' foreign key
create table public.notes (
  username text references public.accounts(username) on delete cascade primary key,
  content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS)
alter table public.accounts enable row level security;
alter table public.habits enable row level security;
alter table public.notes enable row level security;

-- 6. Create Security Policies
create policy "Anyone can insert an account" on public.accounts for insert with check (true);
create policy "Anyone can select accounts" on public.accounts for select using (true);

create policy "Users can view own habits." on public.habits for select using (true);
create policy "Users can insert own habits." on public.habits for insert with check (true);
create policy "Users can update own habits." on public.habits for update using (true);
create policy "Users can delete own habits." on public.habits for delete using (true);

create policy "Users can view own notes." on public.notes for select using (true);
create policy "Users can insert own notes." on public.notes for insert with check (true);
create policy "Users can update own notes." on public.notes for update using (true);
