package repo

import (
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
)

type Tag struct {
	ID          int64       `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Description null.String `db:"description" json:"description"`
	Color       string      `db:"color" json:"color"`
}

func CreateTag(dao c.DAO, name string, description null.String, color string) (*Tag, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "CreateTag")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into tag(name, description, color)
values ($1, $2, $3)
returning *`

	var createdTag Tag
	err := dao.Get(&createdTag, SQL, name, description, color)
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
	SQL := `select tag.id, tag.name, tag.description, tag.color
from tag`

	tags := make([]*Tag, 0)
	err := dao.Select(&tags, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return tags, nil
}
