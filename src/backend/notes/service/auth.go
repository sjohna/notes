package service

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"github.com/sirupsen/logrus"
	r "github.com/sjohna/go-server-common/repo"
	c "github.com/sjohna/go-server-common/service"
	"golang.org/x/crypto/argon2"
	"notes/repo"
)

type AuthService struct {
	Repo *r.Repo
}

func (svc *AuthService) CreateUser(logger *logrus.Entry, userName string, password string) error {
	log := c.ServiceFunctionLogger(logger.WithField("userName", userName), "CreateUser")
	defer c.LogServiceReturn(log)

	dao := svc.Repo.NonTx(log)

	// generate salt and password hash
	salt := make([]byte, 16)
	_, err := rand.Read(salt)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	passwordHash := argon2.IDKey([]byte(password), salt, 3, 64*1024, 4, 32)

	_, err = repo.CreateUser(dao, userName, salt, passwordHash)
	if err != nil {
		log.WithError(err).Error()
		return err
	}

	return nil
}

func (svc *AuthService) LogUserIn(logger *logrus.Entry, userName string, password string) (string, error) {
	log := c.ServiceFunctionLogger(logger.WithField("userName", userName), "LogUserIn")
	defer c.LogServiceReturn(log)

	dao := svc.Repo.NonTx(log)

	user, err := repo.GetUserAuthInfoByUserName(dao, userName)
	if err != nil {
		log.WithError(err).Error()
		return "", err
	}

	providedPasswordHash := argon2.IDKey([]byte(password), user.Salt, 3, 64*1024, 4, 32)

	if len(providedPasswordHash) > 0 && len(user.PasswordHash) > 0 && bytes.Equal(providedPasswordHash, user.PasswordHash) {
		authTokenBytes := make([]byte, 16)
		_, err := rand.Read(authTokenBytes)
		if err != nil {
			log.WithError(err).Error()
			return "", err
		}

		authTokenString := hex.EncodeToString(authTokenBytes)

		session, err := repo.CreateSession(dao, user.ID, authTokenString)
		if err != nil {
			log.WithError(err).Error()
			return "", err
		}

		return session.Token, nil
	} else {
		return "", errors.New("Invalid username or password")
	}
}

func (svc *AuthService) ValidateSessionToken(logger *logrus.Entry, providedToken string) (*repo.UserSession, error) {
	log := c.ServiceFunctionLogger(logger, "ValidateSessionToken")
	defer c.LogServiceReturn(log)

	dao := svc.Repo.NonTx(log)

	session, err := repo.GetActiveUserSessionByToken(dao, providedToken)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	if session == nil {
		log.Info("Provided session token not valid")
		return nil, nil
	}

	log.WithField("userID", session.UserID).WithField("sessionID", session.ID).Info("Session token validated")

	return session, nil
}
