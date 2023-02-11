create type time_precision as enum ('full', 'hour', 'day');

alter table document
add column created_at_precision time_precision not null default 'full',
add column document_time timestamptz not null default now(),
add column document_time_precision time_precision not null default 'full',
add column inserted_at timestamptz not null default now();

comment on column document.created_at is 'Time of document creation or publication';
comment on column document.document_time is 'Default time to use for sorting and displaying documents';
comment on column document.inserted_at is 'Time row was inserted into database';