package service

import (
	"context"
	"github.com/sjohna/go-server-common/errors"
	r "github.com/sjohna/go-server-common/repo"
	"golang.org/x/sync/errgroup"
	"gopkg.in/guregu/null.v4"
	"notes/common"
	"notes/repo"
)

type TagService struct {
	Repo *r.Repo
}

type TagDetail struct {
	Tag       *repo.Tag        `json:"tag"`
	Documents []*repo.Document `json:"documents"`
}

func (svc *TagService) CreateTag(ctx context.Context, name string, description null.String) (*repo.Tag, errors.Error) {
	createdTagID, err := repo.CreateTag(svc.Repo.NonTx(ctx), name, description)
	if err != nil {
		return nil, err
	}

	createdTag, err := repo.GetTagDetail(svc.Repo.NonTx(ctx), createdTagID)

	return createdTag, nil
}

func (svc *TagService) GetTags(ctx context.Context) ([]*repo.Tag, errors.Error) {
	tags, err := repo.GetTags(svc.Repo.NonTx(ctx))
	if err != nil {
		return nil, err
	}

	return tags, nil
}

func (svc *TagService) GetSingleTag(ctx context.Context, tagID int64) (*TagDetail, errors.Error) {
	eg := new(errgroup.Group)

	var tag *repo.Tag
	var documents []*repo.Document

	dao := svc.Repo.NonTx(ctx)

	eg.Go(func() error {
		var err errors.Error
		tag, err = repo.GetTagDetail(dao, tagID)
		return err
	})

	eg.Go(func() error {
		parameters := common.NoteQueryParameters{
			Tags: []common.TagQueryParameter{
				{
					tagID,
					false,
				},
			},
		}

		documentIDs, err := repo.GetDocumentIDsMatchingFilter(dao, parameters)
		if err != nil {
			return err
		}

		documents, err = repo.GetDocumentsByIDs(dao, documentIDs, parameters)
		return err
	})

	if err := eg.Wait(); err != nil {
		return nil, err.(errors.Error)
	}

	return &TagDetail{
		tag,
		documents,
	}, nil
}
