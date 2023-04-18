alter table document_group_document
drop column archived_at;

alter table document_group_document
add column archived_at timestamptz;