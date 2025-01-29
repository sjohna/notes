package service

import (
	"context"
	"fmt"
	"github.com/sjohna/go-server-common/errors"
	r "github.com/sjohna/go-server-common/repo"
	"golang.org/x/sync/errgroup"
	"notes/common"
	"notes/repo"
)

type NoteService struct {
	Repo *r.Repo
}

func (svc *NoteService) CreateNote(ctx context.Context, content string) (*repo.Document, errors.Error) {
	var createdNote *repo.Document
	err := svc.Repo.SerializableTx(ctx, func(tx *r.TxDAO) errors.Error {
		var err errors.Error
		createdNote, err = repo.CreateDocument(tx, "quick_note", content)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return createdNote, nil
}

func (svc *NoteService) GetNotes(ctx context.Context, parameters common.NoteQueryParameters) ([]*repo.Document, errors.Error) {
	return repo.GetDocuments(svc.Repo.NonTx(ctx), parameters)
}

func (svc *NoteService) GetTotalNotesOnDays(ctx context.Context, parameters common.TotalNotesOnDaysQueryParameters) ([]*repo.DocumentsOnDate, errors.Error) {
	return repo.GetTotalDocumentsOnDates(svc.Repo.NonTx(ctx), parameters)
}

func (svc *NoteService) ApplyNoteTagUpdates(ctx context.Context, documentID int64, updates []common.DocumentTagUpdate) (*repo.Document, errors.Error) {
	err := svc.Repo.SerializableTx(ctx, func(tx *r.TxDAO) errors.Error {
		for _, update := range updates {
			if update.UpdateType == common.DocumentMetadataUpdateAdd {
				err := repo.AddDocumentTag(tx, documentID, update.TagID)
				if err != nil {
					return err
				}
			} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
				err := repo.RemoveDocumentTag(tx, documentID, update.TagID)
				if err != nil {
					return err
				}
			} else {
				return errors.New(fmt.Sprintf("invalid DocumentMetadataUpdateType: %d", update.UpdateType))
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	updatedNote, err := repo.GetDocumentByID(svc.Repo.NonTx(ctx), documentID)
	if err != nil {
		return nil, err
	}

	return updatedNote, nil
}

func (svc *NoteService) ApplyNoteGroupUpdates(ctx context.Context, documentID int64, updates []common.DocumentGroupUpdate) (*repo.Document, errors.Error) {
	err := svc.Repo.SerializableTx(ctx, func(tx *r.TxDAO) errors.Error {
		for _, update := range updates {
			if update.UpdateType == common.DocumentMetadataUpdateAdd {
				err := repo.AddDocumentToGroup(tx, documentID, update.DocumentGroupID)
				if err != nil {
					return err
				}
			} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
				err := repo.RemoveDocumentFromGroup(tx, documentID, update.DocumentGroupID)
				if err != nil {
					return err
				}
			} else {
				return errors.New(fmt.Sprintf("invalid DocumentMetadataUpdateType: %d", update.UpdateType))
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	updatedNote, err := repo.GetDocumentByID(svc.Repo.NonTx(ctx), documentID)
	if err != nil {
		return nil, err
	}

	return updatedNote, nil
}

type DocumentDetails struct {
	Document       repo.Document                 `json:"document"`
	VersionHistory []repo.DocumentVersionSummary `json:"versionHistory"`
}

func (svc *NoteService) GetSingleDocument(ctx context.Context, documentID int64) (*DocumentDetails, errors.Error) {
	eg := new(errgroup.Group)

	var document *repo.Document
	var versionHistory []repo.DocumentVersionSummary

	dao := svc.Repo.NonTx(ctx)

	eg.Go(func() error {
		var err errors.Error
		document, err = repo.GetDocumentByID(dao, documentID)
		return err
	})

	eg.Go(func() error {
		var err errors.Error
		versionHistory, err = repo.GetDocumentVersionHistory(dao, documentID)
		return err
	})

	if err := eg.Wait(); err != nil {
		return nil, err.(errors.Error)
	}

	if document == nil {
		return nil, nil
	}

	return &DocumentDetails{
		*document,
		versionHistory,
	}, nil
}

func (svc *NoteService) GetDocumentVersion(ctx context.Context, documentID int64, version int64) (*repo.DocumentContent, errors.Error) {
	return repo.GetDocumentVersion(svc.Repo.NonTx(ctx), documentID, version)
}
