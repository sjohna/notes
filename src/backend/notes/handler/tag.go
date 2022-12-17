package handler

import (
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"notes/service"
)

func (handler *TagHandler) ConfigureRoutes(base *chi.Mux) {
	base.Post("/tag", handler.CreateTag)
	base.Get("/tag", handler.GetTags)
}

type TagHandler struct {
	Service *service.TagService
}

func (handler *TagHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "CreateTag")
	defer c.LogHandlerReturn(log)

	var body struct {
		Name        string      `json:"name"`
		Description null.String `json:"description"`
		Color       string      `json:"color"`
	}

	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	createdTag, err := handler.Service.CreateTag(log, body.Name, body.Description, body.Color)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdTag)
}

func (handler *TagHandler) GetTags(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetTags")
	defer c.LogHandlerReturn(log)

	tags, err := handler.Service.GetTags(log)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, tags)
}
