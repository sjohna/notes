create table document_group (
    id bigint generated always as identity primary key,
    name text not null,
    description text,
    inserted_at timestamptz not null default now(),
    archived_at timestamptz
);

create table document_group_document (
    id bigint generated always as identity primary key,
    document_group_id bigint not null references document_group(id),
    document_id bigint not null references document(id),
    inserted_at timestamptz not null default now(),
    archived_at timestamptz not null default now()
    -- will probably want to add metadata at some point, but will keep it simple for now
);