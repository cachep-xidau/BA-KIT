---
name: database-design
description: Design schemas, write queries for MongoDB and PostgreSQL. Use for database design, SQL/NoSQL queries, aggregation pipelines, indexes, migrations, performance optimization, psql CLI.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Database Design

> **Learn to THINK, not copy patterns.** Principles + operational guides for MongoDB & PostgreSQL.

---

## Selective Reading Rule

**Read ONLY files relevant to the request!** Check content map below.

---

## Content Map

### Decision Framework
| File | Description | When to Read |
|------|-------------|--------------|
| `database-selection.md` | PostgreSQL vs Neon vs Turso vs SQLite | Choosing database |
| `orm-selection.md` | Drizzle vs Prisma vs Kysely | Choosing ORM |
| `schema-design.md` | Normalization, PKs, relationships | Designing schema |
| `indexing.md` | Index types, composite indexes | Performance tuning |
| `optimization.md` | N+1, EXPLAIN ANALYZE | Query optimization |
| `migrations.md` | Safe migrations, serverless DBs | Schema changes |

### MongoDB References
| File | Description | When to Read |
|------|-------------|--------------|
| `references/mongodb-crud.md` | CRUD operations, query operators | Basic operations |
| `references/mongodb-aggregation.md` | Aggregation pipeline, stages | Data transformation |
| `references/mongodb-indexing.md` | Index types, performance | Optimization |
| `references/mongodb-atlas.md` | Atlas cloud setup, monitoring | Cloud deployment |

### PostgreSQL References
| File | Description | When to Read |
|------|-------------|--------------|
| `references/postgresql-queries.md` | SELECT, JOINs, CTEs, window functions | Query writing |
| `references/postgresql-psql-cli.md` | psql commands, meta-commands | CLI operations |
| `references/postgresql-performance.md` | EXPLAIN, vacuum, indexes | Performance |
| `references/postgresql-administration.md` | Users, backups, replication | Admin tasks |

### Database Stacks
| File | Description | When to Read |
|------|-------------|--------------|
| `stacks/postgres.md` | PostgreSQL specific patterns | Postgres projects |
| `stacks/mysql.md` | MySQL specific patterns | MySQL projects |
| `stacks/sqlite.md` | SQLite specific patterns | Local/embedded DB |
| `stacks/d1_cloudflare.md` | Cloudflare D1 patterns | Edge deployment |
| `stacks/bigquery.md` | BigQuery analytics | Data warehouse |

### Patterns
| File | Description | When to Read |
|------|-------------|--------------|
| `analytics.md` | OLAP patterns, analytics queries | Analytics features |
| `transactional.md` | OLTP patterns, transactions | Transaction systems |
| `db-design.md` | Fact/dimension tables, schema design | Data modeling |
| `incremental-etl.md` | ETL patterns, incremental updates | Data pipelines |

---

## Python Utilities

| Script | Purpose |
|--------|---------|
| `scripts/schema_validator.py` | Validate schema structure |
| `scripts/db_migrate.py` | Generate/apply migrations |
| `scripts/db_backup.py` | Backup and restore |
| `scripts/db_performance_check.py` | Analyze slow queries |

```bash
python scripts/db_migrate.py --db mongodb --generate "add_user_index"
python scripts/db_backup.py --db postgres --output /backups/
python scripts/db_performance_check.py --db mongodb --threshold 100ms
```

---

## Decision Checklist

Before designing schema:

- [ ] Asked user about database preference?
- [ ] Chosen database for THIS context?
- [ ] Considered deployment environment?
- [ ] Planned index strategy?
- [ ] Defined relationship types?

---

## Best Practices

**MongoDB:**
- Embed for 1-to-few, reference for 1-to-many
- Index frequently queried fields
- Use aggregation for complex transformations
- Enable auth + TLS in production

**PostgreSQL:**
- Normalize to 3NF, denormalize for performance
- Use foreign keys for referential integrity
- Regular VACUUM and ANALYZE
- Connection pooling (pgBouncer) for web apps

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Default to PostgreSQL for simple apps | SQLite may suffice |
| Skip indexing | Plan indexes upfront |
| Use SELECT * in production | Specify columns |
| Store JSON when structured is better | Use proper schema |
| Ignore N+1 queries | Use EXPLAIN ANALYZE |

---

## Resources

- MongoDB: https://www.mongodb.com/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- MongoDB University: https://learn.mongodb.com/
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
