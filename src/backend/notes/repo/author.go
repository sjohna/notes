package repo

import (
	"database/sql"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
)

type AuthorInfo struct {
	Name                    string    `db:"name" json:"name"`
	DocumentCount           int64     `db:"document_count" json:"documentCount"`
	LastCreatedDocumentID   null.Int  `db:"last_created_document_id" json:"lastCreatedDocumentId"`
	LastCreatedDocumentTime null.Time `db:"last_created_document_time" json:"lastCreatedDocumentTime"`
}

// TODO: names aren't unique, so this isn't fit for general use. Consider a better way to get the default author
func GetAuthorIDByName(dao c.DAO, name string) (null.Int, errors.Error) {
	//language=SQL
	SQL := `select author.id
from author
where author.name = $1`

	var id int64
	err := dao.Get(&id, SQL, name)
	if err != nil {
		if err.Is(sql.ErrNoRows) {
			return null.Int{}, nil
		}

		return null.Int{}, err
	}

	return null.IntFrom(id), nil
}

func GetAuthorInfoByID(dao c.DAO, authorID int64) (*AuthorInfo, errors.Error) {
	//language=SQL
	basicInfoSQL := `select name,
       last_created_document.id as last_created_document_id,
       last_created_document.created_at as last_created_document_time
from author
left join lateral (
    select document.id,
           document.created_at
    from document
    where document.author_id = author.id
    order by document.created_at desc limit 1
) last_created_document on true
where author.id = $1`

	var authorInfo AuthorInfo
	err := dao.Get(&authorInfo, basicInfoSQL, authorID)
	if err != nil {
		if err.Is(sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	//language=SQL
	documentCountSQL := `select count(*) from document join author on author.id = document.author_id where author.id = $1` // TODO: account for deleted/archived
	err = dao.Get(&authorInfo.DocumentCount, documentCountSQL, authorID)
	if err != nil {
		return nil, err
	}

	return &authorInfo, nil
}
