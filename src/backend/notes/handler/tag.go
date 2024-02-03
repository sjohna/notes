package handler

import (
	"github.com/go-chi/chi/v5"
	c "github.com/sjohna/go-server-common/handler"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"notes/service"
)

func (handler *TagHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/tag/create", handler.CreateTag)
	base.Post("/tag", handler.GetTags)
}

type TagHandler struct {
	Service *service.TagService
}

func (handler *TagHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "CreateTag")
	defer c.LogHandlerReturn(log)

	var body struct {
		Name        string      `json:"name"`
		Description null.String `json:"description"`
	}

	if err := c.UnmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	log = log.WithFields(map[string]interface{}{
		"name":        body.Name,
		"description": body.Description,
	})
	log.Debug("Creating tag")

	createdTag, err := handler.Service.CreateTag(handlerContext, body.Name, body.Description)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdTag)
}

func (handler *TagHandler) GetTags(w http.ResponseWriter, r *http.Request) {
	handlerContext, log := c.HandlerContext(r, "GetTags")
	defer c.LogHandlerReturn(log)

	tags, err := handler.Service.GetTags(handlerContext)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	log.WithField("count", len(tags)).Debug("Got tags")

	c.RespondJSON(log, w, tags)
}
