package service

import (
	"github.com/sirupsen/logrus"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type GroupService struct {
	Repo *r.Repo
}

func (svc *GroupService) CreateGroup(logger *logrus.Entry, name string, description null.String) (*repo.Group, error) {
	log := c.ServiceFunctionLogger(logger, "CreateGroup")
	defer c.LogServiceReturn(log)

	createdGroup, err := repo.CreateGroup(svc.Repo.NonTx(log), name, description)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	log.WithField("groupID", createdGroup.ID).Infof("Created group ID %d", createdGroup.ID)
	return createdGroup, nil
}

func (svc *GroupService) GetGroups(logger *logrus.Entry) ([]*repo.Group, error) {
	log := c.ServiceFunctionLogger(logger, "GetGroups")
	defer c.LogServiceReturn(log)

	documentGroups, err := repo.GetGroups(svc.Repo.NonTx(log))
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return documentGroups, nil
}
