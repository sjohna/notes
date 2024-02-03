package repo

import (
	"encoding/json"
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"time"
)

type Tag struct {
	ID            int64       `db:"id" json:"id"`
	Name          string      `db:"name" json:"name"`
	Description   null.String `db:"description" json:"description,omitempty"`
	InsertedAt    time.Time   `db:"inserted_at" json:"insertedAt"`
	ArchivedAt    null.Time   `db:"archived_at" json:"archivedAt,omitempty"`
	DocumentCount int         `db:"document_count" json:"documentCount"`
}

type TagList []*Tag

func (r *TagList) Scan(src interface{}) error {
	if src == nil {
		return nil
	}
	return json.Unmarshal(src.([]byte), r)
}

// TODO maybe make this a generic named ID struct?
type TagOnDocument struct {
	ID   int64  `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type TagOnDocumentList []*TagOnDocument

func (r *TagOnDocumentList) Scan(src interface{}) error {
	if src == nil {
		return nil
	}
	return json.Unmarshal(src.([]byte), r)
}

func CreateTag(dao c.DAO, name string, description null.String) (*Tag, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "CreateTag")
	defer c.LogRepoReturn(log)

	log = log.WithFields(map[string]interface{}{
		"name":        name,
		"description": description,
	})

	log.Debug("Creating tag")

	// language=SQL
	SQL := `insert into tag(name, description)
values ($1, $2)
returning *`

	var createdTag Tag
	err := dao.Get(&createdTag, SQL, name, description)
	if err != nil {
		log.WithError(err).Error("Error creating tag")
		return nil, err
	}

	log.WithField("tagID", createdTag.ID).Info("Created tag")

	return &createdTag, nil
}

func GetTags(dao c.DAO) ([]*Tag, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "GetTags")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `select tag.id,
       tag.name,
       tag.description,
       tag.inserted_at,
       tag.archived_at,
       dt.count as document_count
from tag
         left join lateral (
    select count(document_id) as count
    from document_tag
    where tag_id = tag.id
      and archived_at is null
    ) dt on true
where tag.archived_at is null
`

	tags := make([]*Tag, 0)
	err := dao.Select(&tags, SQL)
	if err != nil {
		log.WithError(err).Error("Error running query to get tags")
		return nil, err
	}

	return tags, nil
}

// TODO: this will error out if tag already set. Maybe optional argument to handle that case?
func AddDocumentTag(dao c.DAO, documentID int64, tagID int64) error {
	_, log := c.RepoFunctionContext(dao.Context(), "AddDocumentTag")
	defer c.LogRepoReturn(log)

	log = log.WithFields(map[string]interface{}{
		"documentID": documentID,
		"tagID":      tagID,
	})

	log.Info("Adding tag to document")

	// language=SQL
	SQL := `insert into document_tag (document_id, tag_id)
values ($1, $2)`

	_, err := dao.Exec(SQL, documentID, tagID)
	if err != nil {
		log.WithError(err).Error("Error running query to add tag to document")
		return err
	}

	log.Info("Added tag to document")

	return nil
}

func RemoveDocumentTag(dao c.DAO, documentID int64, tagID int64) error {
	_, log := c.RepoFunctionContext(dao.Context(), "RemoveDocumentTag")
	defer c.LogRepoReturn(log)

	log = log.WithFields(map[string]interface{}{
		"documentID": documentID,
		"tagID":      tagID,
	})

	log.Info("Removing tag from document")

	// language=SQL
	SQL := `update document_tag
set archived_at = now()
where document_tag.document_id = $1
  and document_tag.tag_id = $2
  and document_tag.archived_at is null`

	result, err := dao.Exec(SQL, documentID, tagID)
	if err != nil {
		log.WithError(err).Error("Error running query to remove tag from document")
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.WithError(err).Error("Error getting rows affected from query to remove tag from document")
		return err
	}

	if rowsAffected == 0 {
		log.Warn("No rows affected when removing tag from document")
		return nil
	}

	log.Info("Removed tag from document")

	return nil
}
