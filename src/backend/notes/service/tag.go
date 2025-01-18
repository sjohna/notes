package service

import (
	"context"
	"github.com/sjohna/go-server-common/errors"
	r "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

type TagService struct {
	Repo *r.Repo
}

func (svc *TagService) CreateTag(context context.Context, name string, description null.String) (*repo.Tag, errors.Error) {
	createdTag, err := repo.CreateTag(svc.Repo.NonTx(context), name, description)
	if err != nil {
		return nil, err
	}

	return createdTag, nil
}

func (svc *TagService) GetTags(context context.Context) ([]*repo.Tag, errors.Error) {
	tags, err := repo.GetTags(svc.Repo.NonTx(context))
	if err != nil {
		return nil, err
	}

	return tags, nil
}
