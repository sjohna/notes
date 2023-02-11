package repo

import (
	"github.com/sirupsen/logrus"
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
)

type Tag struct {
	ID          int64       `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Description null.String `db:"description" json:"description"`
}

func CreateTag(dao c.DAO, name string, description null.String) (*Tag, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "CreateTag")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into tag(name, description)
values ($1, $2)
returning *`

	var createdTag Tag
	err := dao.Get(&createdTag, SQL, name, description)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &createdTag, nil
}

func GetTags(dao c.DAO) ([]*Tag, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetTags")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `select tag.id, tag.name, tag.description
from tag`

	tags := make([]*Tag, 0)
	err := dao.Select(&tags, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return tags, nil
}

// TODO: this will error out if tag already set. Maybe optional argument to handle that case?
func AddDocumentTag(dao c.DAO, documentID int64, tagID int64) error {
	log := c.RepoFunctionLogger(dao.Logger().WithFields(logrus.Fields{
		"documentID": documentID,
		"tagID":      tagID,
	}), "AddDocumentTag")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into document_tag (document_id, tag_id)
values ($1, $2)`

	result, err := dao.Exec(SQL, documentID, tagID)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	log.WithField("rowsAffected", rowsAffected).Info()
	return nil
}

func RemoveDocumentTag(dao c.DAO, documentID int64, tagID int64) error {
	log := c.RepoFunctionLogger(dao.Logger().WithFields(logrus.Fields{
		"documentID": documentID,
		"tagID":      tagID,
	}), "RemoveDocumentTag")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `update document_tag
set archived_at = now()
where document_tag.document_id = $1
  and document_tag.tag_id = $2`

	result, err := dao.Exec(SQL, documentID, tagID)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	log.WithField("rowsAffected", rowsAffected).Info()
	return nil
}