package handler

import (
	"context"
	"github.com/go-chi/chi/v5"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/handler"
	"github.com/sjohna/go-server-common/log"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"notes/service"
	"strconv"
)

func (h *TagHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/tag/create", c.Handler(h.CreateTag))
	base.Post("/tag", c.Handler(h.GetTags))
	base.Get("/tag/{id}", c.Handler(h.GetSingleTag))
}

type TagHandler struct {
	Service *service.TagService
}

func (h *TagHandler) CreateTag(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body struct {
		Name        string      `json:"name"`
		Description null.String `json:"description"`
	}

	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	createdTag, err := h.Service.CreateTag(r.Context(), body.Name, body.Description)
	if err != nil {
		return nil, err
	}

	return createdTag, nil
}

func (h *TagHandler) GetTags(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	tags, err := h.Service.GetTags(ctx)
	if err != nil {
		return nil, err
	}

	log.General.WithField("count", len(tags)).Debug("Got tags")

	return tags, nil
}

func (h *TagHandler) GetSingleTag(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.NewInput("Invalid id")
	}

	return h.Service.GetSingleTag(ctx, int64(id))
}
