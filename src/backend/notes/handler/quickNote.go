package handler

import (
	"github.com/go-chi/chi"
	"net/http"
	"notes/service"
)

func (handler *QuickNoteHandler) ConfigureRoutes(base *chi.Mux) {
	base.Post("/quicknote", handler.CreateQuickNote)
	base.Get("/quicknote", handler.GetQuickNotes)
}

type QuickNoteHandler struct {
	Service *service.QuickNoteService
}

func (handler *QuickNoteHandler) CreateQuickNote(w http.ResponseWriter, r *http.Request) {
	log := handlerLogger(r, "CreateQuickNote")
	defer logHandlerReturn(log)

	var params struct {
		Content string `json:"content"`
	}

	if err := unmarshalRequestBody(log, r, &params); err != nil {
		// TODO: respond client error instead
		respondInternalServerError(log, w, err)
	}

	createdNote, err := handler.Service.CreateQuickNote(log, params.Content)
	if err != nil {
		respondInternalServerError(log, w, err)
		return
	}

	respondJSON(log, w, createdNote)
}

func (handler *QuickNoteHandler) GetQuickNotes(w http.ResponseWriter, r *http.Request) {
	log := handlerLogger(r, "GetQuickNotes")
	defer logHandlerReturn(log)

	quickNotes, err := handler.Service.GetQuickNotes(log)
	if err != nil {
		respondInternalServerError(log, w, err)
		return
	}

	respondJSON(log, w, quickNotes)

}
