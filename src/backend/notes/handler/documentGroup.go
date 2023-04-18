package handler

import (
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"notes/service"
)

type DocumentGroupHandler struct {
	Service *service.DocumentGroupService
}

func (handler *DocumentGroupHandler) ConfigureRoutes(base *chi.Mux) {
	base.Post("/document_group/create", handler.CreateDocumentGroup)
	base.Post("/document_group", handler.GetDocumentGroups)
}

func (handler *DocumentGroupHandler) CreateDocumentGroup(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "CreateDocumentGroup")
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

	createdDocumentGroup, err := handler.Service.CreateDocumentGroup(log, body.Name, body.Description)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdDocumentGroup)
}

// TODO: parameterize query
func (handler *DocumentGroupHandler) GetDocumentGroups(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetDocumentGroups")
	defer c.LogHandlerReturn(log)

	documentGroups, err := handler.Service.GetDocumentGroups(log)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	// TODO: respond structure
	c.RespondJSON(log, w, documentGroups)
}
