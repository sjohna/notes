package repo

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func Connect(host string, dbName string) (*sqlx.DB, error) {
	// TODO: logging
	connString := fmt.Sprintf("user=postgres password=12qwaszx!@QWASZX dbname=%s sslmode=disable", dbName)
	db, err := sqlx.Connect("postgres", connString)

	if err != nil {
		return nil, err
	}

	return db, nil
}
