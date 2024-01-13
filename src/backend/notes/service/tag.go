package service

import (
	"context"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type TagService struct {
	Repo *r.Repo
}

func (svc *TagService) CreateTag(context context.Context, name string, description null.String) (*repo.Tag, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "CreateTag")
	defer c.LogServiceReturn(log)

	createdTag, err := repo.CreateTag(svc.Repo.NonTx(serviceContext), name, description)
	if err != nil {
		log.WithError(err).Error("Error creating tag")
		return nil, err
	}

	log.WithField("tagID", createdTag.ID).Infof("Created tag")

	return createdTag, nil
}

func (svc *TagService) GetTags(context context.Context) ([]*repo.Tag, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "GetTags")
	defer c.LogServiceReturn(log)

	tags, err := repo.GetTags(svc.Repo.NonTx(serviceContext))
	if err != nil {
		log.WithError(err).Error("Error getting tags")
		return nil, err
	}

	return tags, nil
}
