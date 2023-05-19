package main

import (
	"flag"
	"fmt"
	r "github.com/sjohna/go-server-common/repo"
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

// TODO: look at logging at all levels (handler, service, repo): am I logging everything relevant?
// TODO: review and update log levels
// TODO: log different levels to different files (probably a change in server common)

func configureBasicLogging() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
}

func configureFileLogging(config *utilities.ApplicationConfig) {
	formatter := logrus.JSONFormatter{
		TimestampFormat: "2006-01-02T15:04:05.999999999Z07:00",
	}
	logrus.SetFormatter(&formatter)

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

	var env string
	flag.StringVar(&env, "env", "local", "Specify environment to use (default: local)")
	flag.Parse()

	log.Infof("Environment: %s", env)

	envFile := fmt.Sprintf("%s.env", env)

	log.Infof("Loading configuration from environment file %s", envFile)

	config, err := utilities.GetConfigFromEnvFile(envFile)

	if err != nil {
		log.WithError(err).Error("Failed to read application configuration")
		return
	}

	configureFileLogging(config)

	log.Info("Startup - file logging configured")
	log.Infof("Configuration loaded from %s", envFile)

	db, err := repo.Connect(log, config)
	if err != nil {
		log.WithError(err).Error()
		return
	}

	repoInstance := r.Repo{DB: db}

	quickNotesService := service.NoteService{Repo: &repoInstance}
	quickNotesHandler := handler.NoteHandler{Service: &quickNotesService}

	tagService := service.TagService{Repo: &repoInstance}
	tagHandler := handler.TagHandler{Service: &tagService}

	documentGroupService := service.GroupService{Repo: &repoInstance}
	documentGroupHandler := handler.GroupHandler{Service: &documentGroupService}

	authService := service.AuthService{Repo: &repoInstance}
	authHandler := handler.AuthHandler{Service: &authService}

	authService.CreateUser(logrus.WithField("createUser", true), "test", "Password!")

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

	authMiddleware := handler.AuthMiddleware{AuthService: &authService}

	r.Use(handler.LogRequestContext)

	authHandler.ConfigureRoutes(r)

	r.Group(func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		quickNotesHandler.ConfigureRoutes(r)
		tagHandler.ConfigureRoutes(r)
		documentGroupHandler.ConfigureRoutes(r)
	})

	portString := fmt.Sprintf(":%d", config.APIPort)

	log.Infof("Listening on port %d", config.APIPort)

	err = http.ListenAndServe(portString, r)

	if err != nil {
		log.WithError(err).Error("Error returned from http.ListenAndServe")
	}

	log.Info("Done")
}
