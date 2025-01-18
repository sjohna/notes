package repo

import (
	"encoding/json"
	"github.com/sjohna/go-server-common/errors"
	"github.com/sjohna/go-server-common/log"
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

func CreateTag(dao c.DAO, name string, description null.String) (*Tag, errors.Error) {
	// language=SQL
	SQL := `insert into tag(name, description)
values ($1, $2)
returning *`

	var createdTag Tag
	err := dao.Get(&createdTag, SQL, name, description)
	if err != nil {
		return nil, errors.Wrap(err, "error running create tag query")
	}

	return &createdTag, nil
}

func GetTags(dao c.DAO) ([]*Tag, errors.Error) {
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
		return nil, err
	}

	return tags, nil
}

// TODO: this will error out if tag already set. Maybe optional argument to handle that case?
func AddDocumentTag(dao c.DAO, documentID int64, tagID int64) errors.Error {
	// language=SQL
	SQL := `insert into document_tag (document_id, tag_id)
values ($1, $2)`

	_, err := dao.Exec(SQL, documentID, tagID)
	if err != nil {
		return err
	}

	return nil
}

func RemoveDocumentTag(dao c.DAO, documentID int64, tagID int64) errors.Error {
	// language=SQL
	SQL := `update document_tag
set archived_at = now()
where document_tag.document_id = $1
  and document_tag.tag_id = $2
  and document_tag.archived_at is null`

	result, err := dao.Exec(SQL, documentID, tagID)
	if err != nil {
		return err
	}

	rowsAffected, rowsAffectedErr := result.RowsAffected()
	if rowsAffectedErr != nil {
		return errors.Wrap(rowsAffectedErr, "Error getting rows affected")
	}

	if rowsAffected == 0 {
		log.General.WithField("documentID", documentID).WithField("tagID", tagID).Warn("No rows affected when removing tag from document")
		return nil
	}

	return nil
}
