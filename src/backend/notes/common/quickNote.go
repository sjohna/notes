package common

import "gopkg.in/guregu/null.v4"

type TagQueryParameter struct {
	Tag     int64 `json:"tag"`
	Exclude bool  `json:"exclude"`
}

type QuickNoteQueryParameters struct {
	StartTime     null.Time           `json:"startTime,omitempty"`
	EndTime       null.Time           `json:"endTime,omitempty"`
	Tags          []TagQueryParameter `json:"tags,omitempty"`
	SortBy        null.String         `json:"sortBy,omitempty"`
	SortDirection null.String         `json:"sortDirection,omitempty"`
}

type TotalNotesOnDaysQueryParameters struct {
	StartDate null.String `json:"startDate,omitempty"`
	EndDate   null.String `json:"endDate,omitempty"`
}
