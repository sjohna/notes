package handler

import (
	"context"
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
		logger := log.General.WithField("requestId", getNextRequestId())

		ctx := context.WithValue(r.Context(), "logger", logger)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (middleware *Middleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		providedHeaders, ok := r.Header["Authorization"]
		if !ok {
			log.Ctx(ctx).Warn("No authorization header provided")
			http.Error(w, "No authorization header provided", 401)
			return
		}

		if len(providedHeaders) != 1 {
			log.Ctx(ctx).Warn("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		authHeader := providedHeaders[0]

		splitHeader := strings.Split(authHeader, "Bearer ")
		if len(splitHeader) != 2 {
			log.Ctx(ctx).Warn("Invalid authorization header format")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		if len(splitHeader[0]) != 0 {
			log.Ctx(ctx).Warn("Invalid authorization header format")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		token := splitHeader[1]
		session, err := middleware.AuthService.ValidateSessionToken(ctx, token)

		if err != nil {
			log.Ctx(ctx).WithError(err).Info("Error validating session token")
			http.Error(w, "Error validating session token", 500)
			return
		}

		if session == nil {
			log.Ctx(ctx).Info("Invalid auth token")
			http.Error(w, "Invalid auth token", 401)
			return
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
