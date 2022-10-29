package main

import (
	"fmt"
	"io"
	"net/http"
	"notes/utilities"
	"os"
	"path"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
	"notes/handler"
	"notes/repo"
	"notes/service"

	_ "github.com/lib/pq"
)

func configureBasicLogging() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
}

func configureFileLogging(config *utilities.ApplicationConfig) {
	logrus.SetFormatter(&logrus.JSONFormatter{})

	logfilePath := path.Join(config.LogDirectory, "notes.log")

	fileLogger := &lumberjack.Logger{
		Filename:   logfilePath,
		MaxSize:    100,
		MaxBackups: 10,
		MaxAge:     36500,
		Compress:   false,
	}

	writer := io.MultiWriter(fileLogger, os.Stdout)

	logrus.SetOutput(writer)
}

func main() {
	configureBasicLogging()
	log := logrus.WithField("startup", true)
	log.Info("Startup - basic logging configured")

	config, err := utilities.GetConfigFromEnvFile("local.env")

	if err != nil {
		log.WithError(err).Error("Failed to read application configuration")
		return
	}

	configureFileLogging(config)

	log.Info("Startup - file logging configured")

	db, err := repo.Connect(log, config)
	if err != nil {
		log.WithError(err).Error()
		return
	}

	repoInstance := repo.Repo{DB: db}

	quickNotesService := service.QuickNoteService{Repo: &repoInstance}
	quickNotesHandler := handler.QuickNoteHandler{Service: &quickNotesService}

	tagService := service.TagService{Repo: &repoInstance}
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

	portString := fmt.Sprintf(":%d", config.APIPort)

	log.Infof("Listening on port %d", config.APIPort)

	err = http.ListenAndServe(portString, r)

	if err != nil {
		log.WithError(err).Error("Error returned from http.ListenAndServe")
	}

	log.Info("Done")
}
