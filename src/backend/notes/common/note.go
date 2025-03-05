package common

import "gopkg.in/guregu/null.v4"

type TagQueryParameter struct {
	Tag     int64 `json:"tag"`
	Exclude bool  `json:"exclude"`
}

// groups are include-only for now
type NoteQueryParameters struct {
	StartTime     null.Time             `json:"startTime,omitempty"`
	EndTime       null.Time             `json:"endTime,omitempty"`
	Tags          []TagQueryParameter   `json:"tags,omitempty"`
	Groups        []int64               `json:"groups,omitempty"`
	SortBy        null.String           `json:"sortBy,omitempty"`
	SortDirection null.String           `json:"sortDirection,omitempty"`
	Pagination    *PaginationParameters `json:"pagination,omitempty"`
}

type TotalNotesOnDaysQueryParameters struct {
	StartDate null.String `json:"startDate,omitempty"`
	EndDate   null.String `json:"endDate,omitempty"`
}

type PaginationParameters struct {
	ItemsPerPage int `json:"itemsPerPage"`
	PageNumber   int `json:"pageNumber"` // 1-indexed
}
