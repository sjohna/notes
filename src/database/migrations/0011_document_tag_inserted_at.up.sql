alter table document_tag
add column inserted_at timestamptz not null default now();