package service

import (
	"context"
	"fmt"
	"github.com/sjohna/go-server-common/errors"
	r "github.com/sjohna/go-server-common/repo"
	"notes/common"
	"notes/repo"
)

type NoteService struct {
	Repo *r.Repo
}

func (svc *NoteService) CreateNote(context context.Context, content string) (*repo.Document, errors.Error) {
	var createdNote *repo.Document
	err := svc.Repo.SerializableTx(context, func(tx *r.TxDAO) errors.Error {
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

func (svc *NoteService) GetNotes(context context.Context, parameters common.NoteQueryParameters) ([]*repo.Document, errors.Error) {
	quickNotes, err := repo.GetDocuments(svc.Repo.NonTx(context), parameters)
	if err != nil {
		return nil, err
	}

	return quickNotes, nil
}

func (svc *NoteService) GetTotalNotesOnDays(context context.Context, parameters common.TotalNotesOnDaysQueryParameters) ([]*repo.DocumentsOnDate, errors.Error) {
	quickNotesOnDates, err := repo.GetTotalDocumentsOnDates(svc.Repo.NonTx(context), parameters)
	if err != nil {
		return nil, err
	}

	return quickNotesOnDates, nil
}

func (svc *NoteService) ApplyNoteTagUpdates(context context.Context, documentID int64, updates []common.DocumentTagUpdate) (*repo.Document, errors.Error) {
	err := svc.Repo.SerializableTx(context, func(tx *r.TxDAO) errors.Error {
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

	updatedNote, err := repo.GetDocument(svc.Repo.NonTx(context), documentID)
	if err != nil {
		return nil, err
	}

	return updatedNote, nil
}

func (svc *NoteService) ApplyNoteGroupUpdates(context context.Context, documentID int64, updates []common.DocumentGroupUpdate) (*repo.Document, errors.Error) {
	err := svc.Repo.SerializableTx(context, func(tx *r.TxDAO) errors.Error {
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

	updatedNote, err := repo.GetDocument(svc.Repo.NonTx(context), documentID)
	if err != nil {
		return nil, err
	}

	return updatedNote, nil
}
