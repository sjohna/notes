package repo

import (
	"fmt"
	"github.com/sirupsen/logrus"
	"notes/utilities"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func Connect(log *logrus.Entry, config *utilities.ApplicationConfig) (*sqlx.DB, error) {
	connStringWithoutPassword := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=%s password=%s", config.DBHost, config.DBPort, config.DBUser, config.DBName, config.DBSSLMode, "XXX")

	log.WithField("connString", connStringWithoutPassword).Info("Connecting to database")

	connString := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=%s password=%s", config.DBHost, config.DBPort, config.DBUser, config.DBName, config.DBSSLMode, config.DBPassword)
	db, err := sqlx.Connect("postgres", connString)

	if err != nil {
		return nil, err
	}

	return db, nil
}
