# Local testing

- install [Docker Desktop](https://docs.docker.com/desktop/)
- run `docker-compose up` in root folder
- NOTE: Starting the app can take some minutes, look for logs like "VITE v5.4.20 ready in xxx ms" for the frontend AND "App listening at https://localhost" for the backend.
  **be patient.**
- after the docker is up, navigate to:
  - localhost:3000 for the UI
  - localhost/docs for the swagger documentation

# Development

- run `npm install` on the root
- run `npm run build` on the root
- open one shell and go to ./dev-db and run `docker-compose up`
- open a shell and run `npm run watch`

  you can also start backend and frontend separately with:
  - `npm run watch:backend`
  - `npm run watch:frontend`

# Running unit tests

- run all unit tests from root by `npm run test`
- run a single unit test from root by `npm run test -- --testNamePattern <pattern>`
- e.g. `npm run test -- --testNamePattern "can create user"`
- to run unit tests with coverage report, navigate to any npm workspace and run `npm run test -- --coverage`

# Cleanup

- to delete the build folder and coverage reports run `npm run clean` on any workspace or root
- to run the aforementioned clean plus remove node_modules run `npm run reset` on any workspace or root.

# Test users credentials

- system:test
- test:test

# Installing frontend manually to remote

- run `npm run build` on the root
- run `npm run build` on the frontend
- upload /frontend/build folder to server
