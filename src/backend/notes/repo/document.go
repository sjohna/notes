package repo

import "time"

type Document struct {
	ID        int64     `db:"id" json:"id"`
	Type      string    `db:"type" json:"type"`
	Content   string    `db:"content" json:"content"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

const InternalAuthorID = 1

func CreateDocument(tx *TxDAO, documentType string, content string) (*Document, error) {
	log := repoFunctionLogger(tx.Logger(), "CreateQuickNote")
	defer logRepoReturn(log)

	// language=SQL
	DocumentSQL := `insert into document (type, author_id)
values ($1, $2)
returning id`

	var createdQuickNoteID int64
	err := tx.Get(&createdQuickNoteID, DocumentSQL, documentType, InternalAuthorID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	// language=SQL
	ContentSQL := `insert into document_content (document_id, content, content_type, version)
values ($1, $2, $3, 1)`
	_, err = tx.Exec(ContentSQL, createdQuickNoteID, content, "text")
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	createdQuickNote, err := GetQuickNote(tx, createdQuickNoteID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return createdQuickNote, nil
}

func GetQuickNote(dao DAO, documentID int64) (*Document, error) {
	log := repoFunctionLogger(dao.Logger(), "GetQuickNote")
	defer logRepoReturn(log)

	// language=SQL
	SQL := `select document.id,
       document.type,
       latest_content_version.content,
       document.created_at
from document
join lateral (
    select document_content.content
    from document_content
    where document_content.document_id = document.id
    order by version desc
    limit 1
) latest_content_version on true
where document.type = 'quick_note'
  and document.id = $1`

	var quickNote Document
	err := dao.Get(&quickNote, SQL, documentID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &quickNote, nil
}

func GetQuickNotes(dao DAO) ([]*Document, error) {
	log := repoFunctionLogger(dao.Logger(), "GetQuickNotes")
	defer logRepoReturn(log)

	// language=SQL
	SQL := `select document.id,
       document.type,
       latest_content_version.content,
       document.created_at
from document
join lateral (
    select document_content.content
    from document_content
    where document_content.document_id = document.id
    order by version desc
    limit 1
) latest_content_version on true
where document.type = 'quick_note'
order by created_at desc`

	quickNotes := make([]*Document, 0)
	err := dao.Select(&quickNotes, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}
