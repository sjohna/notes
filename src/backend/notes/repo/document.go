package repo

import (
	c "github.com/sjohna/go-server-common/repo"
	"time"
)

type Document struct {
	ID                    int64     `db:"id" json:"id"`
	Type                  string    `db:"type" json:"type"`
	Content               string    `db:"content" json:"content"`
	CreatedAt             time.Time `db:"created_at" json:"createdAt"`
	CreatedAtPrecision    string    `db:"created_at_precision" json:"createdAtPrecision"`
	DocumentTime          time.Time `db:"document_time" json:"documentTime"`
	DocumentTimePrecision string    `db:"document_time_precision" json:"documentTimePrecision"`
	InsertedAt            time.Time `db:"inserted_at" json:"insertedAt"`
}

const InternalAuthorID = 1

func CreateDocument(tx *c.TxDAO, documentType string, content string) (*Document, error) {
	log := c.RepoFunctionLogger(tx.Logger(), "CreateQuickNote")
	defer c.LogRepoReturn(log)

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

// language=SQL
var quickNoteQueryBase string = `
select document.id,
       document.type,
       latest_content_version.content,
       document.created_at,
       document.created_at_precision,
       document.document_time,
       document.document_time_precision,
       document.inserted_at
from document
join lateral (
    select document_content.content
    from document_content
    where document_content.document_id = document.id
    order by version desc
    limit 1
) latest_content_version on true
where document.type = 'quick_note'
`

func GetQuickNote(dao c.DAO, documentID int64) (*Document, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetQuickNote")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := quickNoteQueryBase + ` and document.id = $1`

	var quickNote Document
	err := dao.Get(&quickNote, SQL, documentID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &quickNote, nil
}

func GetQuickNotes(dao c.DAO) ([]*Document, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetQuickNotes")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := quickNoteQueryBase + ` order by created_at desc`

	quickNotes := make([]*Document, 0)
	err := dao.Select(&quickNotes, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}

func GetQuickNotesInTimeRange(dao c.DAO, begin time.Time, end time.Time) ([]*Document, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetQuickNotesInTimeRange")
	defer c.LogRepoReturn(log)

	// TODO: effective_time or similar instead of created_at for documents
	// language=SQL
	SQL := quickNoteQueryBase + ` and document.created_at between $1 and $2
order by created_at desc`

	quickNotes := make([]*Document, 0)
	err := dao.Select(&quickNotes, SQL, begin, end)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}
