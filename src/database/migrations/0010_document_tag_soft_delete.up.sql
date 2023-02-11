alter table document_tag
add column archived_at timestamptz;

drop index unique_document_tags;

create unique index document_tag_unique_idx
    on document_tag (document_id, tag_id) where document_tag.archived_at is null;