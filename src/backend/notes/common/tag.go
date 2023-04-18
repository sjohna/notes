package common

type DocumentTagUpdate struct {
	TagID      int64                      `json:"tagId"`
	UpdateType DocumentMetadataUpdateType `json:"updateType"`
}
