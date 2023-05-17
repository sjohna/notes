package handler

import (
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"notes/service"
)

type GroupHandler struct {
	Service *service.GroupService
}

func (handler *GroupHandler) ConfigureRoutes(base chi.Router) {
	base.Post("/group/create", handler.CreateGroup)
	base.Post("/group", handler.GetGroups)
}

func (handler *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "CreateGroup")
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

	createdGroup, err := handler.Service.CreateGroup(log, body.Name, body.Description)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdGroup)
}

// TODO: parameterize query
func (handler *GroupHandler) GetGroups(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetGroups")
	defer c.LogHandlerReturn(log)

	groups, err := handler.Service.GetGroups(log)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	// TODO: respond structure
	c.RespondJSON(log, w, groups)
}
