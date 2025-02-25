package repo

import (
	"encoding/json"
	"github.com/sjohna/go-server-common/errors"
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

// CreateGroup returns ID of created group
func CreateGroup(dao c.DAO, name string, description null.String) (int64, errors.Error) {
	// language=SQL
	SQL := `insert into "group" (name, description)
values ($1, $2)
returning "group".id`

	var createdGroupID int64
	err := dao.Get(&createdGroupID, SQL, name, description)
	if err != nil {
		return 0, err
	}

	return createdGroupID, nil
}

func GetGroupByID(dao c.DAO, id int64) (*Group, errors.Error) {
	// language=SQL
	SQL := `select "group".id,
       "group".name,
       "group".description,
       "group".inserted_at,
       "group".archived_at,
       dg.count as document_count
from "group"
         join lateral (
    select count(*) as count
    from document_group dg
    where dg.document_group_id = "group".id
      and dg.archived_at is null
    ) as dg on true
where "group".archived_at is null
  and "group".id = $1`

	var ret Group
	err := dao.Get(&ret, SQL, id)
	if err != nil {
		return nil, err
	}

	return &ret, nil
}

func GetGroups(dao c.DAO) ([]*Group, errors.Error) {
	// language=SQL
	SQL := `select "group".id,
       "group".name,
       "group".description,
       "group".inserted_at,
       "group".archived_at,
       dg.count as document_count
from "group"
         join lateral (
    select count(*) as count
    from document_group dg
    where dg.document_group_id = "group".id
      and dg.archived_at is null
    ) as dg on true
where "group".archived_at is null`

	documentGroups := make([]*Group, 0)
	err := dao.Select(&documentGroups, SQL)
	if err != nil {
		return nil, err
	}

	return documentGroups, nil
}

func AddDocumentToGroup(dao c.DAO, documentID int64, groupID int64) errors.Error {
	// language=SQL
	SQL := `insert into document_group(document_id, document_group_id)
values ($1, $2)`

	_, err := dao.Exec(SQL, documentID, groupID)
	if err != nil {
		return err
	}

	return nil
}

func RemoveDocumentFromGroup(dao c.DAO, documentID int64, groupID int64) errors.Error {
	// language=SQL
	SQL := `update document_group
set archived_at = now()
where document_group.document_id = $1
  and document_group.document_group_id = $2
  and document_group.archived_at is null`

	_, err := dao.Exec(SQL, documentID, groupID)
	if err != nil {
		return err
	}

	return nil
}
