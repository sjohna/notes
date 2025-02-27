package utilities

import (
	"reflect"
	"testing"
)

func TestBasicQueries_ToSQL(t *testing.T) {
	type test struct {
		sql          string
		args         []interface{}
		expectedSQL  string
		expectedArgs []interface{}
		expectError  bool
	}

	tests := []test{
		{
			"select * from document",
			nil,
			"select * from document",
			nil,
			false,
		},
		{
			"select col = $? from document",
			[]interface{}{7},
			"select col = $1 from document",
			[]interface{}{7},
			false,
		},
		{
			"select col1 = $?, col2 = $? from document",
			[]interface{}{7, 8},
			"select col1 = $1, col2 = $2 from document",
			[]interface{}{7, 8},
			false,
		},
		{
			"select * from document",
			[]interface{}{7},
			"",
			nil,
			true,
		},
		{
			"select col = $? from document",
			nil,
			"",
			nil,
			true,
		},
		{
			"select col = $? from document",
			[]interface{}{7, 8},
			"",
			nil,
			true,
		},
	}

	for _, tc := range tests {
		sql, args, err := BaseQuery(tc.sql, tc.args...).ToSQL()
		if tc.expectError && err == nil {
			t.Errorf("Expected error for SQL '%s', got no error", tc.sql)
		} else if !tc.expectError && err != nil {
			t.Errorf("Expected no error for SQL '%s', got error: %s", tc.sql, err)
		}

		if err != nil || tc.expectError {
			continue
		}

		if sql != tc.expectedSQL {
			t.Errorf("Expected SQL '%s', got '%s'", tc.expectedSQL, sql)
		}

		if !reflect.DeepEqual(args, tc.expectedArgs) {
			t.Errorf("Expected args %v, got %v", tc.expectedArgs, args)
		}
	}
}

func TestQueriesWithJoins_ToSQL(t *testing.T) {
	t.Run("NoArgumentsToJoin", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Join("author on document.author_id = author.id")

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
			return
		}

		if sql != "select * from document join author on document.author_id = author.id" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{}
		if args != nil && !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("ArgumentsToJoin", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Join("author on document.author_id = author.id and author.created_at between $? and $?", 1, 2) // fake args

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
			return
		}

		if sql != "select * from document join author on document.author_id = author.id and author.created_at between $1 and $2" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{1, 2}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("ArgumentsToBothBaseAndJoin", func(t *testing.T) {
		query := BaseQuery("select document.created_at > $? from document", 7).
			Join("author on document.author_id = author.id and author.created_at between $? and $?", 1, 2) // fake args

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
			return
		}

		if sql != "select document.created_at > $1 from document join author on document.author_id = author.id and author.created_at between $2 and $3" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{7, 1, 2}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("MultipleJoins", func(t *testing.T) {
		query := BaseQuery("select document.created_at > $? from document", 7).
			Join("author on document.author_id = author.id and author.created_at between $? and $?", 1, 2).
			LeftJoin("document_tag on document.id = document_tag.id").
			Join("some_table on document.col = some_table.col and some_table.col2 = $?", 17)

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
			return
		}

		if sql != "select document.created_at > $1 from document join author on document.author_id = author.id and author.created_at between $2 and $3 left join document_tag on document.id = document_tag.id join some_table on document.col = some_table.col and some_table.col2 = $4" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{7, 1, 2, 17}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("InsufficientArgumentsToJoin", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Join("author on document.author_id = author.id and author.created_at between $? and $?", 1)

		_, _, err := query.ToSQL()
		if err == nil {
			t.Error("Expected error")
			return
		}
	})

	t.Run("TooManyArgumentsToJoin", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Join("author on document.author_id = author.id and author.created_at between $? and $?", 1, 2, 3)

		_, _, err := query.ToSQL()
		if err == nil {
			t.Error("Expected error")
			return
		}
	})
}

func TestQueriesWithWhere_ToSQL(t *testing.T) {
	t.Run("NoArgumentsToWhere", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Where("document.id > 10")

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}

		if sql != "select * from document where document.id > 10" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{}
		if args != nil && !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("ArgumentsToWhere", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Where("document.id > $? and document.created_at > $?", 10, 12)

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}

		if sql != "select * from document where document.id > $1 and document.created_at > $2" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{10, 12}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("TwoWhereClauses", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Where("document.id > $?", 10).
			Where("document.created_at > $?", 12)

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}

		if sql != "select * from document where document.id > $1 and document.created_at > $2" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{10, 12}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("JoinAndWhere", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Join("author on document.author_id = author.id").
			Where("document.id > $?", 10)

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}

		if sql != "select * from document join author on document.author_id = author.id where document.id > $1" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{10}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("WhereThenJoin", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Where("document.id > $?", 10).
			Join("author on document.author_id = author.id")

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}

		if sql != "select * from document join author on document.author_id = author.id where document.id > $1" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{10}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})

	t.Run("InsufficientArgumentsToWhere", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Where("document.id > $?")

		_, _, err := query.ToSQL()
		if err == nil {
			t.Error("Expected error")
		}
	})

	t.Run("TooManyArgumentsToWhere", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Where("document.id > $?", 1, 2)

		_, _, err := query.ToSQL()
		if err == nil {
			t.Error("Expected error")
		}
	})
}

func TestQueryPart_ComplexQueries(t *testing.T) {
	t.Run("Test1", func(t *testing.T) {
		query := BaseQuery("select * from document").
			Join("author on document.author_id = author.id").
			Where("document.id > $?", 10).
			OrderBy("document.created_at", SortAscending).
			Limit(100).
			Offset(100)

		sql, args, err := query.ToSQL()
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}

		if sql != "select * from document join author on document.author_id = author.id where document.id > $1 order by document.created_at asc limit 100 offset 100" {
			t.Errorf("Unexpected SQL: %s", sql)
		}

		expectedArgs := []interface{}{10}
		if !reflect.DeepEqual(args, expectedArgs) {
			t.Errorf("Expected args %v, got %v", expectedArgs, args)
		}
	})
}
