package handler

import (
	"fmt"
	"github.com/go-chi/chi"
	c "github.com/sjohna/go-server-common/handler"
	"net/http"
	"notes/repo"
	"notes/service"
	"time"
)

func (handler *QuickNoteHandler) ConfigureRoutes(base *chi.Mux) {
	base.Post("/quicknote", handler.CreateQuickNote)
	base.Get("/quicknote", handler.GetQuickNotes)
	base.Get("/quicknote/daterange", handler.GetNotesInDateRange)
}

type QuickNoteHandler struct {
	Service *service.QuickNoteService
}

func (handler *QuickNoteHandler) CreateQuickNote(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "CreateQuickNote")
	defer c.LogHandlerReturn(log)

	var params struct {
		Content string `json:"content"`
	}

	if err := c.UnmarshalRequestBody(log, r, &params); err != nil {
		// TODO: respond client error instead
		c.RespondInternalServerError(log, w, err)
		return
	}

	createdNote, err := handler.Service.CreateQuickNote(log, params.Content)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, createdNote)
}

func (handler *QuickNoteHandler) GetQuickNotes(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetQuickNotes")
	defer c.LogHandlerReturn(log)

	quickNotes, err := handler.Service.GetQuickNotes(log)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	c.RespondJSON(log, w, quickNotes)
}

type QuickNotesForDate struct {
	Date  string           `json:"date"`
	Notes []*repo.Document `json:"notes"`
}

func (handler *QuickNoteHandler) GetNotesInDateRange(w http.ResponseWriter, r *http.Request) {
	log := c.HandlerLogger(r, "GetNotesInDateRange")
	defer c.LogHandlerReturn(log)

	begin := r.URL.Query().Get("begin")
	end := r.URL.Query().Get("end")

	if begin == "" {
		// TODO: better error handling
		log.Error("No value provided for begin")
		w.WriteHeader(400)
		return
	}

	if end == "" {
		// TODO: better error handling
		log.Error("No value provided for end")
		w.WriteHeader(400)
		return
	}

	beginT, err := time.Parse("2006-01-02", begin)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	endT, err := time.Parse("2006-01-02", end)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	// TODO: store local timezone in DB?
	localTimeZone, err := time.LoadLocation("America/Denver")
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	beginTLocal := time.Date(beginT.Year(), beginT.Month(), beginT.Day(), 0, 0, 0, 0, localTimeZone)
	endTLocal := time.Date(endT.Year(), endT.Month(), endT.Day(), 0, 0, 0, 0, localTimeZone)
	endTLocal = endTLocal.AddDate(0, 0, 1)

	quickNotes, err := handler.Service.GetQuickNotesInTimeRange(log, beginTLocal, endTLocal)
	if err != nil {
		c.RespondInternalServerError(log, w, err)
		return
	}

	ret := make([]QuickNotesForDate, 0)

	if len(quickNotes) > 0 {
		firstNoteLocalTime := quickNotes[0].CreatedAt.In(localTimeZone)
		firstNoteDate := fmt.Sprintf("%04d-%02d-%02d", firstNoteLocalTime.Year(), firstNoteLocalTime.Month(), firstNoteLocalTime.Day())

		currDay := QuickNotesForDate{
			Date:  firstNoteDate,
			Notes: make([]*repo.Document, 0),
		}

		for _, note := range quickNotes {
			noteLocalTime := note.CreatedAt.In(localTimeZone)
			noteDate := fmt.Sprintf("%04d-%02d-%02d", noteLocalTime.Year(), noteLocalTime.Month(), noteLocalTime.Day())

			if noteDate != currDay.Date {
				ret = append(ret, currDay)
				currDay = QuickNotesForDate{
					Date:  noteDate,
					Notes: make([]*repo.Document, 0),
				}
			}

			currDay.Notes = append(currDay.Notes, note)
		}

		ret = append(ret, currDay)
	}

	c.RespondJSON(log, w, ret)
}
