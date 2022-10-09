create table tag (
    id bigint generated always as identity primary key,
    name text not null,
    description text,
    color varchar(6) not null
);

create index tag_name_index on tag(name);

alter table tag
add constraint tag_color_hex_constraint
check (color ~* '^[a-f0-9]{6}$');    -- ~* is case insensitive regex matching

create table document_tag (
    document_id bigint references document(id) not null,
    tag_id bigint references tag(id) not null
);

create unique index unique_document_tags
on document_tag (document_id, tag_id);