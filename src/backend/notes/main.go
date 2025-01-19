package main

import (
	"context"
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

// TODO: get logging up and working with new common changes
//  - (done) no logging at all in repo
//  - no error logging in service
//  - handler logging of errors
//  - handle context timeouts and log warn instead
//  - test that
//  - move logging initialization to common
//  - common stuff uses global loggers
//  - notes stuff uses global loggers
//  - (done) implement Ctx function for logger from context
//  - use pkgErrors everywhere

func main() {
	fmt.Println("Starting notes API server")

	var env string
	flag.StringVar(&env, "env", "local", "Specify environment to use (default: local)")
	flag.Parse()

	fmt.Printf("Environment: %s\n", env)

	envFile := fmt.Sprintf("%s.env", env)

	fmt.Printf("Loading configuration from environment file %s\n", envFile)

	config, getConfigErr := utilities.GetConfigFromEnvFile(envFile)

	if getConfigErr != nil {
		fmt.Println("Failed to read application configuration")
		fmt.Printf("%v\n", getConfigErr)
		return
	}

	logger, configLogger := log.GetApplicationLoggers(config.LogDirectory, "notes")
	log.SetGlobalLoggers(logger, configLogger)

	configContext := context.WithValue(context.Background(), "logger", configLogger)

	log.Config.Info("Notes server starting - file log configured")
	log.Config.Infof("Configuration loaded from %s", envFile)

	db, err := repo.Connect(configLogger, config)
	if err != nil {
		log.Config.WithError(err).Fatal("Failed to connect to database")
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

	// TODO: kind of hate that this gets partially initialized here. Consider changing this
	authorService := service.AuthorService{Repo: &repoInstance}
	defaultInternalAuthorID, err := authorService.GetDefaultInternalAuthorID(configContext)
	if err != nil {
		log.Config.WithError(err).Fatal("Failed to get default internal author ID")
		return
	}
	if !defaultInternalAuthorID.Valid {
		log.Config.WithError(err).Fatal("No default internal author configured!")
	}
	authorService.DefaultInternalAuthorID = defaultInternalAuthorID.Int64

	generalHandler := handler.GeneralHandler{Service: &authorService}

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

	// TODO: refactor so this doesn't take loggers
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
		generalHandler.ConfigureRoutes(r)
	})

	portString := fmt.Sprintf(":%d", config.APIPort)

	configLogger.Infof("Listening on port %d", config.APIPort)

	ctx := context.WithValue(context.Background(), "logger", logger)

	// TODO: better user management, maybe a first time setup thing?
	// create default user if it doesn't exist
	exists, err := authService.UserExists(ctx, "admin")
	if err != nil {
		log.General.WithError(err).Error("Error checking if admin user exists")
		return
	}

	if !exists {
		err := authService.CreateUser(ctx, "admin", "password1")
		if err != nil {
			log.Ctx(ctx).WithError(err).Error("Error creating admin user")
			return
		}

		log.General.Info("admin user created")
	}

	// create test user if it doesn't exist
	exists, err = authService.UserExists(ctx, "test")
	if err != nil {
		log.General.WithError(err).Error("Error checking if test user exists")
		return
	}

	if !exists {
		err := authService.CreateUser(ctx, "test", "testPassword1")
		if err != nil {
			log.Ctx(ctx).WithError(err).Error("Error creating test user")
			return
		}

		log.General.Info("test user created")
	}

	listenAndServeErr := http.ListenAndServe(portString, router)

	if listenAndServeErr != nil {
		log.Config.WithError(err).Fatal("Error returned from http.ListenAndServe")
		return
	}

	log.Config.Info("Done")
}
