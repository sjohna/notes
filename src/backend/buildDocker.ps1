docker build -t notes-server:0.2.0 -f docker/dockerfile .
docker save notes-server:0.2.0 -o ./docker/images/notes-server.0.2.0.tar