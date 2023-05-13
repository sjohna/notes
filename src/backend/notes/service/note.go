package service

import (
	"errors"
	"github.com/sirupsen/logrus"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"notes/common"
	"notes/repo"
)

type NoteService struct {
	Repo *r.Repo
}

func (svc *NoteService) CreateNote(logger *logrus.Entry, content string) (*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "CreateNote")
	defer c.LogServiceReturn(log)

	var createdNote *repo.Document
	err := svc.Repo.SerializableTx(log, func(tx *r.TxDAO) error {
		var err error
		createdNote, err = repo.CreateDocument(tx, "quick_note", content)
		if err != nil {
			log.WithError(err).Error()
			return err
		}

		return nil
	})
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	log.WithField("documentID", createdNote.ID).Infof("Created quick note ID %d", createdNote.ID)
	return createdNote, nil
}

func (svc *NoteService) GetNotes(logger *logrus.Entry, parameters common.NoteQueryParameters) ([]*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "GetNotes")
	defer c.LogServiceReturn(log)

	quickNotes, err := repo.GetDocuments(svc.Repo.NonTx(log), parameters)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}

func (svc *NoteService) GetTotalNotesOnDays(logger *logrus.Entry, parameters common.TotalNotesOnDaysQueryParameters) ([]*repo.DocumentsOnDate, error) {
	log := c.ServiceFunctionLogger(logger, "GetTotalNotesOnDays")
	defer c.LogServiceReturn(log)

	quickNotesOnDates, err := repo.GetTotalDocumentsOnDates(svc.Repo.NonTx(log), parameters)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotesOnDates, nil
}

func (svc *NoteService) ApplyNoteTagUpdates(logger *logrus.Entry, documentID int64, updates []common.DocumentTagUpdate) (*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "ApplyNoteTagUpdates")
	defer c.LogServiceReturn(log)

	err := svc.Repo.SerializableTx(log, func(tx *r.TxDAO) error {
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
				log.Errorf("Invalid DocumentMetadataUpdateType: %d", update.UpdateType)
				return errors.New("invalid DocumentMetadataUpdateType")
			}
		}

		return nil
	})

	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	successLog := log.WithField("documentID", documentID)
	for _, update := range updates {
		if update.UpdateType == common.DocumentMetadataUpdateAdd {
			successLog.WithField("tagID", update.TagID).Infof("Added tag %d to document %d", update.TagID, documentID)
		} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
			successLog.WithField("tagID", update.TagID).Infof("Removed tag %d from document %d", update.TagID, documentID)
		}
	}

	updatedNote, err := repo.GetDocument(svc.Repo.NonTx(log), documentID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return updatedNote, nil
}

func (svc *NoteService) ApplyNoteGroupUpdates(logger *logrus.Entry, documentID int64, updates []common.DocumentDocumentGroupUpdate) (*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "ApplyNoteGroupUpdates")
	defer c.LogServiceReturn(log)

	err := svc.Repo.SerializableTx(log, func(tx *r.TxDAO) error {
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
				log.Errorf("Invalid DocumentMetadataUpdateType: %d", update.UpdateType)
				return errors.New("invalid DocumentMetadataUpdateType")
			}
		}

		return nil
	})

	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	successLog := log.WithField("documentID", documentID)
	for _, update := range updates {
		if update.UpdateType == common.DocumentMetadataUpdateAdd {
			successLog.WithField("documentGroupID", update.DocumentGroupID).Infof("Added document group %d to document %d", update.DocumentGroupID, documentID)
		} else if update.UpdateType == common.DocumentMetadataUpdateRemove {
			successLog.WithField("documentGroupID", update.DocumentGroupID).Infof("Removed document group %d from document %d", update.DocumentGroupID, documentID)
		}
	}

	updatedNote, err := repo.GetDocument(svc.Repo.NonTx(log), documentID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return updatedNote, nil
}
