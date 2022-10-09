package main

import (
	"io"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
	"notes/handler"
	"notes/repo"
	"notes/service"

	_ "github.com/lib/pq"
)

func configureLogging() {
	logrus.SetFormatter(&logrus.JSONFormatter{})

	fileLogger := &lumberjack.Logger{
		Filename:   "./notes.log",
		MaxSize:    100,
		MaxBackups: 5,
		MaxAge:     365,
		Compress:   false,
	}

	writer := io.MultiWriter(fileLogger, os.Stdout)

	logrus.SetOutput(writer)

	logrus.WithField("startup", true).Info("Logging configured")
}

func main() {
	configureLogging()
	log := logrus.WithField("startup", true)
	log.Info("Starting up")

	db, err := repo.Connect("localhost", "notes-dev")
	if err != nil {
		log.WithError(err).Error()
		return
	}

	repo := repo.Repo{DB: db}

	quickNotesService := service.QuickNoteService{Repo: &repo}
	quickNotesHandler := handler.QuickNoteHandler{Service: &quickNotesService}

	tagService := service.TagService{Repo: &repo}
	tagHandler := handler.TagHandler{Service: &tagService}

	// init chi

	r := chi.NewRouter()

	// cors
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Use(handler.LogRequestContext)
	quickNotesHandler.ConfigureRoutes(r)
	tagHandler.ConfigureRoutes(r)

	log.Info("Listening on port 3000")

	http.ListenAndServe(":3000", r)

	log.Info("Done")
}
