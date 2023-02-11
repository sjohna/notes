package repo

import (
	"errors"
	"fmt"
	c "github.com/sjohna/go-server-common/repo"
	"notes/common"
	"time"
)

type Document struct {
	ID                    int64     `db:"id" json:"id"`
	Type                  string    `db:"type" json:"type"`
	Content               string    `db:"content" json:"content"`
	CreatedAt             time.Time `db:"created_at" json:"createdAt"`
	CreatedAtPrecision    string    `db:"created_at_precision" json:"createdAtPrecision"`
	DocumentTime          time.Time `db:"document_time" json:"documentTime"`
	DocumentTimePrecision string    `db:"document_time_precision" json:"documentTimePrecision"`
	InsertedAt            time.Time `db:"inserted_at" json:"insertedAt"`
}

type DocumentsOnDate struct {
	Date  string `db:"date" json:"date"`
	Count int    `db:"count" json:"count"`
}

const InternalAuthorID = 1

func CreateDocument(tx *c.TxDAO, documentType string, content string) (*Document, error) {
	log := c.RepoFunctionLogger(tx.Logger(), "CreateQuickNote")
	defer c.LogRepoReturn(log)

	// language=SQL
	DocumentSQL := `insert into document (type, author_id)
values ($1, $2)
returning id`

	var createdQuickNoteID int64
	err := tx.Get(&createdQuickNoteID, DocumentSQL, documentType, InternalAuthorID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	// language=SQL
	ContentSQL := `insert into document_content (document_id, content, content_type, version)
values ($1, $2, $3, 1)`
	_, err = tx.Exec(ContentSQL, createdQuickNoteID, content, "text")
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	createdQuickNote, err := GetQuickNote(tx, createdQuickNoteID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return createdQuickNote, nil
}

// language=SQL
var quickNoteQueryBase string = `
select document.id,
       document.type,
       latest_content_version.content,
       document.created_at,
       document.created_at_precision,
       document.document_time,
       document.document_time_precision,
       document.inserted_at
from document
join lateral (
    select document_content.content
    from document_content
    where document_content.document_id = document.id
    order by version desc
    limit 1
) latest_content_version on true
where document.type = 'quick_note'
`

func GetQuickNote(dao c.DAO, documentID int64) (*Document, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetQuickNote")
	defer c.LogRepoReturn(log)

	// language=SQL
	SQL := quickNoteQueryBase + ` and document.id = $1`

	var quickNote Document
	err := dao.Get(&quickNote, SQL, documentID)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return &quickNote, nil
}

var allowedSortColumns = []string{
	"created_at",
	"document_time",
	"inserted_at",
}

func appendQueryParameters(query string, parameters common.QuickNoteQueryParameters) (string, []interface{}, error) {
	newQuery := query

	args := make([]interface{}, 0)

	// TODO: make this more general. Right now, it assumes there's already a where clause, so adds everything with and
	if parameters.StartTime.Valid && parameters.EndTime.Valid {
		newQuery += " and document.document_time between $1 and $2"
		args = append(args, parameters.StartTime.Time, parameters.EndTime.Time)
	} else if parameters.StartTime.Valid {
		newQuery += " and document.document_time >= $1"
		args = append(args, parameters.StartTime.Time)
	} else if parameters.EndTime.Valid {
		newQuery += " and document.document_time <= $1"
		args = append(args, parameters.EndTime.Time)
	}

	if parameters.SortBy.Valid {
		var sortColumn string
		for _, allowedCol := range allowedSortColumns {
			if parameters.SortBy.String == allowedCol {
				sortColumn = allowedCol
				break
			}
		}

		if len(sortColumn) == 0 {
			// TODO: custom error for this
			return "", nil, errors.New(fmt.Sprintf("Invalid sortBy: %s", parameters.SortBy.String))
		}

		sortDirection := " desc"
		if parameters.SortDirection.Valid {
			if parameters.SortDirection.String == "ascending" {
				sortDirection = " asc"
			} else if parameters.SortDirection.String == "descending" {
				sortDirection = " desc"
			} else {
				return "", nil, errors.New(fmt.Sprintf("Invalid sortDirection: %s", parameters.SortDirection.String))
			}
		}

		sortQuery := fmt.Sprintf(" order by %s", sortColumn)
		newQuery += sortQuery
		newQuery += sortDirection
	} else {
		newQuery += " order by document_time desc"
	}

	return newQuery, args, nil
}

func GetQuickNotes(dao c.DAO, parameters common.QuickNoteQueryParameters) ([]*Document, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetQuickNotes")
	defer c.LogRepoReturn(log)

	SQL, args, err := appendQueryParameters(quickNoteQueryBase, parameters)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	quickNotes := make([]*Document, 0)
	err = dao.Select(&quickNotes, SQL, args...)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}

func GetQuickNotesInTimeRange(dao c.DAO, begin time.Time, end time.Time) ([]*Document, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetQuickNotesInTimeRange")
	defer c.LogRepoReturn(log)

	// TODO: effective_time or similar instead of created_at for documents
	// language=SQL
	SQL := quickNoteQueryBase + ` and document.created_at between $1 and $2
order by created_at desc`

	quickNotes := make([]*Document, 0)
	err := dao.Select(&quickNotes, SQL, begin, end)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return quickNotes, nil
}

func totalDocumentsOnDatesQuery(parameters common.TotalNotesOnDaysQueryParameters) (string, []interface{}) {
	args := make([]interface{}, 0)

	// language=SQL
	query := `select to_char(document.document_time::date, 'YYYY-MM-DD') as date,
       count(*)
from document`

	if parameters.StartDate.Valid && parameters.EndDate.Valid {
		query += " where document.document_time::date between $1 and $2"
		args = append(args, parameters.StartDate.String, parameters.EndDate.String)
	} else if parameters.StartDate.Valid {
		query += " where document.document_time::date >= $1"
		args = append(args, parameters.StartDate.String)
	} else if parameters.EndDate.Valid {
		query += " where document.document_time::date <= $1"
		args = append(args, parameters.EndDate.String)
	}

	query += " group by date order by date asc"

	return query, args
}

// TODO: make this take more generic filter criteria (tags, authors, sources, etc.)
func GetTotalDocumentsOnDates(dao c.DAO, parameters common.TotalNotesOnDaysQueryParameters) ([]*DocumentsOnDate, error) {
	log := c.RepoFunctionLogger(dao.Logger(), "GetTotalDocumentsOnDates")
	defer c.LogRepoReturn(log)

	SQL, args := totalDocumentsOnDatesQuery(parameters)

	documentsOnDates := make([]*DocumentsOnDate, 0)
	err := dao.Select(&documentsOnDates, SQL, args...)
	if err != nil {
		log.WithError(err).Error()
		return nil, err
	}

	return documentsOnDates, nil
}
