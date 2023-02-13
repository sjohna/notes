package handler

import (
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"net/http"
	"notes/common"
	"notes/repo"
	"notes/service"
)

func (handler *QuickNoteHandler) ConfigureRoutes(base *chi.Mux) {
	base.Post("/quicknote/create", handler.CreateQuickNote)
	base.Post("/quicknote", handler.GetQuickNotes)
	base.Post("/quicknote/total_by_date", handler.GetTotalNotesOnDays)
	base.Post("/quicknote/update_tags", handler.UpdateDocumentTags)
}

type QuickNoteHandler struct {
	Service *service.QuickNoteService
}

func (handler *QuickNoteHandler) CreateQuickNote(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "CreateQuickNote")
	defer c.LogHandlerReturn(log)

	var params struct {
		Content string `json:"content"`
	}

	if err := c.UnmarshalRequestBody(log, r, &params); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	createdNote, err := handler.Service.CreateQuickNote(log, params.Content)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdNote)
}

func (handler *QuickNoteHandler) GetQuickNotes(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetQuickNotes")
	defer c.LogHandlerReturn(log)

	var body common.QuickNoteQueryParameters
	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	quickNotes, err := handler.Service.GetQuickNotes(log, body)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	var response struct {
		Documents  []*repo.Document                `json:"documents"`
		Parameters common.QuickNoteQueryParameters `json:"parameters"`
	}

	response.Documents = quickNotes
	response.Parameters = body

	c.RespondJSON(log, w, response)
}

func (handler *QuickNoteHandler) GetTotalNotesOnDays(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetTotalNotesOnDays")
	defer c.LogHandlerReturn(log)

	var body common.TotalNotesOnDaysQueryParameters
	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	totalNotesOnDays, err := handler.Service.GetTotalNotesOnDays(log, body)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, totalNotesOnDays)
}

func (handler *QuickNoteHandler) UpdateDocumentTags(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "UpdateDocumentTags")
	defer c.LogHandlerReturn(log)

	var body struct {
		DocumentID int64                      `json:"documentId"`
		TagUpdates []common.DocumentTagUpdate `json:"tagUpdates"`
	}
	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	document, err := handler.Service.ApplyDocumentTagUpdates(log, body.DocumentID, body.TagUpdates)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, document)
}
