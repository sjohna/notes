-- default these times to created_at, since this is the case for all existing documents (all notes) at this time
update document
set document_time = created_at,
    inserted_at = created_at;