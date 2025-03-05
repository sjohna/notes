package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"notes/common"
	"notes/repo"
	"time"
)

var client http.Client

const testServerURL = "http://localhost:3000"

var authToken string

func main() {
	err := runTests()
	if err != nil {
		fmt.Printf("ERROR RUNNING TESTS: %v", err)
	}
}

func runTests() error {
	// steps:
	// log in and store token (assume local server for now)
	// record state of things initially, for comparison (just number of notes for now)
	// run tests

	// tests:
	// create a note
	// create a tag
	// create a group
	// put tag on note
	// put note in group
	// remove tag
	// remove from group
	// create second tag and do bulk updates on note
	// create lots of notes and get

	client = http.Client{Timeout: 10 * time.Second}

	noAuthorizationHeader()

	token, err := login()
	if err != nil {
		return err
	}

	badAuthorizationHeader()

	authToken = token

	return loggedInTests()
}

func loggedInTests() error {
	initialInfo, err := getGeneralInfo()
	if err != nil {
		return err
	}

	createdNote, err := createNote("First note from test harness")
	if err != nil {
		return err
	}

	infoAfterNoteCreation, err := getGeneralInfo()
	if err != nil {
		return err
	}

	fmt.Printf("TEST: Last Created Note Info: ")
	if infoAfterNoteCreation.LastCreatedDocumentID.Int64 != createdNote.ID || infoAfterNoteCreation.LastCreatedDocumentTime.Time != createdNote.CreatedAt {
		fmt.Printf("FAILED: data does not match!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Note Count Increment: ")
	if infoAfterNoteCreation.DocumentCount != initialInfo.DocumentCount+1 {
		fmt.Printf("FAILED: count did not increase by 1\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	err = testGetNotes()
	if err != nil {
		return err
	}

	return nil
}

func testGetNotes() error {
	// create some more notes
	created1, err := createNote("From test harness 1")
	if err != nil {
		return err
	}

	created2, err := createNote("From test harness 2")
	if err != nil {
		return err
	}

	_, err = createNote("From test harness 3")
	if err != nil {
		return err
	}

	created4, err := createNote("From test harness 4")
	if err != nil {
		return err
	}

	created5, err := createNote("From test harness 5")
	if err != nil {
		return err
	}

	// test querying for notes
	fmt.Printf("TEST: Get Notes With No Parameters: ")
	documents, err := getDocuments(nil)
	if err != nil {
		return err
	}

	if !documentListContainsAll(documents, []string{"From test harness 1", "From test harness 2", "From test harness 3", "From test harness 4", "From test harness 5"}) {
		fmt.Printf("FAILED: not all newly created documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Get Only 5 Most Recent Based on Time Range: ")
	parameters := common.NoteQueryParameters{
		StartTime: null.TimeFrom(created1.CreatedAt),
		EndTime:   null.TimeFrom(created5.CreatedAt),
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 5", "From test harness 4", "From test harness 3", "From test harness 2", "From test harness 1"}) {
		fmt.Printf("FAILED: not all newly created documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Get Middle 3 of 5 Created Based on Time Range: ")
	parameters = common.NoteQueryParameters{
		StartTime: null.TimeFrom(created2.CreatedAt),
		EndTime:   null.TimeFrom(created4.CreatedAt),
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 4", "From test harness 3", "From test harness 2"}) {
		fmt.Printf("FAILED: not all appropriate documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Get Documents in Reverse Time Order: ")
	parameters = common.NoteQueryParameters{
		StartTime:     null.TimeFrom(created1.CreatedAt),
		EndTime:       null.TimeFrom(created5.CreatedAt),
		SortBy:        null.StringFrom("document_time"),
		SortDirection: null.StringFrom("ascending"),
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 1", "From test harness 2", "From test harness 3", "From test harness 4", "From test harness 5"}) {
		fmt.Printf("FAILED: not all appropriate documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	// some pagination tests
	fmt.Printf("TEST: Get Page 1 of 5 items/page: ")
	parameters = common.NoteQueryParameters{
		Pagination: &common.PaginationParameters{
			ItemsPerPage: 5,
			PageNumber:   1,
		},
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 5", "From test harness 4", "From test harness 3", "From test harness 2", "From test harness 1"}) {
		fmt.Printf("FAILED: not all appropriate documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Get Page 1 of 4 items/page: ")
	parameters = common.NoteQueryParameters{
		Pagination: &common.PaginationParameters{
			ItemsPerPage: 4,
			PageNumber:   1,
		},
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 5", "From test harness 4", "From test harness 3", "From test harness 2"}) {
		fmt.Printf("FAILED: not all appropriate documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Get Page 2 of 2 items/page: ")
	parameters = common.NoteQueryParameters{
		Pagination: &common.PaginationParameters{
			ItemsPerPage: 2,
			PageNumber:   2,
		},
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 3", "From test harness 2"}) {
		fmt.Printf("FAILED: not all appropriate documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	fmt.Printf("TEST: Get Documents in Reverse Time Order, Page 2 of 2 items/page: ")
	parameters = common.NoteQueryParameters{
		StartTime:     null.TimeFrom(created1.CreatedAt),
		EndTime:       null.TimeFrom(created5.CreatedAt),
		SortBy:        null.StringFrom("document_time"),
		SortDirection: null.StringFrom("ascending"),
		Pagination: &common.PaginationParameters{
			ItemsPerPage: 2,
			PageNumber:   2,
		},
	}

	documents, err = getDocuments(&parameters)
	if err != nil {
		return err
	}

	if !documentListContainsOnlyInOrder(documents, []string{"From test harness 3", "From test harness 4"}) {
		fmt.Printf("FAILED: not all appropriate documents returned!\n")
	} else {
		fmt.Printf("PASSED\n")
	}

	return nil
}

func documentListContainsAll(documents []*repo.Document, contents []string) bool {
	contentFound := make(map[string]bool)
	for _, document := range documents {
		contentFound[document.LatestVersion.Content] = true
	}

	for _, content := range contents {
		if _, ok := contentFound[content]; !ok {
			return false
		}
	}

	return true
}

func documentListContainsOnlyInOrder(documents []*repo.Document, contents []string) bool {
	if len(documents) != len(contents) {
		return false
	}

	for i := 0; i < len(documents); i++ {
		if documents[i].LatestVersion.Content != contents[i] {
			return false
		}
	}

	return true
}

func createNote(content string) (*repo.Document, error) {
	var body struct {
		Content string `json:"content"`
	}

	body.Content = content

	resp, err := auth("POST", "/note/create", body)
	expectStatusCode("Create Note", resp, err, http.StatusOK)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var ret repo.Document

	err = json.NewDecoder(resp.Body).Decode(&ret)
	return &ret, err
}

func getGeneralInfo() (*repo.AuthorInfo, error) {
	resp, err := auth("GET", "/general/info", nil)
	expectStatusCode("GET General Info", resp, err, http.StatusOK)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var ret repo.AuthorInfo
	err = json.NewDecoder(resp.Body).Decode(&ret)
	return &ret, err
}

func noAuthorizationHeader() {
	// test that we can't access routes when not logged in
	testUnauth("POST", "/group")
	testUnauth("POST", "/group/create")

	testUnauth("GET", "/general/info")

	testUnauth("POST", "/note")
	testUnauth("POST", "/note/create")
	testUnauth("POST", "/note/update_tags")
	testUnauth("POST", "/note/update_groups")

	testUnauth("POST", "/tag")
	testUnauth("POST", "/tag/create")
}

func badAuthorizationHeader() {
	oldAuthToken := authToken
	authToken = "obviouslyBadBearerToken"

	testBadAuth("POST", "/group")
	testBadAuth("POST", "/group/create")

	testBadAuth("GET", "/general/info")

	testBadAuth("POST", "/note")
	testBadAuth("POST", "/note/create")
	testBadAuth("POST", "/note/update_tags")
	testBadAuth("POST", "/note/update_groups")

	testBadAuth("POST", "/tag")
	testBadAuth("POST", "/tag/create")

	authToken = oldAuthToken
}

func testUnauth(method string, url string) {
	resp, err := unauth(method, url, nil)
	expectStatusCode(fmt.Sprintf("Unauth %s %s", method, url), resp, err, http.StatusUnauthorized)
}

func testBadAuth(method string, url string) {
	resp, err := auth(method, url, nil)
	expectStatusCode(fmt.Sprintf("Bad token %s %s", method, url), resp, err, http.StatusUnauthorized)
}

func expectStatusCode(testName string, resp *http.Response, err error, statusCode int) {
	fmt.Printf("TEST: %s: ", testName)
	if err != nil {
		fmt.Printf("ERROR: %v\n", err)
	} else if resp.StatusCode != statusCode {
		fmt.Printf("FAILED: expect %d, got %d\n", statusCode, resp.StatusCode)
	} else {
		fmt.Printf("PASSED\n")
	}
}

func login() (string, error) {
	var body struct {
		Username string `json:"userName"`
		Password string `json:"password"`
	}

	body.Username = "test"
	body.Password = "testPassword1"

	resp, err := unauth("POST", "/auth/login", body)
	expectStatusCode("Login", resp, err, 200)
	if err != nil {
		return "", err
	}

	var response struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	return response.Token, nil
}

func unauth(method string, url string, body interface{}) (*http.Response, error) {
	postBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(method, testServerURL+url, bytes.NewBuffer(postBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	return client.Do(req)
}

func auth(method string, url string, body interface{}) (*http.Response, error) {
	postBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(method, testServerURL+url, bytes.NewBuffer(postBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authToken)
	return client.Do(req)
}

func getDocuments(parameters *common.NoteQueryParameters) ([]*repo.Document, error) {
	resp, err := auth("POST", "/note", parameters)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var response struct {
		Documents  []*repo.Document           `json:"documents"`
		Parameters common.NoteQueryParameters `json:"parameters"`
	}

	err = json.NewDecoder(resp.Body).Decode(&response)
	return response.Documents, err
}
