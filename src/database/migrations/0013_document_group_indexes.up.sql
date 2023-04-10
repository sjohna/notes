create index document_group_document_document_group_id_idx on document_group_document(document_group_id);

create index document_group_document_document_group_inserted_at_idx on document_group_document(document_group_id, inserted_at)
where archived_at is null;

create index document_group_document_document_id_idx on document_group_document(document_id);