package handler

import (
	"context"
	"github.com/go-chi/chi/v5"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/handler"
	"github.com/sjohna/go-server-common/log"
	"net/http"
	"notes/common"
	"notes/repo"
	"notes/service"
	"strconv"
)

func (h *NoteHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/note", c.Handler(h.GetNotes))
	base.Get("/note/{id}", c.Handler(h.GetSingleNote))
	base.Get("/note/{documentId}/version/{versionId}", c.Handler(h.GetNoteVersion))
	base.Post("/note/create", c.Handler(h.CreateNote))
	base.Post("/note/total_by_date", c.Handler(h.GetTotalNotesOnDays))
	base.Post("/note/update_tags", c.Handler(h.UpdateNoteTags))
	base.Post("/note/update_groups", c.Handler(h.UpdateNoteGroups))
}

type NoteHandler struct {
	Service *service.NoteService
}

func (h *NoteHandler) CreateNote(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body struct {
		Content string `json:"content"`
	}

	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	createdNote, err := h.Service.CreateNote(r.Context(), body.Content)
	if err != nil {
		return nil, err
	}

	return createdNote, nil
}

func (h *NoteHandler) GetNotes(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body common.NoteQueryParameters
	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	quickNotes, err := h.Service.GetNotes(ctx, body)
	if err != nil {
		return nil, err
	}

	var response struct {
		Documents  []*repo.Document           `json:"documents"`
		Parameters common.NoteQueryParameters `json:"parameters"`
	}

	response.Documents = quickNotes
	response.Parameters = body

	return response, nil
}

func (h *NoteHandler) GetSingleNote(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.NewInput("Invalid id")
	}

	return h.Service.GetSingleDocument(ctx, int64(id))
}

func (h *NoteHandler) GetNoteVersion(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	documentIDStr := chi.URLParam(r, "documentId")
	documentID, err := strconv.Atoi(documentIDStr)
	if err != nil {
		return nil, errors.NewInput("Invalid document id")
	}

	versionIDStr := chi.URLParam(r, "versionId")
	versionID, err := strconv.Atoi(versionIDStr)
	if err != nil {
		return nil, errors.NewInput("Invalid version id")
	}

	return h.Service.GetDocumentVersion(ctx, int64(documentID), int64(versionID))
}

func (h *NoteHandler) GetTotalNotesOnDays(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body common.TotalNotesOnDaysQueryParameters
	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	totalNotesOnDays, err := h.Service.GetTotalNotesOnDays(r.Context(), body)
	if err != nil {
		return nil, err
	}

	return totalNotesOnDays, nil
}

func (h *NoteHandler) UpdateNoteTags(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body struct {
		DocumentID int64                      `json:"documentId"`
		TagUpdates []common.DocumentTagUpdate `json:"tagUpdates"`
	}
	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	log.Ctx(ctx).WithField("documentId", body.DocumentID).Info("Updating note tags")

	document, err := h.Service.ApplyNoteTagUpdates(r.Context(), body.DocumentID, body.TagUpdates)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		return nil, err
	}

	return document, nil
}

func (h *NoteHandler) UpdateNoteGroups(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body struct {
		DocumentID   int64                        `json:"documentId"`
		GroupUpdates []common.DocumentGroupUpdate `json:"groupUpdates"`
	}
	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	log.Ctx(ctx).WithField("documentId", body.DocumentID).Info("Updating note groups")

	document, err := h.Service.ApplyNoteGroupUpdates(r.Context(), body.DocumentID, body.GroupUpdates)
	if err != nil { // TODO: with this and all other errors, handle 400 vs. 500 errors
		return nil, err
	}

	return document, nil
}
