package handler

import (
	"context"
	"github.com/sirupsen/logrus"
	"github.com/sjohna/go-server-common/log"
	"net/http"
	"notes/service"
	"strings"
	"sync/atomic"
)

var requestIdCounter int64 = 0

func getNextRequestId() int64 {
	return atomic.AddInt64(&requestIdCounter, 1)
}

type Middleware struct {
	AuthService  *service.AuthService
	Logger       log.Logger
	ConfigLogger log.Logger
}

func (middleware *Middleware) LogRequestContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := middleware.Logger.WithField("requestId", getNextRequestId())

		logger.WithFields(logrus.Fields{
			"route":         r.URL.Path,
			"method":        r.Method,
			"contentLength": r.ContentLength,
		}).Info("New request")

		ctx := context.WithValue(r.Context(), "logger", logger)

		next.ServeHTTP(w, r.WithContext(ctx))
		logger.Info("Request complete")
	})
}

func (middleware *Middleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		logger := ctx.Value("logger").(log.Logger)
		// TODO: auth middleware logger helpers?

		middlewareLogger := logger.WithField("middleware-function", "Authenticate")

		providedHeaders, ok := r.Header["Authorization"]
		if !ok {
			middlewareLogger.Warn("No authorization header provided")
			http.Error(w, "No authorization header provided", 401)
			return
		}

		if len(providedHeaders) != 1 {
			middlewareLogger.Warn("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		authHeader := providedHeaders[0]

		splitHeader := strings.Split(authHeader, "Bearer ")
		if len(splitHeader) != 2 {
			middlewareLogger.Warn("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		if len(splitHeader[0]) != 0 {
			middlewareLogger.Warn("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		token := splitHeader[1]
		session, err := middleware.AuthService.ValidateSessionToken(ctx, token)

		if err != nil {
			middlewareLogger.WithError(err).Info("Error validating session token")
			http.Error(w, "Error validating session token", 500)
			return
		}

		if session == nil {
			middlewareLogger.Info("Invalid auth token")
			http.Error(w, "Invalid auth token", 401)
			return
		}

		sessionLog := middlewareLogger.WithField("sessionID", session.ID).WithField("userID", session.UserID)

		sessionLog.Debug("Authenticated")
		ctx = context.WithValue(r.Context(), "logger", logger)

		// TODO: add user info to context?

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
