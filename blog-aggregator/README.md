# Gator

Gator is a small command-line RSS feed aggregator. It stores users, feeds, and
posts in PostgreSQL.

## What you need

- Node.js 22 (the project includes an `.nvmrc` file)
- PostgreSQL
- A PostgreSQL connection URL for a database you can use

Install the project dependencies first:

```bash
npm install
```

## Configure Gator

Gator reads its configuration from `~/.gatorconfig.json` in your home
directory. Create that file with your PostgreSQL connection URL:

```json
{
  "db_url": "postgres://username:password@localhost:5432/gator"
}
```

Replace the values in the URL with your PostgreSQL username, password, host,
port, and database name. The database must already exist.

Run the database migrations after creating the config file:

```bash
npm run migrate
```

## Run Gator

Commands are run through the `start` script. Pass the command and its
arguments after `--`:

```bash
npm run start -- register alice
```

Some useful commands:

```bash
# Show all registered users
npm run start -- users

# Add an RSS feed and follow it as the current user
npm run start -- addfeed "The Daily Update" https://example.com/feed.xml

# List all available feeds
npm run start -- feeds

# Follow an existing feed
npm run start -- follow https://example.com/feed.xml

# Show the feeds you follow
npm run start -- following

# Fetch new posts every minute (press Ctrl+C to stop)
npm run start -- agg 1m

# Browse the latest posts (defaults to 2)
npm run start -- browse
npm run start -- browse 10
```

Before using commands that operate on feeds or posts, register a user or log
in as an existing one:

```bash
npm run start -- login alice
```

The current username is saved in `~/.gatorconfig.json` alongside `db_url`.
