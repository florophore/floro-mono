## Floro Database

### Setup

in postgres paste sql from sql/create_dbs.sql

### Migrations

to run migrations do `yarn typeorm:migrate`

to generate new migration do `NAME=<snake_case_migration_name> yarn typeorm:generate`

to revert do `yarn typeorm:revert`


### Contexts

We borrow the <a href="https://hexdocs.pm/phoenix/contexts.html">context pattern</a> from the Phoenix web framework for managing relational DB access. This has worked well for us in past projects.