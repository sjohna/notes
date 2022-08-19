package service

import "github.com/sirupsen/logrus"

func serviceFunctionLogger(log *logrus.Entry, serviceFunction string) *logrus.Entry {
	log = log.WithField("service-function", serviceFunction)
	log.Info("Service called")
	return log
}

func logServiceReturn(log *logrus.Entry) {
	log.Info("Service returned")
}
