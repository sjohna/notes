create type content_type as enum('text');

create table document_content (
    id bigint generated always as identity primary key,
    document_id bigint references document not null,
    version int not null,
    created_at timestamptz not null default now(),
    content text not null,
    content_type content_type not null
);

insert into document_content(document_id, version, created_at, content, content_type)
select document.id as document_id,
       1 as version,
       document.created_at as created_at,
       document.content as content,
       'text'::content_type as content_type
from document;

alter table document drop column content;