package handler

import (
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"net/http"
	"notes/service"
)

func (handler *AuthHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/auth/login", handler.Login)
}

type AuthHandler struct {
	Service *service.AuthService
}

func (handler *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "Login")
	defer c.LogHandlerReturn(log)

	var body struct {
		Username string `json:"userName"`
		Password string `json:"password"`
	}

	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	token, err := handler.Service.LogUserIn(log, body.Username, body.Password)
	if err != nil {
		// TODO: differentiate error here: it could be auth-related
		c.RespondInternalServerError(log, w, err)
		return
	}

	type response struct {
		Token string `json:"token"`
	}

	c.RespondJSON(log, w, response{Token: token})
}
