package repo

import (
	"fmt"
	"github.com/sjohna/go-server-common/log"
	"notes/utilities"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func Connect(logger log.Logger, config *utilities.ApplicationConfig) (*sqlx.DB, error) {
	connStringWithoutPassword := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=%s password=%s", config.DBHost, config.DBPort, config.DBUser, config.DBName, config.DBSSLMode, "XXX")

	logger = logger.WithField("connString", connStringWithoutPassword)

	logger.Info("Connecting to database")

	connString := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=%s password=%s", config.DBHost, config.DBPort, config.DBUser, config.DBName, config.DBSSLMode, config.DBPassword)
	db, err := sqlx.Connect("postgres", connString)

	if err != nil {
		return nil, err
	}

	logger.Info("Connected to database")

	return db, nil
}
