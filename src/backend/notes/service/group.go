package service

import (
	"context"
	"github.com/sjohna/go-server-common/errors"
	"github.com/sjohna/go-server-common/log"
	r "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type GroupService struct {
	Repo *r.Repo
}

func (svc *GroupService) CreateGroup(context context.Context, name string, description null.String) (*repo.Group, errors.Error) {
	createdGroup, err := repo.CreateGroup(svc.Repo.NonTx(context), name, description)
	if err != nil {
		return nil, err
	}

	return createdGroup, nil
}

func (svc *GroupService) GetGroups(context context.Context) ([]*repo.Group, errors.Error) {
	documentGroups, err := repo.GetGroups(svc.Repo.NonTx(context))
	if err != nil {
		log.General.WithError(err).Error("Error getting groups")
		return nil, err
	}

	return documentGroups, nil
}
