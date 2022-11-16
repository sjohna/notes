docker build -t notes-server:0.1.0 -f docker/dockerfile .
docker save notes-server:0.1.0 -o ./docker/images/notes-server.0.1.0.tar