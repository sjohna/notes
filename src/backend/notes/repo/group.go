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
	_, log := c.RepoFunctionContext(dao.Context(), "CreateGroup")
	defer c.LogRepoReturn(log)

	log = log.WithFields(logrus.Fields{
		"name":        name,
		"description": description,
	})

	log.Info("Creating group")

	// language=SQL
	SQL := `insert into "group" (name, description)
values ($1, $2)
returning *`

	var createdDocumentGroup Group
	err := dao.Get(&createdDocumentGroup, SQL, name, description)
	if err != nil {
		log.WithError(err).Error("Error running query to create group")
		return nil, err
	}

	log.WithField("groupID", createdDocumentGroup.ID).Info("Created group")

	return &createdDocumentGroup, nil
}

func GetGroups(dao c.DAO) ([]*Group, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "GetGroups")
	defer c.LogRepoReturn(log)

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
		log.WithError(err).Error("Error running query to get groups")
		return nil, err
	}

	// TODO: debug logging for number returned, for this and all similar functions

	return documentGroups, nil
}

func AddDocumentToGroup(dao c.DAO, documentID int64, groupID int64) error {
	_, log := c.RepoFunctionContext(dao.Context(), "AddDocumentToGroup")
	defer c.LogRepoReturn(log)

	log = log.WithFields(map[string]interface{}{
		"documentID": documentID,
		"groupID":    groupID,
	})

	log.Info("Adding document to group")

	// language=SQL
	SQL := `insert into document_group(document_id, document_group_id)
values ($1, $2)`

	_, err := dao.Exec(SQL, documentID, groupID)
	if err != nil {
		log.WithError(err).Error("Error running query to add document to group")
		return err
	}

	log.Info("Added document to group")

	return nil
}

func RemoveDocumentFromGroup(dao c.DAO, documentID int64, groupID int64) error {
	_, log := c.RepoFunctionContext(dao.Context(), "RemoveDocumentFromGroup")
	defer c.LogRepoReturn(log)

	log = log.WithFields(map[string]interface{}{
		"documentID": documentID,
		"groupID":    groupID,
	})

	log.Info("Removing document from group")

	// language=SQL
	SQL := `update document_group
set archived_at = now()
where document_group.document_id = $1
  and document_group.document_group_id = $2
  and document_group.archived_at is null`

	_, err := dao.Exec(SQL, documentID, groupID)
	if err != nil {
		log.WithError(err).Error("Error running query to remove document from group")
		return err
	}

	log.Info("Removed document from group")

	return nil
}
