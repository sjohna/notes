package service

import (
	"github.com/sirupsen/logrus"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type TagService struct {
	Repo *repo.Repo
}

func (svc *TagService) CreateTag(logger *logrus.Entry, name string, description null.String, color string) (*repo.Tag, error) {
	log := serviceFunctionLogger(logger, "CreateTag")
	defer logServiceReturn(log)

	createdTag, err := repo.CreateTag(svc.Repo.NonTx(log), name, description, color)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return createdTag, nil
}

func (svc *TagService) GetTags(logger *logrus.Entry) ([]*repo.Tag, error) {
	log := serviceFunctionLogger(logger, "GetTags")
	defer logServiceReturn(log)

	tags, err := repo.GetTags(svc.Repo.NonTx(log))
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return tags, nil
}
