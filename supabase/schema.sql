-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_status text default 'inactive',
  subscription_plan text,
  subscription_end_date timestamptz,
  trial_end_date timestamptz,
  created_at timestamptz default now()
);

-- Generations table
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  original_image_url text not null,
  generated_image_url text not null,
  style text,
  custom_prompt text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table generations enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own generations" on generations
  for select using (auth.uid() = user_id);

create policy "Users can insert own generations" on generations
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage buckets (run in Supabase dashboard or via API)
-- 1. Create bucket "originals" (private)
-- 2. Create bucket "generated" (private)
-- 3. Add storage policies for authenticated users
