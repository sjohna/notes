package service

import (
	"context"
	"github.com/sjohna/go-server-common/errors"
	r "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"notes/repo"
)

const DefaultInternalAuthorName = "Default internal author"

type AuthorService struct {
	Repo                    *r.Repo
	DefaultInternalAuthorID int64
}

func (svc *AuthorService) GetDefaultInternalAuthorInfo(ctx context.Context) (*repo.AuthorInfo, errors.Error) {
	dao := svc.Repo.NonTx(ctx)

	return repo.GetAuthorInfoByID(dao, svc.DefaultInternalAuthorID)
}

func (svc *AuthorService) GetDefaultInternalAuthorID(ctx context.Context) (null.Int, errors.Error) {
	dao := svc.Repo.NonTx(ctx)

	return repo.GetAuthorIDByName(dao, DefaultInternalAuthorName)
}
