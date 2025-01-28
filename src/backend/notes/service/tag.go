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

func (svc *TagService) CreateTag(ctx context.Context, name string, description null.String) (*repo.Tag, errors.Error) {
	createdTag, err := repo.CreateTag(svc.Repo.NonTx(ctx), name, description)
	if err != nil {
		return nil, err
	}

	return createdTag, nil
}

func (svc *TagService) GetTags(ctx context.Context) ([]*repo.Tag, errors.Error) {
	tags, err := repo.GetTags(svc.Repo.NonTx(ctx))
	if err != nil {
		return nil, err
	}

	return tags, nil
}
