package common

import "gopkg.in/guregu/null.v4"

type TagQueryParameter struct {
	Tag     int64 `json:"tag"`
	Exclude bool  `json:"exclude"`
}

type QuickNoteQueryParameters struct {
	StartTime     null.Time           `json:"startTime"`
	EndTime       null.Time           `json:"endTime"`
	Tags          []TagQueryParameter `json:"tags"`
	SortBy        null.String         `json:"sortBy"`
	SortDirection null.String         `json:"sortDirection"`
}

type TotalNotesOnDaysQueryParameters struct {
	StartDate null.String `json:"startDate"`
	EndDate   null.String `json:"endDate"`
}
