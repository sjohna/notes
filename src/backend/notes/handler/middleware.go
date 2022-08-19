package handler

import (
	"context"
	"net/http"
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
