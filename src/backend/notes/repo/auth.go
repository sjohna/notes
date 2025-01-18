package repo

import (
	"database/sql"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/repo"
	"gopkg.in/guregu/null.v4"
	"time"
)

type UserAuthInfo struct {
	ID           int64  `db:"id"`
	UserName     string `db:"user_name"`
	Salt         []byte `db:"salt"`
	PasswordHash []byte `db:"password_hash"`
}

type UserSession struct {
	ID        int64     `db:"id"`
	UserID    int64     `db:"user_id"`
	Token     string    `db:"token"`
	CreatedAt time.Time `db:"created_at"`
	ExpiresAt null.Time `db:"expires_at"`
	ClosedAt  null.Time `db:"closed_at"`
}

func GetUserAuthInfoByID(dao c.DAO, userID int64) (*UserAuthInfo, errors.Error) {
	// language=SQL
	SQL := `select id, user_name, salt, password_hash
from "user"
where id = $1`

	var userAuthInfo UserAuthInfo
	err := dao.Get(&userAuthInfo, SQL, userID)
	if err != nil {
		// TODO: handle not existing
		return nil, err
	}

	return &userAuthInfo, nil
}

func UpdateUserPassword(dao c.DAO, userID int64, passwordHash []byte) errors.Error {
	// language=SQL
	SQL := `update "user"
set password_hash = $1
where id = $2`

	_, err := dao.Exec(SQL, passwordHash, userID)
	if err != nil {
		return err
	}

	return nil
}

func CreateUser(dao c.DAO, userName string, salt []byte, passwordHash []byte) (*UserAuthInfo, errors.Error) {
	// language=SQL
	SQL := `insert into "user" (user_name, salt, password_hash)
values ($1, $2, $3)
returning id, user_name, salt, password_hash`

	var userAuthInfo UserAuthInfo
	err := dao.Get(&userAuthInfo, SQL, userName, salt, passwordHash)
	if err != nil {
		return nil, err
	}

	return &userAuthInfo, nil
}

func GetUserAuthInfoByUserName(dao c.DAO, userName string) (*UserAuthInfo, errors.Error) {
	// language=SQL
	SQL := `select id, user_name, salt, password_hash
from "user"
where user_name = $1`

	var userAuthInfo UserAuthInfo
	err := dao.Get(&userAuthInfo, SQL, userName)
	if err != nil {
		if err.Is(sql.ErrNoRows) {
			return nil, nil
		}

		return nil, err
	}

	return &userAuthInfo, nil
}

// TODO: token expiration
func CreateSession(dao c.DAO, userID int64, token string) (*UserSession, errors.Error) {
	// language=SQL
	SQL := `insert into session (user_id, token)
values ($1, $2)
returning id, user_id, token, created_at, expires_at, closed_at`

	var session UserSession
	err := dao.Get(&session, SQL, userID, token)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

func GetActiveUserSessionByToken(dao c.DAO, token string) (*UserSession, errors.Error) {
	// language=SQL
	SQL := `select id, user_id, token, created_at, expires_at, closed_at
from session
where token = $1
  and closed_at is null
  and (expires_at is null or expires_at > now())`

	var session UserSession
	err := dao.Get(&session, SQL, token)
	if err != nil {
		if err.Is(sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &session, nil
}
