alter table tag
add column inserted_at timestamptz not null default now(),
add column archived_at timestamptz;