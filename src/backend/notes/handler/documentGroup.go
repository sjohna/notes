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
)

type GroupHandler struct {
	Service *service.GroupService
}

func (h *GroupHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/group/create", c.Handler(h.CreateGroup))
	base.Post("/group", c.Handler(h.GetGroups))
}

func (h *GroupHandler) CreateGroup(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body struct {
		Name        string      `json:"name"`
		Description null.String `json:"description"`
	}

	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	createdGroup, err := h.Service.CreateGroup(r.Context(), body.Name, body.Description)
	if err != nil {
		return nil, err
	}

	log.Ctx(ctx).WithField("groupID", createdGroup.ID).Info("Created group")

	return createdGroup, nil
}

// TODO: parameterize query
func (h *GroupHandler) GetGroups(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	groups, err := h.Service.GetGroups(ctx)
	if err != nil {
		return nil, err
	}

	// TODO: respond structure
	return groups, nil
}
