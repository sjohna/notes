package handler

import (
	"github.com/go-chi/chi"
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
	log := handlerLogger(r, "CreateTag")
	defer logHandlerReturn(log)

	var body struct {
		Name        string      `json:"name"`
		Description null.String `json:"description"`
		Color       string      `json:"color"`
	}

	if err := unmarshalRequestBody(log, r, &body); err != nil {
		// TODO: respond client error instead
		respondInternalServerError(log, w, err)
	}

	createdTag, err := handler.Service.CreateTag(log, body.Name, body.Description, body.Color)
	if err != nil {
		respondInternalServerError(log, w, err)
		return
	}

	respondJSON(log, w, createdTag)
}

func (handler *TagHandler) GetTags(w http.ResponseWriter, r *http.Request) {
	log := handlerLogger(r, "GetTags")
	defer logHandlerReturn(log)

	tags, err := handler.Service.GetTags(log)
	if err != nil {
		respondInternalServerError(log, w, err)
		return
	}

	respondJSON(log, w, tags)
}