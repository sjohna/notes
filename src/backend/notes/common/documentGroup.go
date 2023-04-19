package common

type DocumentDocumentGroupUpdate struct {
	DocumentGroupID int64                      `json:"groupId"`
	UpdateType      DocumentMetadataUpdateType `json:"updateType"`
}
