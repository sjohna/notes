package repo

import (
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
