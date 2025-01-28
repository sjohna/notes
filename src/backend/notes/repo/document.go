package repo

import (
	"fmt"
	"github.com/lib/pq"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/repo"
	"notes/common"
	"time"
)

// TODO: return updated time here
type Document struct {
	ID                    int64                `db:"id" json:"id"`
	Type                  string               `db:"type" json:"type"`
	Content               string               `db:"content" json:"content"`
	CreatedAt             time.Time            `db:"created_at" json:"createdAt"`
	CreatedAtPrecision    string               `db:"created_at_precision" json:"createdAtPrecision"`
	DocumentTime          time.Time            `db:"document_time" json:"documentTime"`
	DocumentTimePrecision string               `db:"document_time_precision" json:"documentTimePrecision"`
	InsertedAt            time.Time            `db:"inserted_at" json:"insertedAt"`
	Tags                  *TagOnDocumentList   `db:"tags" json:"tags,omitempty"`
	Groups                *GroupOnDocumentList `db:"groups" json:"groups,omitempty"`
}

type DocumentsOnDate struct {
	Date  string `db:"date" json:"date"`
	Count int    `db:"count" json:"count"`
}

type DocumentVersionSummary struct {
	ID            int64     `db:"id" json:"id"`
	Version       int64     `db:"version" json:"version"`
	ContentLength int64     `db:"content_length" json:"contentLength"`
	ContentType   string    `db:"content_type" json:"contentType"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
}

const InternalAuthorID = 1

func CreateDocument(tx *c.TxDAO, documentType string, content string) (*Document, errors.Error) {
	// language=SQL
	DocumentSQL := `insert into document (type, author_id)
values ($1, $2)
returning id`

	var createdDocumentID int64
	err := tx.Get(&createdDocumentID, DocumentSQL, documentType, InternalAuthorID)
	if err != nil {
		return nil, err
	}

	// language=SQL
	ContentSQL := `insert into document_content (document_id, content, content_type, version)
values ($1, $2, $3, 1)`
	_, err = tx.Exec(ContentSQL, createdDocumentID, content, "text")
	if err != nil {
		return nil, errors.WrapQueryError(err, "failed to insert document content", ContentSQL, createdDocumentID, content, "text")
	}

	createdDocument, err := GetDocumentByID(tx, createdDocumentID)
	if err != nil {
		return nil, err
	}

	return createdDocument, nil
}

// language=SQL
var noteFilterQueryBase string = `
select document.id
from document
where document.type = 'quick_note'
`

func GetDocumentByID(dao c.DAO, documentID int64) (*Document, errors.Error) {
	// TODO: better handle getting a single document
	documents, err := GetDocumentsByIDs(dao, []int64{documentID}, common.NoteQueryParameters{})
	if err != nil {
		return nil, err
	}

	if len(documents) == 0 {
		// TODO: errors.NewFormat
		err = errors.New(fmt.Sprintf("No document found with id %d", documentID))
		return nil, err
	}

	if len(documents) > 1 {
		err = errors.New(fmt.Sprintf("Too many documents with id %d, this should not happen! (Expected 1, got %d)", documentID, len(documents)))
		return nil, err
	}

	return documents[0], nil
}

func appendQueryParameters(query string, parameters common.NoteQueryParameters) (string, []interface{}, errors.Error) {
	basicQuery := query

	args := make([]interface{}, 0)

	// TODO: make this more general. Right now, it assumes there's already a where clause, so adds everything with and
	if parameters.StartTime.Valid && parameters.EndTime.Valid {
		basicQuery += " and document.document_time between $1 and $2"
		args = append(args, parameters.StartTime.Time, parameters.EndTime.Time)
	} else if parameters.StartTime.Valid {
		basicQuery += " and document.document_time >= $1"
		args = append(args, parameters.StartTime.Time)
	} else if parameters.EndTime.Valid {
		basicQuery += " and document.document_time <= $1"
		args = append(args, parameters.EndTime.Time)
	}

	return basicQuery, args, nil
}

var allowedSortColumns = []string{
	"created_at",
	"document_time",
	"inserted_at",
}

func appendSortParameters(query string, parameters common.NoteQueryParameters) (string, errors.Error) {
	newQuery := query

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
			return "", errors.New(fmt.Sprintf("Invalid sortBy: %s", parameters.SortBy.String))
		}

		sortDirection := " desc"
		if parameters.SortDirection.Valid {
			if parameters.SortDirection.String == "ascending" {
				sortDirection = " asc"
			} else if parameters.SortDirection.String == "descending" {
				sortDirection = " desc"
			} else {
				return "", errors.New(fmt.Sprintf("Invalid sortDirection: %s", parameters.SortDirection.String))
			}
		}

		sortQuery := fmt.Sprintf(" order by %s", sortColumn)
		newQuery += sortQuery
		newQuery += sortDirection
	} else {
		newQuery += " order by document_time desc"
	}

	return newQuery, nil
}

// TODO: pagination
func GetDocuments(dao c.DAO, parameters common.NoteQueryParameters) ([]*Document, errors.Error) {
	ids, err := GetDocumentIDsMatchingFilter(dao, parameters)
	if err != nil {
		return nil, err
	}

	quickNotes, err := GetDocumentsByIDs(dao, ids, parameters)
	if err != nil {
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
func GetTotalDocumentsOnDates(dao c.DAO, parameters common.TotalNotesOnDaysQueryParameters) ([]*DocumentsOnDate, errors.Error) {
	SQL, args := totalDocumentsOnDatesQuery(parameters)

	documentsOnDates := make([]*DocumentsOnDate, 0)
	err := dao.Select(&documentsOnDates, SQL, args...)
	if err != nil {
		return nil, err
	}

	return documentsOnDates, nil
}

// parameters only for sorting for now
// TODO: handle sort parameters better
func GetDocumentsByIDs(dao c.DAO, ids []int64, parameters common.NoteQueryParameters) ([]*Document, errors.Error) {
	// language=SQL
	SQL := `select document.id,
       document.type,
       latest_content_version.content,
       document.created_at,
       document.created_at_precision,
       document.document_time,
       document.document_time_precision,
       document.inserted_at,
       document_tags.tags as tags,
       document_groups.groups as groups
from document
         join lateral (
    select document_content.content
    from document_content
    where document_content.document_id = document.id
    order by version desc
    limit 1
    ) latest_content_version on true
         join lateral (
    select jsonb_agg(json_build_object('id', tag.id, 'name', tag.name)) as tags
    from document_tag
             join tag on document_tag.tag_id = tag.id
    where document_tag.document_id = document.id
      and document_tag.archived_at is null
    ) document_tags on true
         join lateral (
    select jsonb_agg(json_build_object('id', "group".id, 'name', "group".name)) as groups
    from "group"
             join document_group on document_group.document_group_id = document_group.id
    where document_group.document_id = document.id
      and document_group.archived_at is null
    ) document_groups on true
where document.id = any ($1)
`

	SQL, err := appendSortParameters(SQL, parameters)
	if err != nil {
		return nil, err
	}

	documents := make([]*Document, 0)
	err = dao.Select(&documents, SQL, pq.Array(ids))
	if err != nil {
		return nil, err
	}

	return documents, nil
}

func getQueryAndArgs(parameters common.NoteQueryParameters) (string, []interface{}) {
	// language=SQL
	SQL := `select distinct document.id
from document
         left join document_tag on document.id = document_tag.document_id
where document.document_time between coalesce($1, '-infinity'::timestamptz) and coalesce($2, 'infinity'::timestamptz) -- TODO: handle querying based on other timestamps
  and ($3 is false or document_tag.tag_id = any ($4))
except
select distinct document.id
from document
         left join document_tag on document.id = document_tag.document_id
where document.document_time between coalesce($1, '-infinity'::timestamptz) and coalesce($2, 'infinity'::timestamptz) -- TODO: handle querying based on other timestamps
  and ($5 is true and document_tag.tag_id = any ($6))`

	includeTags := make([]int64, 0)
	excludeTags := make([]int64, 0)

	if parameters.Tags != nil {
		for _, tagFilter := range parameters.Tags {
			if tagFilter.Exclude {
				excludeTags = append(excludeTags, tagFilter.Tag)
			} else {
				includeTags = append(includeTags, tagFilter.Tag)
			}
		}
	}

	args := []interface{}{
		parameters.StartTime,
		parameters.EndTime,
		len(includeTags) > 0,
		pq.Array(includeTags),
		len(excludeTags) > 0,
		pq.Array(excludeTags),
	}

	return SQL, args
}

func GetDocumentIDsMatchingFilter(dao c.DAO, parameters common.NoteQueryParameters) ([]int64, errors.Error) {
	SQL, args := getQueryAndArgs(parameters)

	documentIDs := make([]int64, 0)
	err := dao.Select(&documentIDs, SQL, args...)
	if err != nil {
		return nil, err
	}

	return documentIDs, nil
}

func GetDocumentVersionHistory(dao c.DAO, documentID int64) ([]DocumentVersionSummary, errors.Error) {
	//language=SQL
	SQL := `select document_content.id as id,
       document_content.version as version,
       document_content.created_at as created_at,
       document_content.content_type as content_type,
       length(document_content.content) as content_length
from document_content
join document on document_content.document_id = document.id
where document.id = $1
order by document_content.version asc`

	var ret []DocumentVersionSummary
	err := dao.Select(&ret, SQL, documentID)
	if err != nil {
		return nil, err
	}

	return ret, nil
}
