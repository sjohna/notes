create type document_type as enum ('quick_note');

create table document (
    id bigint generated always as identity primary key,
    type document_type not null,
    content text not null,
    created_at timestamptz not null default now()
)