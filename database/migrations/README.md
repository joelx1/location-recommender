# Database Migrations

Versioned SQL scripts for tracking schema changes over time.

## How it works

Each change to the schema gets its own numbered script:

```
V001__initial_schema.sql
V002__users_add_bio_profile_pic.sql
V003__locations_add_score.sql
...
```

## Rules

1. **Never edit an existing migration.** Once a script is committed, treat it as read-only — other people may have already run it.
2. **Always add a new script** for any schema change, no matter how small.
3. **Run scripts in order** — V001 before V002, etc.
4. Scripts are plain SQL. Run them with `psql` or your SQL client of choice.

## Applying migrations locally

For a fresh database, run `schema.sql` from the parent folder — it creates everything in one go.

For updates, run migration scripts in order. If multiple were added since you last synced, run them lowest to highest (V001 before V002, etc.).

