-- 1. Create bills table
create table if not exists bills (
  id text primary key,
  title text not null default 'Restaurant Bill',
  currency text not null default '฿',
  promptpay_number text default '',
  service_charge_percent numeric not null default 0,
  vat_percent numeric not null default 0,
  discount_amount numeric not null default 0,
  tip_amount numeric not null default 0,
  people jsonb not null default '[]'::jsonb,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If table already exists, ensure promptpay_number column is present:
alter table bills add column if not exists promptpay_number text default '';

-- 2. CRITICAL for Realtime: Set Replica Identity to FULL
-- Without this, UPDATE events in Supabase Realtime do not broadcast full jsonb arrays to anon clients!
alter table bills replica identity full;

-- 3. Enable Row Level Security (RLS) and allow public read/write for bill sharing
alter table bills enable row level security;

create policy "Allow public read access" 
  on bills for select 
  using (true);

create policy "Allow public insert access" 
  on bills for insert 
  with check (true);

create policy "Allow public update access" 
  on bills for update 
  using (true) 
  with check (true);

-- 4. Enable Realtime updates
alter publication supabase_realtime add table bills;
