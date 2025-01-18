package handler

import (
	"context"
	"github.com/go-chi/chi/v5"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/handler"
	"github.com/sjohna/go-server-common/log"
	"net/http"
	"notes/service"
)

func (h *AuthHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/auth/login", c.Handler(h.Login))
}

type AuthHandler struct {
	Service *service.AuthService
}

// TODO: think about contexts for handlers. Should I include the handler name?
func (h *AuthHandler) Login(ctx context.Context, r *http.Request) (interface{}, errors.Error) {
	var body struct {
		Username string `json:"userName"`
		Password string `json:"password"`
	}

	if err := c.UnmarshalRequestBody(ctx, r, &body); err != nil {
		return nil, err
	}

	token, err := h.Service.LogUserIn(r.Context(), body.Username, body.Password)
	if err != nil {
		return nil, err
	}

	// TODO: think about what I'm logging here...
	log.Ctx(ctx).WithField("username", body.Username).Info("User logged in")

	type response struct {
		Token string `json:"token"`
	}

	return response{Token: token}, nil
}
