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

	quickNote, err := repo.CreateDocument(svc.Repo.NonTx(log), "quick_note", content)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNote, nil
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
