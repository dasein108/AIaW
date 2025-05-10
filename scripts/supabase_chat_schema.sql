-- Enable required extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: Profiles (linked to auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE: Chats (group chats and DMs)
-- ============================================
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  is_public boolean, -- null for DMs, true/false for groups
  owner_id uuid references public.profiles(id) on delete set null,
  name text,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE: Chat Members (users in group or DM)
-- ============================================
create table public.chat_members (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (chat_id, user_id)
);

-- ============================================
-- TABLE: Messages (in chats)
-- ============================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- FUNCTION: Auto-create profile on auth.users signup
-- ============================================
create function public.create_profile_on_signup()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER: On auth.users insert → create profile
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.create_profile_on_signup();

-- ============================================
-- FUNCTION: Auto-fill owner_id on chat insert
-- ============================================
create or replace function public.set_chat_owner()
returns trigger as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER: Before insert on chats
create trigger set_chat_owner_trigger
before insert on public.chats
for each row
execute procedure public.set_chat_owner();

-- ============================================
-- FUNCTION: Add chat owner as member
-- ============================================
create or replace function public.add_chat_owner_as_member()
returns trigger as $$
begin
  insert into public.chat_members (chat_id, user_id)
  values (new.id, new.owner_id)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER: After insert on chats → add to chat_members
create trigger add_chat_owner_as_member_trigger
after insert on public.chats
for each row
execute procedure public.add_chat_owner_as_member();

-- ============================================
-- FUNCTION: Auto-fill sender_id on message insert
-- ============================================
create or replace function public.set_sender_id()
returns trigger as $$
begin
  if new.sender_id is null then
    new.sender_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER: Before insert on messages
create trigger set_sender_id_trigger
before insert on public.messages
for each row
execute procedure public.set_sender_id();

-- ============================================
-- RLS: Enable Row-Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;

-- ============================================
-- POLICIES: Profiles
-- ============================================
create policy "Anyone can read profiles"
on public.profiles
for select using (true);


create policy "Users can update their own profile"
on public.profiles
for update using (auth.uid() = id);

-- ============================================
-- POLICIES: Chats
-- ============================================
create policy "Read public chats or member chats"
on public.chats
for select using (
  is_public = true or
  exists (
    select 1 from public.chat_members
    where chat_id = public.chats.id and user_id = auth.uid()
  )
);

create policy "Members or owner can update chat"
on public.chats
for update using (
  exists (
    select 1 from public.chat_members
    where chat_id = public.chats.id and user_id = auth.uid()
  ) or owner_id = auth.uid()
);

create policy "Authenticated users can insert chats"
on public.chats
for insert with check (true);

-- ============================================
-- POLICIES: Chat Members
-- ============================================
create policy "Users can view their memberships"
on public.chat_members
for select using (user_id = auth.uid());

create policy "Users can join group chats"
on public.chat_members
for insert with check (
  user_id = auth.uid() and
  exists (select 1 from public.chats where id = chat_id and (is_public = true or owner_id = auth.uid()))
);

-- ============================================
-- POLICIES: Messages
-- ============================================
-- Drop the existing SELECT policy for messages

-- Create the new SELECT policy
create policy "Read messages if user is a member of the chat"
on public.messages
for select using (
  exists (
    select 1
    from public.chat_members
    where chat_id = messages.chat_id
      and user_id = auth.uid()
  )
);

create policy "Read messages if user is sender or member"
on public.messages
for select using (
  messages.sender_id = auth.uid() OR
  exists (
    select 1
    from public.chat_members
    where chat_id = messages.chat_id
      and user_id = auth.uid()
  )
);



create policy "Insert messages only if user is member"
on public.messages
for insert with check (
  sender_id = auth.uid() and
  exists (
    select 1 from public.chat_members
    where chat_id = messages.chat_id and user_id = auth.uid()
  )
);
