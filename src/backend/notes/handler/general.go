package handler

import (
	"context"
	"github.com/go-chi/chi/v5"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/handler"
	"net/http"
	"notes/service"
)

type GeneralHandler struct {
	Service *service.AuthorService
}

func (h *GeneralHandler) ConfigureRoutes(base chi.Router) {
	base.Get("/general/info", c.Handler(h.GetInternalAuthorInfo))
}

// TODO: at some point, this might need to be the current logged in user's info
func (h *GeneralHandler) GetInternalAuthorInfo(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	info, err := h.Service.GetDefaultInternalAuthorInfo(ctx)
	if err != nil {
		return nil, err
	}

	if info == nil {
		return nil, errors.New("No internal author info found!")
	}

	return info, nil
}
