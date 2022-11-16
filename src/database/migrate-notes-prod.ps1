param(
  [Parameter(Mandatory=$true)]
  [String]$dbPassword
)

migrate -database "postgres://postgres:${dbPassword}@homeserver:5432/notes-prod?sslmode=disable" -path migrations up