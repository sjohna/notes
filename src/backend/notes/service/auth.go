package service

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"golang.org/x/crypto/argon2"
	"notes/repo"
)

type AuthService struct {
	Repo *r.Repo
}

func (svc *AuthService) CreateUser(context context.Context, userName string, password string) error {
	serviceContext, log := c.ServiceFunctionContext(context, "CreateUser")
	defer c.LogServiceReturn(log)

	log = log.WithField("userName", userName)

	log.Info("Creating user")

	dao := svc.Repo.NonTx(serviceContext)

	// generate salt and password hash
	salt := make([]byte, 16)
	_, err := rand.Read(salt)
	if err != nil {
		log.WithError(err).Error("Error generating salt")
		return err
	}

	passwordHash := argon2.IDKey([]byte(password), salt, 3, 64*1024, 4, 32)

	createdUser, err := repo.CreateUser(dao, userName, salt, passwordHash)
	if err != nil {
		log.WithError(err).Error("Error creating user")
		return err
	}

	// TODO: check for nil user? here and for similar functions

	log.WithField("userID", createdUser.ID).Info("User created")

	return nil
}

func (svc *AuthService) LogUserIn(context context.Context, userName string, password string) (string, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "LogUserIn")
	defer c.LogServiceReturn(log)

	log = log.WithField("userName", userName)
	log.Info("Logging user in")

	dao := svc.Repo.NonTx(serviceContext)

	user, err := repo.GetUserAuthInfoByUserName(dao, userName)
	if err != nil {
		log.WithError(err).Error("Error getting user auth info by user name")
		return "", err
	}

	log = log.WithField("userID", user.ID)

	providedPasswordHash := argon2.IDKey([]byte(password), user.Salt, 3, 64*1024, 4, 32)

	if len(providedPasswordHash) > 0 && len(user.PasswordHash) > 0 && bytes.Equal(providedPasswordHash, user.PasswordHash) {
		authTokenBytes := make([]byte, 16)
		_, err := rand.Read(authTokenBytes)
		if err != nil {
			log.WithError(err).Error("Error generating auth token")
			return "", err
		}

		authTokenString := hex.EncodeToString(authTokenBytes)

		session, err := repo.CreateSession(dao, user.ID, authTokenString)
		if err != nil {
			log.WithError(err).Error("Error creating session")
			return "", err
		}

		log.WithField("sessionID", session.ID).Info("User logged in")

		return session.Token, nil
	} else {
		return "", errors.New("Invalid username or password")
	}
}

// TODO: maybe cache this?
func (svc *AuthService) ValidateSessionToken(context context.Context, providedToken string) (*repo.UserSession, error) {
	serviceContext, log := c.ServiceFunctionContext(context, "ValidateSessionToken")
	defer c.LogServiceReturn(log)

	dao := svc.Repo.NonTx(serviceContext)

	session, err := repo.GetActiveUserSessionByToken(dao, providedToken)
	if err != nil {
		log.WithError(err).Error("")
		return nil, err
	}

	if session == nil {
		log.Info("Provided session token not valid")
		return nil, nil
	}

	log.WithField("userID", session.UserID).WithField("sessionID", session.ID).Debug("Session token validated")

	return session, nil
}
