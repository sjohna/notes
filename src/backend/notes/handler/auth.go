package handler

import (
	"github.com/go-chi/chi/v5"
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
	handlerContext, log := c.HandlerContext(r, "Login")
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

	log = log.WithField("userName", body.Username)
	log.Info("Attempting user login")

	token, err := handler.Service.LogUserIn(handlerContext, body.Username, body.Password)
	if err != nil {
		// TODO: differentiate error here: it could be auth-related
		c.RespondInternalServerError(log, w, err)
		return
	}

	log.Info("User logged in")

	type response struct {
		Token string `json:"token"`
	}

	c.RespondJSON(log, w, response{Token: token})
}
