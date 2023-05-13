package common

type DocumentGroupUpdate struct {
	DocumentGroupID int64                      `json:"groupId"`
	UpdateType      DocumentMetadataUpdateType `json:"updateType"`
}
