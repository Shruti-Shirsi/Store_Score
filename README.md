# StoreScore

A role-based store rating platform built with React, Express, and MySQL.

## Run locally

1. Create a MySQL database named `store_score` and run `server/sql/schema.sql`.
2. Copy `server/.env.example` to `server/.env` and update MySQL credentials.
3. Run `npm install` from this directory, then `npm run dev`.
4. Open http://localhost:5173. The API runs on port 4000.

Demo password for all seeded accounts: `Demo@123`

| Role | Email |
|---|---|
| Administrator | admin@storescore.demo |
| Store owner | owner@storescore.demo |
| Normal user | user@storescore.demo |

## Highlights

- JWT auth and protected role-based API routes
- MySQL relational schema with foreign keys, unique constraints, and rating upserts
- Server-side validation, filtering, sorting and aggregation
- Responsive React UI for administrator, customer and owner workflows
