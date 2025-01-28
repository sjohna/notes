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

func (svc *GroupService) CreateGroup(ctx context.Context, name string, description null.String) (*repo.Group, errors.Error) {
	createdGroup, err := repo.CreateGroup(svc.Repo.NonTx(ctx), name, description)
	if err != nil {
		return nil, err
	}

	return createdGroup, nil
}

func (svc *GroupService) GetGroups(ctx context.Context) ([]*repo.Group, errors.Error) {
	documentGroups, err := repo.GetGroups(svc.Repo.NonTx(ctx))
	if err != nil {
		log.General.WithError(err).Error("Error getting groups")
		return nil, err
	}

	return documentGroups, nil
}
