package service

import (
	"errors"
	"github.com/sirupsen/logrus"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"notes/common"
	"notes/repo"
)

type QuickNoteService struct {
	Repo *r.Repo
}

func (svc *QuickNoteService) CreateQuickNote(logger *logrus.Entry, content string) (*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "CreateQuickNote")
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

func (svc *QuickNoteService) GetQuickNotes(logger *logrus.Entry, parameters common.QuickNoteQueryParameters) ([]*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "GetQuickNotes")
	defer c.LogServiceReturn(log)

	quickNotes, err := repo.GetQuickNotes(svc.Repo.NonTx(log), parameters)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}

func (svc *QuickNoteService) GetTotalNotesOnDays(logger *logrus.Entry, parameters common.TotalNotesOnDaysQueryParameters) ([]*repo.DocumentsOnDate, error) {
	log := c.ServiceFunctionLogger(logger, "GetTotalNotesOnDays")
	defer c.LogServiceReturn(log)

	quickNotesOnDates, err := repo.GetTotalDocumentsOnDates(svc.Repo.NonTx(log), parameters)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotesOnDates, nil
}

func (svc *QuickNoteService) ApplyDocumentTagUpdates(logger *logrus.Entry, documentID int64, updates []common.DocumentTagUpdate) (*repo.Document, error) {
	log := c.ServiceFunctionLogger(logger, "ApplyDocumentTagUpdates")
	defer c.LogServiceReturn(log)

	err := svc.Repo.SerializableTx(log, func(tx *r.TxDAO) error {
		for _, update := range updates {
			if update.UpdateType == common.DocumentTagUpdateAdd {
				err := repo.AddDocumentTag(tx, documentID, update.TagID)
				if err != nil {
					return err
				}
			} else if update.UpdateType == common.DocumentTagUpdateRemove {
				err := repo.RemoveDocumentTag(tx, documentID, update.TagID)
				if err != nil {
					return err
				}
			} else {
				log.Errorf("Invalid DocumentTagUpdateType: %d", update.UpdateType)
				return errors.New("invalid DocumentTagUpdateType")
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
		if update.UpdateType == common.DocumentTagUpdateAdd {
			successLog.WithField("tagID", update.TagID).Infof("Added tag %d to document %d", update.TagID, documentID)
		} else if update.UpdateType == common.DocumentTagUpdateRemove {
			successLog.WithField("tagID", update.TagID).Infof("Removed tag %d from document %d", update.TagID, documentID)
		}
	}

	document, err := repo.GetQuickNote(svc.Repo.NonTx(log), documentID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return document, nil
}
