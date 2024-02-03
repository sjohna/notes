package service

import (
	"context"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type GroupService struct {
	Repo *r.Repo
}

func (svc *GroupService) CreateGroup(context context.Context, name string, description null.String) (*repo.Group, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "CreateGroup")
	defer c.LogServiceReturn(log)

	log = log.WithFields(map[string]interface{}{
		"name":        name,
		"description": description,
	})

	log.Debug("Creating group")

	createdGroup, err := repo.CreateGroup(svc.Repo.NonTx(serviceContext), name, description)
	if err != nil {
		log.WithError(err).Error("Error creating group")
		return nil, err
	}

	log.WithField("groupID", createdGroup.ID).Info("Created group")
	return createdGroup, nil
}

func (svc *GroupService) GetGroups(context context.Context) ([]*repo.Group, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "GetGroups")
	defer c.LogServiceReturn(log)

	documentGroups, err := repo.GetGroups(svc.Repo.NonTx(serviceContext))
	if err != nil {
		log.WithError(err).Error("Error getting groups")
		return nil, err
	}

	return documentGroups, nil
}
