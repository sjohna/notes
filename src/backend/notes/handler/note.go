package handler

import (
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"net/http"
	"notes/common"
	"notes/repo"
	"notes/service"
)

func (handler *NoteHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/note/create", handler.CreateNote)
	base.Post("/note", handler.GetNotes)
	base.Post("/note/total_by_date", handler.GetTotalNotesOnDays)
	base.Post("/note/update_tags", handler.UpdateNoteTags)
	base.Post("/note/update_groups", handler.UpdateNoteGroups)
}

type NoteHandler struct {
	Service *service.NoteService
}

func (handler *NoteHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "CreateNote")
	defer c.LogHandlerReturn(log)

	var params struct {
		Content string `json:"content"`
	}

	if err := c.UnmarshalRequestBody(log, r, &params); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	log.WithField("contentLength", len(params.Content)).Debug("Creating note")

	createdNote, err := handler.Service.CreateNote(handlerContext, params.Content)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdNote)
}

func (handler *NoteHandler) GetNotes(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "GetNotes")
	defer c.LogHandlerReturn(log)

	var body common.NoteQueryParameters
	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	quickNotes, err := handler.Service.GetNotes(handlerContext, body)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	var response struct {
		Documents  []*repo.Document           `json:"documents"`
		Parameters common.NoteQueryParameters `json:"parameters"`
	}

	response.Documents = quickNotes
	response.Parameters = body

	c.RespondJSON(log, w, response)
}

func (handler *NoteHandler) GetTotalNotesOnDays(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "GetTotalNotesOnDays")
	defer c.LogHandlerReturn(log)

	var body common.TotalNotesOnDaysQueryParameters
	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	totalNotesOnDays, err := handler.Service.GetTotalNotesOnDays(handlerContext, body)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, totalNotesOnDays)
}

func (handler *NoteHandler) UpdateNoteTags(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "UpdateNoteTags")
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

	log = log.WithField("documentId", body.DocumentID)
	log.Info("Updating note tags")

	document, err := handler.Service.ApplyNoteTagUpdates(handlerContext, body.DocumentID, body.TagUpdates)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, document)
}

func (handler *NoteHandler) UpdateNoteGroups(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "UpdateNoteGroups")
	defer c.LogHandlerReturn(log)

	var body struct {
		DocumentID   int64                        `json:"documentId"`
		GroupUpdates []common.DocumentGroupUpdate `json:"groupUpdates"`
	}
	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	log = log.WithField("documentId", body.DocumentID)
	log.Info("Updating note groups")

	document, err := handler.Service.ApplyNoteGroupUpdates(handlerContext, body.DocumentID, body.GroupUpdates)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, document)
}
