create index document_created_at_index on document(created_at);

create index document_content_document_id_version_index on document_content(document_id, version);