package repo

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"time"
)

type DocumentGroup struct {
	ID          int64       `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Description null.String `db:"description" json:"description"`
	InsertedAt  time.Time   `db:"inserted_at" json:"insertedAt"`
	ArchivedAt  null.Time   `db:"archived_at" json:"archivedAt"`
}

type DocumentGroupList []*DocumentGroup

func (r *DocumentGroupList) Scan(src interface{}) error {
	if src == nil {
		return nil
	}
	return json.Unmarshal(src.([]byte), r)
}

func CreateDocumentGroup(dao c.DAO, name string, description null.String) (*DocumentGroup, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "CreateDocumentGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into document_group(name, description)
values ($1, $2)
returning *`

	var createdDocumentGroup DocumentGroup
	err := dao.Get(&createdDocumentGroup, SQL, name, description)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &createdDocumentGroup, nil
}

func GetDocumentGroups(dao c.DAO) ([]*DocumentGroup, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetDocumentGroups")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `select document_group.id,
       document_group.name,
       document_group.description,
       document_group.inserted_at
from document_group
where document_group.archived_at is null`

	documentGroups := make([]*DocumentGroup, 0)
	err := dao.Select(&documentGroups, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return documentGroups, nil
}

func AddDocumentDocumentGroup(dao c.DAO, documentID int64, documentGroupID int64) error {
	log := c.RepoFunctionLogger(dao.Logger().WithFields(logrus.Fields{
		"documentID":      documentID,
		"documentGroupID": documentGroupID,
	}), "AddDocumentDocumentGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into document_group_document(document_id, document_group_id)
values ($1, $2)`

	_, err := dao.Exec(SQL, documentID, documentGroupID)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	return nil
}

func RemoveDocumentDocumentGroup(dao c.DAO, documentID int64, documentGroupID int64) error {
	log := c.RepoFunctionLogger(dao.Logger().WithFields(logrus.Fields{
		"documentID":      documentID,
		"documentGroupID": documentGroupID,
	}), "RemoveDocumentDocumentGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `update document_group_document
set archived_at = now()
where document_group_document.document_id = $1
  and document_group_document.document_group_id = $2
  and document_group_document.archived_at is null`

	_, err := dao.Exec(SQL, documentID, documentGroupID)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	return nil
}
