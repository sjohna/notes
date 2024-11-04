package repo

import (
	"database/sql"
	"errors"
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

func GetUserAuthInfoByID(dao c.DAO, userID int64) (*UserAuthInfo, error) {
	// TODO: use contexts in queries
	_, log := c.RepoFunctionContext(dao.Context(), "GetUserAuthInfoByID")
	defer c.LogRepoReturn(log)

	log = log.WithField("userID", userID)
	log.Debug("Getting user auth info by ID")

	// language=SQL
	SQL := `select id, user_name, salt, password_hash
from "user"
where id = $1`

	var userAuthInfo UserAuthInfo
	err := dao.Get(&userAuthInfo, SQL, userID)
	if err != nil {
		// TODO: handle not existing
		log.WithError(err).Error("Error running query to get user auth info by ID")
		return nil, err
	}

	return &userAuthInfo, nil
}

func UpdateUserPassword(dao c.DAO, userID int64, passwordHash []byte) error {
	_, log := c.RepoFunctionContext(dao.Context(), "UpdateUserPassword")
	defer c.LogRepoReturn(log)

	log = log.WithField("userID", userID)
	log.Info("Updating user password")

	// language=SQL
	SQL := `update "user"
set password_hash = $1
where id = $2`

	_, err := dao.Exec(SQL, passwordHash, userID)
	if err != nil {
		log.WithError(err).Error("Error running query to update user password")
		return err
	}

	return nil
}

func CreateUser(dao c.DAO, userName string, salt []byte, passwordHash []byte) (*UserAuthInfo, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "CreateUser")
	defer c.LogRepoReturn(log)

	log = log.WithField("userName", userName)
	log.Debug("Creating user")

	// language=SQL
	SQL := `insert into "user" (user_name, salt, password_hash)
values ($1, $2, $3)
returning id, user_name, salt, password_hash`

	var userAuthInfo UserAuthInfo
	err := dao.Get(&userAuthInfo, SQL, userName, salt, passwordHash)
	if err != nil {
		log.WithError(err).Error("Error running query to create user")
		return nil, err
	}

	log.WithField("userID", userAuthInfo.ID).Info("User created")

	return &userAuthInfo, nil
}

func GetUserAuthInfoByUserName(dao c.DAO, userName string) (*UserAuthInfo, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "GetUserAuthInfoByUserName")
	defer c.LogRepoReturn(log)

	log = log.WithField("userName", userName)
	log.Debug("Getting user auth info by user name")

	// language=SQL
	SQL := `select id, user_name, salt, password_hash
from "user"
where user_name = $1`

	var userAuthInfo UserAuthInfo
	err := dao.Get(&userAuthInfo, SQL, userName)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}

		log.WithError(err).Error("Error running query to get user auth info by user name")
		return nil, err
	}

	return &userAuthInfo, nil
}

// TODO: token expiration
func CreateSession(dao c.DAO, userID int64, token string) (*UserSession, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "CreateSession")
	defer c.LogRepoReturn(log)

	log = log.WithField("userID", userID)
	log.Debug("Creating session")

	// language=SQL
	SQL := `insert into session (user_id, token)
values ($1, $2)
returning id, user_id, token, created_at, expires_at, closed_at`

	var session UserSession
	err := dao.Get(&session, SQL, userID, token)
	if err != nil {
		log.WithError(err).Error("Error running query to create session")
		return nil, err
	}

	return &session, nil
}

func GetActiveUserSessionByToken(dao c.DAO, token string) (*UserSession, error) {
	_, log := c.RepoFunctionContext(dao.Context(), "GetUserSessionByToken")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := `select id, user_id, token, created_at, expires_at, closed_at
from session
where token = $1
  and closed_at is null
  and (expires_at is null or expires_at > now())`

	var session UserSession
	err := dao.Get(&session, SQL, token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		log.WithError(err).Error("Error running query to get user session by token")
		return nil, err
	}

	return &session, nil
}
