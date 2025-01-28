package service

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"github.com/sjohna/go-server-common/errors"
	"github.com/sjohna/go-server-common/log"
	r "github.com/sjohna/go-server-common/repo"

	"golang.org/x/crypto/argon2"
	"notes/repo"
)

type AuthService struct {
	Repo *r.Repo
}

func (svc *AuthService) CreateUser(ctx context.Context, userName string, password string) errors.Error {
	dao := svc.Repo.NonTx(ctx)

	// generate salt and password hash
	salt := make([]byte, 16)
	_, randReadError := rand.Read(salt)
	if randReadError != nil {
		return errors.Wrap(randReadError, "Error generating salt")
	}

	passwordHash := argon2.IDKey([]byte(password), salt, 3, 64*1024, 4, 32)

	createdUser, err := repo.CreateUser(dao, userName, salt, passwordHash)
	if err != nil {
		return err
	}

	log.Ctx(ctx).WithField("userID", createdUser.ID).Info("User created")

	return nil
}

func (svc *AuthService) LogUserIn(ctx context.Context, userName string, password string) (string, errors.Error) {
	dao := svc.Repo.NonTx(ctx)

	user, err := repo.GetUserAuthInfoByUserName(dao, userName)
	if err != nil {
		return "", err
	}

	providedPasswordHash := argon2.IDKey([]byte(password), user.Salt, 3, 64*1024, 4, 32)

	if len(providedPasswordHash) > 0 && len(user.PasswordHash) > 0 && bytes.Equal(providedPasswordHash, user.PasswordHash) {
		authTokenBytes := make([]byte, 16)
		_, generateAuthTokenErr := rand.Read(authTokenBytes)
		if generateAuthTokenErr != nil {
			return "", errors.Wrap(generateAuthTokenErr, "Error generating auth token")
		}

		authTokenString := hex.EncodeToString(authTokenBytes)

		session, err := repo.CreateSession(dao, user.ID, authTokenString)
		if err != nil {
			return "", err
		}

		return session.Token, nil
	} else {
		return "", errors.NewInput("Invalid username or password")
	}
}

// TODO: maybe cache this?
func (svc *AuthService) ValidateSessionToken(ctx context.Context, providedToken string) (*repo.UserSession, errors.Error) {
	dao := svc.Repo.NonTx(ctx)

	session, err := repo.GetActiveUserSessionByToken(dao, providedToken)
	if err != nil {
		return nil, err
	}

	if session == nil {
		return nil, nil
	}

	return session, nil
}

func (svc *AuthService) UserExists(ctx context.Context, userName string) (bool, errors.Error) {
	dao := svc.Repo.NonTx(ctx)

	authInfo, err := repo.GetUserAuthInfoByUserName(dao, userName)
	if err != nil {
		return false, err
	}

	return authInfo != nil, nil
}
