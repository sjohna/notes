package main

import (
	"flag"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/sjohna/go-server-common/log"
	r "github.com/sjohna/go-server-common/repo"
	"net/http"
	"notes/handler"
	"notes/repo"
	"notes/service"
	"notes/utilities"

	_ "github.com/lib/pq"
)

// TODO: look at logging at all levels (handler, service, repo): am I logging everything relevant?
// TODO: review and update log levels

// TODO: logging updates:
// - (done) change DAO creation logs to debug
// - (done) make "Creating/Updating X" logs debug, but keep "Created/Updated X" info
// - (done) "Request complete" logs to debug/trace
// - (done) "Context length x" when creating notes: probably a typo
// - (done) Respond success logs to debug
// - (done) Session validation/authentication per request to debug
// - (done) Log number of things returned for note/group/tag lists
// - (done) Handler called to trace
// - Probably more after I review the logs in more detail, especially if I induce some warning/error/fatal logs

func main() {
	// TODO: basic logging, like before?
	fmt.Println("Starting notes API server")

	var env string
	flag.StringVar(&env, "env", "local", "Specify environment to use (default: local)")
	flag.Parse()

	fmt.Printf("Environment: %s\n", env)

	envFile := fmt.Sprintf("%s.env", env)

	fmt.Printf("Loading configuration from environment file %s\n", envFile)

	config, err := utilities.GetConfigFromEnvFile(envFile)

	if err != nil {
		fmt.Println("Failed to read application configuration")
		fmt.Printf("%v\n", err)
		return
	}

	logger, configLogger := log.GetApplicationLoggers(config.LogDirectory, "notes")

	configLogger.Info("Notes server starting - file logging configured")
	configLogger.Infof("Configuration loaded from %s", envFile)

	db, err := repo.Connect(configLogger, config)
	if err != nil {
		configLogger.WithError(err).Fatal("Failed to connect to database")
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

	// init chi

	router := chi.NewRouter()

	// cors
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	middleware := handler.Middleware{
		AuthService:  &authService,
		Logger:       logger,
		ConfigLogger: configLogger,
	}

	router.Use(middleware.LogRequestContext)

	authHandler.ConfigureRoutes(router)

	router.Group(func(r chi.Router) {
		r.Use(middleware.Authenticate)
		quickNotesHandler.ConfigureRoutes(r)
		tagHandler.ConfigureRoutes(r)
		documentGroupHandler.ConfigureRoutes(r)
	})

	portString := fmt.Sprintf(":%d", config.APIPort)

	configLogger.Infof("Listening on port %d", config.APIPort)

	err = http.ListenAndServe(portString, router)

	if err != nil {
		configLogger.WithError(err).Fatal("Error returned from http.ListenAndServe")
		return
	}

	configLogger.Info("Done")
}
