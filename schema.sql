-- Users table (managed by Supabase Auth)
-- profiles table for additional user data
create table profiles (
  id text primary key,
  email text,
  name text,
  avatar_url text
);

-- Workspaces table
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id text references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Panels table
create table panels (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  position text not null,
  document_id text,
  document_name text,
  document_type text,
  zoom numeric default 1,
  mode text default 'read',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  document_access_token TEXT,
  document_refresh_token TEXT,
  document_expiry TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table panels enable row level security;

-- Policies for profiles
create policy "Enable insert for authenticated users"
  on profiles for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update for users based on email"
  on profiles for update
  using (auth.email() = email);

create policy "Enable read access to all users"
  on profiles for select
  using (true);

-- Policies for workspaces
create policy "Users can view own workspaces" 
  on workspaces for select 
  using (auth.uid()::text = user_id);

create policy "Users can insert own workspaces" 
  on workspaces for insert 
  with check (auth.uid()::text = user_id);

create policy "Users can update own workspaces" 
  on workspaces for update 
  using (auth.uid()::text = user_id);

create policy "Users can delete own workspaces" 
  on workspaces for delete 
  using (auth.uid()::text = user_id);

-- Policies for panels
create policy "Users can view panels in their workspaces" 
  on panels for select 
  using (
    exists (
      select 1 from workspaces 
      where workspaces.id = panels.workspace_id 
      and workspaces.user_id = auth.uid()::text
    )
  );

create policy "Users can modify panels in their workspaces" 
  on panels for all
  using (
    exists (
      select 1 from workspaces 
      where workspaces.id = panels.workspace_id 
      and workspaces.user_id = auth.uid()::text
    )
  ); 