package utilities

import (
	"fmt"
	"github.com/sjohna/go-server-common/errors"
	"strings"
)

type QueryBuilder struct {
	base           string
	args           []interface{}
	joins          []Join
	whereClauses   []QueryBuilder
	orderByClauses []OrderBy
	limit          *int
	offset         *int
}

type Join struct {
	left  bool
	query QueryBuilder
}

type SortDirection string

const (
	SortAscending  = "asc"
	SortDescending = "desc"
)

type OrderBy struct {
	expression string
	direction  *SortDirection
}

func BaseQuery(base string, args ...interface{}) *QueryBuilder {
	return &QueryBuilder{base: base, args: args}
}

func (q *QueryBuilder) Where(subquery string, args ...interface{}) *QueryBuilder {
	q.whereClauses = append(q.whereClauses, QueryBuilder{
		base: subquery,
		args: args,
	})

	return q
}

func (q *QueryBuilder) Join(subquery string, args ...interface{}) *QueryBuilder {
	q.joins = append(q.joins, Join{
		left:  false,
		query: QueryBuilder{base: subquery, args: args},
	})

	return q
}

func (q *QueryBuilder) LeftJoin(subquery string, args ...interface{}) *QueryBuilder {
	q.joins = append(q.joins, Join{
		left:  true,
		query: QueryBuilder{base: subquery, args: args},
	})

	return q
}

// kind of a janky way to overload a function
func (q *QueryBuilder) OrderBy(expression string, direction ...SortDirection) *QueryBuilder {
	var sortDirection *SortDirection
	if len(direction) > 0 {
		sortDirection = &direction[0]
	}
	q.orderByClauses = append(q.orderByClauses, OrderBy{
		expression: expression,
		direction:  sortDirection,
	})

	return q
}

func (q *QueryBuilder) Limit(limit int) *QueryBuilder {
	q.limit = &limit

	return q
}

func (q *QueryBuilder) Offset(offset int) *QueryBuilder {
	q.offset = &offset

	return q
}

func (q *QueryBuilder) ToSQL() (string, []interface{}, errors.Error) {
	return q.toSQLArgBase(1)
}

func (q *QueryBuilder) toSQLArgBase(argBase int) (string, []interface{}, errors.Error) {
	var query string
	var args []interface{}

	// look for $?

	searchFromIndex := 0
	nextArgStringIndex := strings.Index(q.base, "$?")
	argsFound := 0

	for nextArgStringIndex != -1 {
		nextArgStringIndex = nextArgStringIndex + searchFromIndex
		argIndex := argBase + argsFound
		argsFound++

		argString := fmt.Sprintf("$%d", argIndex)

		query += q.base[searchFromIndex:nextArgStringIndex] + argString
		searchFromIndex = nextArgStringIndex + 2
		nextArgStringIndex = strings.Index(q.base[searchFromIndex:], "$?")
	}

	query += q.base[searchFromIndex:]

	if argsFound != len(q.args) {
		return "", nil, errors.New(fmt.Sprintf("expected %d args, got %d", argsFound, len(q.args)))
	}

	args = append(args, q.args...)

	// joins
	for _, join := range q.joins {
		joinQuery, joinArgs, err := join.query.toSQLArgBase(len(args) + 1)
		if err != nil {
			return "", nil, err
		}

		joinText := " join "
		if join.left {
			joinText = " left join "
		}

		query += joinText + joinQuery
		args = append(args, joinArgs...)
	}

	// where clauses, joined with and
	if len(q.whereClauses) > 0 {
		query += " where "

		var whereSQLStrings []string
		for _, whereClause := range q.whereClauses {
			whereSQL, whereArgs, err := whereClause.toSQLArgBase(len(args) + 1)
			if err != nil {
				return "", nil, err
			}

			whereSQLStrings = append(whereSQLStrings, whereSQL)
			args = append(args, whereArgs...)
		}

		fullWhere := strings.Join(whereSQLStrings, " and ")
		query += fullWhere
	}

	// order
	if len(q.orderByClauses) > 0 {
		query += " order by "

		var orderBySQLStrings []string
		for _, orderByClause := range q.orderByClauses {
			orderBySQL := orderByClause.expression
			if orderByClause.direction != nil {
				orderBySQL += " " + string(*orderByClause.direction)
			}

			orderBySQLStrings = append(orderBySQLStrings, orderBySQL)
		}

		fullOrderBy := strings.Join(orderBySQLStrings, ", ")

		query += fullOrderBy
	}

	// limit and offset
	if q.limit != nil {
		query += fmt.Sprintf(" limit %d", *q.limit)
	}

	if q.offset != nil {
		query += fmt.Sprintf(" offset %d", *q.offset)
	}

	return query, args, nil
}
