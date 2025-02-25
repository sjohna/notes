package repo

import (
	"fmt"
	"github.com/lib/pq"
	"github.com/sjohna/go-server-common/errors"
	c "github.com/sjohna/go-server-common/repo"
	"golang.org/x/sync/errgroup"
	"notes/common"
	"time"
)

type Document struct {
	ID                    int64                `db:"id" json:"id"`
	Type                  string               `db:"type" json:"type"`
	LatestVersion         *DocumentContent     `db:"latest_version" json:"latestVersion"`
	CreatedAt             time.Time            `db:"created_at" json:"createdAt"`
	CreatedAtPrecision    string               `db:"created_at_precision" json:"createdAtPrecision"`
	DocumentTime          time.Time            `db:"document_time" json:"documentTime"`
	DocumentTimePrecision string               `db:"document_time_precision" json:"documentTimePrecision"`
	InsertedAt            time.Time            `db:"inserted_at" json:"insertedAt"`
	Tags                  *TagOnDocumentList   `db:"tags" json:"tags,omitempty"`
	Groups                *GroupOnDocumentList `db:"groups" json:"groups,omitempty"`
}

type DocumentContent struct {
	ID         int64     `db:"id" json:"id"`
	DocumentID int64     `db:"document_id" json:"documentId"`
	Type       string    `db:"type" json:"type"`
	Content    string    `db:"content" json:"content"`
	Version    int64     `db:"version" json:"version"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
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

// CreateDocument returns ID of created document
func CreateDocument(tx *c.TxDAO, documentType string, content string) (int64, errors.Error) {
	// language=SQL
	DocumentSQL := `insert into document (type, author_id)
values ($1, $2)
returning id`

	var createdDocumentID int64
	err := tx.Get(&createdDocumentID, DocumentSQL, documentType, InternalAuthorID)
	if err != nil {
		return 0, err
	}

	// language=SQL
	ContentSQL := `insert into document_content (document_id, content, content_type, version)
values ($1, $2, $3, 1)`
	_, err = tx.Exec(ContentSQL, createdDocumentID, content, "text")
	if err != nil {
		return 0, errors.WrapQueryError(err, "failed to insert document content", ContentSQL, createdDocumentID, content, "text")
	}

	return createdDocumentID, nil
}

func GetDocumentByID(dao c.DAO, documentID int64) (*Document, errors.Error) {
	documents, err := GetDocumentsByIDs(dao, []int64{documentID}, common.NoteQueryParameters{})
	if err != nil {
		return nil, err
	}

	if len(documents) == 0 {
		err = errors.New(fmt.Sprintf("No document found with id %d", documentID))
		return nil, err
	}

	if len(documents) > 1 {
		err = errors.New(fmt.Sprintf("Too many documents with id %d, this should not happen! (Expected 1, got %d)", documentID, len(documents)))
		return nil, err
	}

	return documents[0], nil
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

// parameters only for sorting for now
// TODO: handle sort parameters better
func GetDocumentsByIDs(dao c.DAO, ids []int64, parameters common.NoteQueryParameters) ([]*Document, errors.Error) {
	var documents []*Document
	contentMap := make(map[int64]*DocumentContent)

	eg := new(errgroup.Group)

	eg.Go(func() error {
		var err errors.Error
		documents, err = getDocumentStructsByIDs(dao, ids, parameters)
		return err
	})

	eg.Go(func() error {
		content, err := GetLatestVersionsOfDocuments(dao, ids)
		if err != nil {
			return err
		}

		for _, dc := range content {
			contentMap[dc.DocumentID] = dc
		}

		return nil
	})

	err := eg.Wait()
	if err != nil {
		return nil, err.(errors.Error)
	}

	for _, document := range documents {
		document.LatestVersion = contentMap[document.ID]
	}

	return documents, nil
}

func getDocumentStructsByIDs(dao c.DAO, ids []int64, parameters common.NoteQueryParameters) ([]*Document, errors.Error) {
	// language=SQL
	SQL := `select document.id,
       document.type,
       document.created_at,
       document.created_at_precision,
       document.document_time,
       document.document_time_precision,
       document.inserted_at,
       document_tags.tags as tags,
       document_groups.groups as groups
from document
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
	// TODO: see if there's a better way to build up this query
	// TODO: probably should use exists subqueries to see if document has tag/group, instead of select distinct ... join
	// language=SQL
	SQL := `select distinct document.id
from document
         left join document_tag on document.id = document_tag.document_id and document_tag.archived_at is null
		 left join document_group on document_group.document_group_id = document.id and document_group.archived_at is null
where document.document_time between coalesce($1, '-infinity'::timestamptz) and coalesce($2, 'infinity'::timestamptz) -- TODO: handle querying based on other timestamps
  and ($3 is false or document_tag.tag_id = any ($4))
  and ($7 is false or document_group.document_group_id = any ($8))
except
select distinct document.id
from document
         left join document_tag on document.id = document_tag.document_id and document_tag.archived_at is null
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
		len(parameters.Groups) > 0,
		pq.Array(parameters.Groups),
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

func GetDocumentVersion(dao c.DAO, documentID int64, version int64) (*DocumentContent, errors.Error) {
	//language=SQL
	SQL := `select document_content.id,
document.id as document_id,
document_content.content_type as type,
document_content.content,
document_content.version,
document_content.created_at
from document_content
join document on document.id = document_content.document_id
where document_content.document_id = $1 and document_content.version = $2`

	var ret DocumentContent
	err := dao.Get(&ret, SQL, documentID, version)
	if err != nil {
		return nil, err
	}

	return &ret, nil
}

func GetLatestVersionsOfDocuments(dao c.DAO, documentIDs []int64) ([]*DocumentContent, errors.Error) {
	//language=SQL
	SQL := `select distinct on (document.id, document_content.version)
document_content.id,
document.id as document_id,
document_content.content_type as type,
document_content.content,
document_content.version,
document_content.created_at
from document_content
join document on document.id = document_content.document_id
where document_content.document_id = any($1)
order by document.id, document_content.version desc`

	var ret []*DocumentContent
	err := dao.Select(&ret, SQL, pq.Array(documentIDs))
	if err != nil {
		return nil, err
	}

	return ret, nil
}
