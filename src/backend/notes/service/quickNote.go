package service

import (
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
