package common

import (
	"gopkg.in/guregu/null.v4"
	"time"
)

type DocumentGroup struct {
	ID          int64       `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Description null.String `db:"description" json:"description"`
	InsertedAt  time.Time   `db:"inserted_at" json:"insertedAt"`
	ArchivedAt  null.Time   `db:"archived_at" json:"archivedAt"`
}

type DocumentGroupList []*DocumentGroup

type DocumentDocumentGroupUpdate struct {
	DocumentGroupID int64                      `json:"groupId"`
	UpdateType      DocumentMetadataUpdateType `json:"updateType"`
}
