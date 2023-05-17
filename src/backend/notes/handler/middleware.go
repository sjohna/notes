package handler

import (
	"context"
	"net/http"
	"notes/service"
	"strings"
	"sync/atomic"

	"github.com/sirupsen/logrus"
)

var requestIdCounter int64 = 0

func getNextRequestId() int64 {
	return atomic.AddInt64(&requestIdCounter, 1)
}

func LogRequestContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logrus.WithFields(logrus.Fields{
			"requestId": getNextRequestId(),
		})

		log.WithFields(logrus.Fields{
			"route":         r.URL.Path,
			"method":        r.Method,
			"contentLength": r.ContentLength,
		}).Info("New request")

		ctx := context.WithValue(r.Context(), "logger", log)

		next.ServeHTTP(w, r.WithContext(ctx))
		log.Info("Request complete")
	})
}

type AuthMiddleware struct {
	AuthService *service.AuthService
}

func (middleware *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := r.Context().Value("logger").(*logrus.Entry)
		// TODO: auth middleware logger helpers?

		providedHeaders, ok := r.Header["Authorization"]
		if !ok {
			log.Info("No authorization header provided")
			http.Error(w, "No authorization header provided", 401)
			return
		}

		if len(providedHeaders) != 1 {
			log.Info("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		authHeader := providedHeaders[0]

		splitHeader := strings.Split(authHeader, "Bearer ")
		if len(splitHeader) != 2 {
			log.Info("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		if len(splitHeader[0]) != 0 {
			log.Info("Invalid authorization header")
			http.Error(w, "Invalid authorization header", 401)
			return
		}

		token := splitHeader[1]
		session, err := middleware.AuthService.ValidateSessionToken(log, token)

		if err != nil {
			log.WithError(err).Info("Error validating session token")
			http.Error(w, "Error validating session token", 500)
			return
		}

		if session == nil {
			log.Info("Invalid token")
			http.Error(w, "Invalid token", 401)
			return
		}

		sessionLog := log.WithField("sessionID", session.ID).WithField("userID", session.UserID)

		sessionLog.Info("Authenticated")
		ctx := context.WithValue(r.Context(), "logger", sessionLog)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}