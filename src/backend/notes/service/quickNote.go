package service

import (
	"github.com/sirupsen/logrus"
	"notes/repo"
)

type QuickNoteService struct {
	Repo *repo.Repo
}

func (svc *QuickNoteService) CreateQuickNote(logger *logrus.Entry, content string) (*repo.Document, error) {
	log := serviceFunctionLogger(logger, "CreateQuickNote")
	defer logServiceReturn(log)

	var createdNote *repo.Document
	err := svc.Repo.SerializableTx(log, func(tx *repo.TxDAO) error {
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

	return createdNote, nil
}

func (svc *QuickNoteService) GetQuickNotes(logger *logrus.Entry) ([]*repo.Document, error) {
	log := serviceFunctionLogger(logger, "CreateQuickNote")
	defer logServiceReturn(log)

	quickNotes, err := repo.GetQuickNotes(svc.Repo.NonTx(log))
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}
