# Installing frontend

- run `npm run build` on the root
- run `npm run build` on the frontend
- upload /frontend/build folder to server

# Development

- run `npm install` on the root
- run `npm run build` on the root
- open one shell and go to ./db and run `docker-compose up`
- open another shell to /backend folder and run `npm run watch`
- open a third shell to /frontend folder and run `npm run watch`

# Local testing

- run `docker-compose up` in root folder
- after the docker is up, navigate to:
  - localhost:3000 for the UI
  - localhost/docs for the swagger documentation

# Running unit tests

- run all unit tests from root by `npm run test`
- run a single unit test from root by `npm run test -- --testNamePattern <pattern>`
- e.g. `npm run test -- --testNamePattern can create user`
