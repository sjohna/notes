package repo

import "time"

type Document struct {
	ID        int64     `db:"id" json:"id"`
	Type      string    `db:"type" json:"type"`
	Content   string    `db:"content" json:"content"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

func CreateDocument(dao DAO, documentType string, content string) (*Document, error) {
	log := repoFunctionLogger(dao.Logger(), "CreateQuickNote")
	defer logRepoReturn(log)

	// language=SQL
	SQL := `insert into document (type, content)
values ($1, $2)
returning *`

	var createdQuickNote Document
	err := dao.Get(&createdQuickNote, SQL, documentType, content)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &createdQuickNote, nil
}

func GetQuickNotes(dao DAO) ([]*Document, error) {
	log := repoFunctionLogger(dao.Logger(), "GetQuickNotes")
	defer logRepoReturn(log)

	// language=SQL
	SQL := `select *
from document
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
