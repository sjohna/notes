package common

const (
	DocumentTagUpdateAdd    = 1
	DocumentTagUpdateRemove = 2
)

type DocumentTagUpdateType int

type DocumentTagUpdate struct {
	TagID      int64                 `json:"tagId"`
	UpdateType DocumentTagUpdateType `json:"updateType"`
}
