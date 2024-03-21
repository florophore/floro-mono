# Floro Desktop App


### setup
Make sure you have downloaded all dependencies from the root of the mono-repo. Also make sure to build GraphQL deps with `yarn graphql-schemas:build` from root of mono-repo.

### starting the project

to target your local development environment from this directory run

`yarn watch`

to target floro.io run

`BUILD_ENV=prod yarn watch`

to target floro-staging.com run

`BUILD_ENV=staging yarn watch`