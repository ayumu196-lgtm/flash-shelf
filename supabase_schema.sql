-- Create table for Books
create table public.books (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  isbn text null,
  title text not null,
  cover_url text null,
  tags text[] null,
  rating integer null,
  comment text null,
  constraint books_pkey primary key (id)
) tablespace pg_default;

-- Enable Realtime
alter publication supabase_realtime add table public.books;

-- Set up Storage for Book Covers
insert into storage.buckets (id, name, public) 
values ('covers', 'covers', true);

create policy "Public Access" on storage.objects for select using ( bucket_id = 'covers' );
create policy "Public Upload" on storage.objects for insert using ( bucket_id = 'covers' );

-- Simple Row Level Security (Allow all for this shared app)
alter table public.books enable row level security;

create policy "Enable read access for all users"
on public.books
for select using (true);

create policy "Enable insert for all users"
on public.books
for insert with check (true);

create policy "Enable update for all users"
on public.books
for update using (true);

create policy "Enable delete for all users"
on public.books
for delete using (true);
