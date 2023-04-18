package repo

import (
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"notes/common"
)

func CreateDocumentGroup(dao c.DAO, name string, description null.String) (*common.DocumentGroup, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "CreateDocumentGroup")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `insert into document_group(name, description)
values ($1, $2)
returning *`

	var createdDocumentGroup common.DocumentGroup
	err := dao.Get(&createdDocumentGroup, SQL, name, description)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &createdDocumentGroup, nil
}

func GetDocumentGroups(dao c.DAO) ([]*common.DocumentGroup, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetDocumentGroups")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `select document_group.id,
       document_group.name,
       document_group.description,
       document_group.inserted_at
from document_group
where document_group.archived_at is null`

	documentGroups := make([]*common.DocumentGroup, 0)
	err := dao.Select(&documentGroups, SQL)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return documentGroups, nil
}
