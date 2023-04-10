create table document_draft (
    id bigint generated always as identity primary key,
    base_content_id bigint references document_content(id), -- if not null, is an edit to this content version
    content text not null,
    inserted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    archived_at timestamptz,
    completed_at timestamptz,
    completed_content_id bigint references document_content(id),
    constraint not_archived_and_completed check (not (archived_at is not null and completed_at is not null)),
    constraint completed_consistent check ((completed_at is null) = (completed_content_id is null))
);

create index document_draft_inserted_at_idx on document_draft(inserted_at);

create index document_draft_updated_at_idx on document_draft(updated_at);