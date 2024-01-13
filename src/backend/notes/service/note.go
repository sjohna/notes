package service

import (
	"context"
	"errors"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"notes/common"
	"notes/repo"
)

type NoteService struct {
	Repo *r.Repo
}

func (svc *NoteService) CreateNote(context context.Context, content string) (*repo.Document, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "CreateNote")
	defer c.LogServiceReturn(log)

	log.Infof("Creating note (length %d)", len(content))

	var createdNote *repo.Document
	err := svc.Repo.SerializableTx(serviceContext, func(tx *r.TxDAO) error {
		var err error
		createdNote, err = repo.CreateDocument(tx, "quick_note", content)
		if err != nil {
			log.WithError(err).Error("Error creating document")
			return err
		}

		return nil
	})
	if err != nil {
		log.WithError(err).Error("Error creating note")
		return nil, err
	}

	log.WithField("documentID", createdNote.ID).Infof("Created note ID %d", createdNote.ID)
	return createdNote, nil
}

func (svc *NoteService) GetNotes(context context.Context, parameters common.NoteQueryParameters) ([]*repo.Document, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "GetNotes")
	defer c.LogServiceReturn(log)

	quickNotes, err := repo.GetDocuments(svc.Repo.NonTx(serviceContext), parameters)
	if err != nil {
		log.WithError(err).Error("Error getting documents")
		return nil, err
	}

	return quickNotes, nil
}

func (svc *NoteService) GetTotalNotesOnDays(context context.Context, parameters common.TotalNotesOnDaysQueryParameters) ([]*repo.DocumentsOnDate, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "GetTotalNotesOnDays")
	defer c.LogServiceReturn(log)

	quickNotesOnDates, err := repo.GetTotalDocumentsOnDates(svc.Repo.NonTx(serviceContext), parameters)
	if err != nil {
		log.WithError(err).Error("Error getting total documents on dates")
		return nil, err
	}

	return quickNotesOnDates, nil
}

func (svc *NoteService) ApplyNoteTagUpdates(context context.Context, documentID int64, updates []common.DocumentTagUpdate) (*repo.Document, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "ApplyNoteTagUpdates")
	defer c.LogServiceReturn(log)

	log = log.WithField("documentID", documentID)

	err := svc.Repo.SerializableTx(serviceContext, func(tx *r.TxDAO) error {
		for _, update := range updates {
			if update.UpdateType == common.DocumentMetadataUpdateAdd {
				err := repo.AddDocumentTag(tx, documentID, update.TagID)
				if err != nil {
					log.WithField("tagUpdate", update).WithError(err).Error("Error adding document tag")
					return err
				}
			} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
				err := repo.RemoveDocumentTag(tx, documentID, update.TagID)
				if err != nil {
					log.WithField("tagUpdate", update).WithError(err).Error("Error removing document tag")
					return err
				}
			} else {
				log.Errorf("Invalid DocumentMetadataUpdateType: %d", update.UpdateType)
				return errors.New("invalid DocumentMetadataUpdateType")
			}
		}

		return nil
	})

	if err != nil {
		log.WithError(err).Error("Error applying document tag updates")
		return nil, err
	}

	for _, update := range updates {
		if update.UpdateType == common.DocumentMetadataUpdateAdd {
			log.WithField("tagID", update.TagID).Infof("Added tag %d to document %d", update.TagID, documentID)
		} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
			log.WithField("tagID", update.TagID).Infof("Removed tag %d from document %d", update.TagID, documentID)
		}
	}

	updatedNote, err := repo.GetDocument(svc.Repo.NonTx(serviceContext), documentID)
	if err != nil {
		log.WithError(err).Error("Error getting document")
		return nil, err
	}

	return updatedNote, nil
}

func (svc *NoteService) ApplyNoteGroupUpdates(context context.Context, documentID int64, updates []common.DocumentGroupUpdate) (*repo.Document, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "ApplyNoteGroupUpdates")
	defer c.LogServiceReturn(log)

	log = log.WithField("documentID", documentID)

	err := svc.Repo.SerializableTx(serviceContext, func(tx *r.TxDAO) error {
		for _, update := range updates {
			if update.UpdateType == common.DocumentMetadataUpdateAdd {
				err := repo.AddDocumentToGroup(tx, documentID, update.DocumentGroupID)
				if err != nil {
					log.WithField("groupUpdate", update).WithError(err).Error("Error adding document to group")
					return err
				}
			} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
				err := repo.RemoveDocumentFromGroup(tx, documentID, update.DocumentGroupID)
				if err != nil {
					log.WithField("groupUpdate", update).WithError(err).Error("Error removing document from group")
					return err
				}
			} else {
				log.Errorf("Invalid DocumentMetadataUpdateType: %d", update.UpdateType)
				return errors.New("invalid DocumentMetadataUpdateType")
			}
		}

		return nil
	})

	if err != nil {
		log.WithError(err).Error("Error applying document group updates")
		return nil, err
	}

	for _, update := range updates {
		if update.UpdateType == common.DocumentMetadataUpdateAdd {
			log.WithField("documentGroupID", update.DocumentGroupID).Infof("Added document group %d to document %d", update.DocumentGroupID, documentID)
		} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
			log.WithField("documentGroupID", update.DocumentGroupID).Infof("Removed document group %d from document %d", update.DocumentGroupID, documentID)
		}
	}

	updatedNote, err := repo.GetDocument(svc.Repo.NonTx(serviceContext), documentID)
	if err != nil {
		log.WithError(err).Error("Error getting document")
		return nil, err
	}

	return updatedNote, nil
}
