package service

import (
	"github.com/sirupsen/logrus"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type DocumentGroupService struct {
	Repo *r.Repo
}

func (svc *DocumentGroupService) CreateDocumentGroup(logger *logrus.Entry, name string, description null.String) (*repo.DocumentGroup, error) {
	log := c.ServiceFunctionLogger(logger, "CreateDocumentGroup")
	defer c.LogServiceReturn(log)

	createdDocumentGroup, err := repo.CreateDocumentGroup(svc.Repo.NonTx(log), name, description)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	log.WithField("documentGroupID", createdDocumentGroup.ID).Infof("Created document group ID %d", createdDocumentGroup.ID)
	return createdDocumentGroup, nil
}

func (svc *DocumentGroupService) GetDocumentGroups(logger *logrus.Entry) ([]*repo.DocumentGroup, error) {
	log := c.ServiceFunctionLogger(logger, "GetDocumentGroups")
	defer c.LogServiceReturn(log)

	documentGroups, err := repo.GetDocumentGroups(svc.Repo.NonTx(log))
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return documentGroups, nil
}
