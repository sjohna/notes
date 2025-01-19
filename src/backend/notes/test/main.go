package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
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

	initialInfo, err := getGeneralInfo()
	if err != nil {
		return err
	}

	createdNote, err := createNote("Note created from test harness")
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

	return nil
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
	testUnauth("POST", "/note/total_by_date")
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
	testBadAuth("POST", "/note/total_by_date")
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
