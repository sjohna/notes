param(
  [Parameter(Mandatory=$true)]
  [String]$dbPassword
)

migrate -database "postgres://postgres:${dbPassword}@localhost:5432/notes-dev?sslmode=disable" -path migrations up