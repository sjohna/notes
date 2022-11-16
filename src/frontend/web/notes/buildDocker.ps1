Remove-Item -Recurse -Path .\dist
Copy-Item -Path ./src/environment/environment.homeServer.ts -Destination ./src/environment/environment.ts
npm run build
docker build -t notes-web:0.1.0 -f docker/dockerfile .
docker save notes-web:0.1.0 -o ./docker/images/notes-web.0.1.0.tar
Copy-Item -Path src/environment/environment.local.ts -Destination src/environment/environment.ts