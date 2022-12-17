package service

import (
	"github.com/sirupsen/logrus"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type TagService struct {
	Repo *r.Repo
}

func (svc *TagService) CreateTag(logger *logrus.Entry, name string, description null.String, color string) (*repo.Tag, error) {
	log := c.ServiceFunctionLogger(logger, "CreateTag")
	defer c.LogServiceReturn(log)

	createdTag, err := repo.CreateTag(svc.Repo.NonTx(log), name, description, color)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return createdTag, nil
}

func (svc *TagService) GetTags(logger *logrus.Entry) ([]*repo.Tag, error) {
	log := c.ServiceFunctionLogger(logger, "GetTags")
	defer c.LogServiceReturn(log)

	tags, err := repo.GetTags(svc.Repo.NonTx(log))
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return tags, nil
}
