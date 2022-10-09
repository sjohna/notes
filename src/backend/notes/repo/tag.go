package repo

import "gopkg.in/guregu/null.v4"

type Tag struct {
	ID          int64       `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Description null.String `db:"description" json:"description"`
	Color       string      `db:"color" json:"color"`
}

func CreateTag(dao DAO, name string, description null.String, color string) (*Tag, error) {
	log := repoFunctionLogger(dao.Logger(), "CreateTag")
	defer logRepoReturn(log)

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

func GetTags(dao DAO) ([]*Tag, error) {
	log := repoFunctionLogger(dao.Logger(), "GetTags")
	defer logRepoReturn(log)

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