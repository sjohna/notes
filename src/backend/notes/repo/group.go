package repo

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"time"
)

type Group struct {
	ID            int64       `db:"id" json:"id"`
	Name          string      `db:"name" json:"name"`
	Description   null.String `db:"description" json:"description,omitempty"`
	InsertedAt    time.Time   `db:"inserted_at" json:"insertedAt"`
	ArchivedAt    null.Time   `db:"archived_at" json:"archivedAt,omitempty"`
	DocumentCount int         `db:"document_count" json:"documentCount"`
}

type GroupList []*Group

func (r *GroupList) Scan(src interface{}) error {
	if src == nil {
		return nil
	}
	return json.Unmarshal(src.([]byte), r)
}

type GroupOnDocument struct {
	ID   int64  `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type GroupOnDocumentList []*GroupOnDocument

func (r *GroupOnDocumentList) Scan(src interface{}) error {
	if src == nil {
		return nil
	}
	return json.Unmarshal(src.([]byte), r)
}

func CreateGroup(dao c.DAO, name string, description null.String) (*Group, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "CreateGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into document_group(name, description)
values ($1, $2)
returning *`

	var createdDocumentGroup Group
	err := dao.Get(&createdDocumentGroup, SQL, name, description)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &createdDocumentGroup, nil
}

func GetGroups(dao c.DAO) ([]*Group, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetGroups")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `select document_group.id,
       document_group.name,
       document_group.description,
       document_group.inserted_at,
       document_group.archived_at,
       dgd.count as document_count
from document_group
         join lateral (
    select count(*) as count
    from document_group_document dgd
    where dgd.document_group_id = document_group.id
      and dgd.archived_at is null
    ) as dgd on true
where document_group.archived_at is null`

	documentGroups := make([]*Group, 0)
	err := dao.Select(&documentGroups, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return documentGroups, nil
}

func AddDocumentToGroup(dao c.DAO, documentID int64, groupID int64) error {
	log := c.RepoFunctionLogger(dao.Logger().WithFields(logrus.Fields{
		"documentID": documentID,
		"groupID":    groupID,
	}), "AddDocumentToGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into document_group_document(document_id, document_group_id)
values ($1, $2)`

	_, err := dao.Exec(SQL, documentID, groupID)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	return nil
}

func RemoveDocumentFromGroup(dao c.DAO, documentID int64, groupID int64) error {
	log := c.RepoFunctionLogger(dao.Logger().WithFields(logrus.Fields{
		"documentID": documentID,
		"groupID":    groupID,
	}), "RemoveDocumentFromGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `update document_group_document
set archived_at = now()
where document_group_document.document_id = $1
  and document_group_document.document_group_id = $2
  and document_group_document.archived_at is null`

	_, err := dao.Exec(SQL, documentID, groupID)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	return nil
}
