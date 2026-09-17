# Chirpy API

Chirpy is a lightweight, production-ready RESTful social media back-end API
built with Node.js, Express, TypeScript, Drizzle ORM, and PostgreSQL.

It provides a complete authentication flow with Argon2 password hashing,
short-lived JWT access tokens, and database-backed refresh tokens. It also
includes profanity filtering, Chirpy Red membership webhooks, and flexible
chirp queries with author filtering and sorting.

## Installation and quickstart

### Prerequisites

- Node.js with support for `process.loadEnvFile()` (Node.js 20.6 or newer)
- PostgreSQL

### Configure the environment

Create a `.env` file in the project root:

```dotenv
DB_URL=postgres://postgres:postgres@localhost:5432/chirpy
PORT=8080
PLATFORM=dev
JWT_SECRET=replace-with-a-long-random-secret
POLKA_KEY=replace-with-your-polka-api-key
```

All five variables are required:

| Variable | Description |
| --- | --- |
| `DB_URL` | PostgreSQL connection string |
| `PORT` | Port on which the API listens |
| `PLATFORM` | Runtime platform. Set to `dev` to enable `POST /admin/reset` |
| `JWT_SECRET` | Secret used to sign and validate JWT access tokens |
| `POLKA_KEY` | API key expected by the Chirpy Red webhook |

### Install, migrate, and run

```bash
npm install
npm run migrate
npm run dev
```

`npm run dev` compiles the TypeScript source and starts the server. By
default, the API is available at `http://localhost:<PORT>`.

Run the test suite with:

```bash
npm test
```

## API documentation

### Conventions

- Unless otherwise noted, request bodies are JSON and should be sent with
  `Content-Type: application/json`.
- Timestamps are returned as JSON date-time strings.
- Bearer authentication uses:

  ```http
  Authorization: Bearer <token>
  ```

- Refresh-token endpoints also use the `Authorization` header, but the value
  is the refresh token rather than the JWT access token.
- Error responses use this shape:

  ```json
  {
    "error": "Description of the error"
  }
  ```

  Common status codes are `400` (invalid input), `401` (missing or invalid
  credentials), `403` (forbidden operation), and `404` (resource not found).

### Health and metrics

#### `GET /api/healthz`

**Authentication:** Public

Returns a plain-text health response.

**Success (`200 OK`)**

```text
OK
```

#### `GET /admin/metrics`

**Authentication:** Public

Returns an HTML page containing the number of requests served for the static
`/app` path.

**Success (`200 OK`)**

```html
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited 12 times!</p>
  </body>
</html>
```

#### `POST /admin/reset`

**Authentication:** Public; only enabled when `PLATFORM=dev`

Resets the `/app` request counter and deletes all users (and their related
records through database cascading). This endpoint returns `403 Forbidden`
when `PLATFORM` is not `dev`.

**Success (`200 OK`)**

```text
OK
```

### User management

#### `POST /api/users`

**Authentication:** Public

Creates a user. The email must be unique.

**Request body**

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple"
}
```

**Success (`201 Created`)**

```json
{
  "id": "2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123",
  "createdAt": "2026-09-17T14:40:00.000Z",
  "updatedAt": "2026-09-17T14:40:00.000Z",
  "email": "ada@example.com",
  "isChirpyRed": false
}
```

Passwords are hashed with Argon2 and are never returned. Duplicate emails
return `400 Bad Request`.

#### `PUT /api/users`

**Authentication:** Bearer access token

Updates the authenticated user's email and password.

**Request body**

```json
{
  "email": "ada+new@example.com",
  "password": "an-even-better-password"
}
```

**Success (`200 OK`)**

```json
{
  "id": "2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123",
  "createdAt": "2026-09-17T14:40:00.000Z",
  "updatedAt": "2026-09-17T14:45:00.000Z",
  "email": "ada+new@example.com",
  "isChirpyRed": false
}
```

### Authentication

#### `POST /api/login`

**Authentication:** Public

Authenticates a user and creates a one-hour JWT access token plus a
database-backed refresh token valid for 60 days.

**Request body**

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple"
}
```

**Success (`200 OK`)**

```json
{
  "id": "2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123",
  "createdAt": "2026-09-17T14:40:00.000Z",
  "updatedAt": "2026-09-17T14:40:00.000Z",
  "email": "ada@example.com",
  "isChirpyRed": false,
  "token": "<one-hour-jwt-access-token>",
  "refreshToken": "<sixty-day-refresh-token>"
}
```

Invalid credentials return `401 Unauthorized`.

#### `POST /api/refresh`

**Authentication:** Refresh token

Send the refresh token as a Bearer token:

```http
Authorization: Bearer <refresh-token>
```

**Success (`200 OK`)**

```json
{
  "token": "<new-one-hour-jwt-access-token>"
}
```

Missing, expired, or revoked refresh tokens return `401 Unauthorized`.

#### `POST /api/revoke`

**Authentication:** Refresh token

Send the refresh token as a Bearer token:

```http
Authorization: Bearer <refresh-token>
```

Revokes the refresh token.

**Success (`204 No Content`)**

The response has no body.

### Chirps

A chirp has this response shape:

```json
{
  "id": "a7d3bb19-6f22-4e88-9df9-14d3d4e8c456",
  "createdAt": "2026-09-17T14:50:00.000Z",
  "updatedAt": "2026-09-17T14:50:00.000Z",
  "body": "Hello from Chirpy!",
  "userId": "2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123"
}
```

#### `POST /api/chirps`

**Authentication:** Bearer access token

**Request body**

```json
{
  "body": "Hello from Chirpy!"
}
```

The body must be 140 characters or fewer. The words `kerfuffle`,
`sharbert`, and `fornax` (case-insensitive when separated by spaces) are
replaced with `****`.

**Success (`201 Created`)**

Returns one chirp object in the shape shown above.

#### `GET /api/chirps`

**Authentication:** Public

**Query parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `authorId` | UUID, optional | Return only chirps created by this user |
| `sort` | `asc` or `desc`, optional | Sort by creation time. Defaults to `asc`; only `desc` changes the order |

Examples:

```http
GET /api/chirps
GET /api/chirps?authorId=2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123&sort=desc
```

**Success (`200 OK`)**

Returns an array of chirp objects:

```json
[
  {
    "id": "a7d3bb19-6f22-4e88-9df9-14d3d4e8c456",
    "createdAt": "2026-09-17T14:50:00.000Z",
    "updatedAt": "2026-09-17T14:50:00.000Z",
    "body": "Hello from Chirpy!",
    "userId": "2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123"
  }
]
```

#### `GET /api/chirps/:chirpId`

**Authentication:** Public

Returns a single chirp by UUID.

**Example**

```http
GET /api/chirps/a7d3bb19-6f22-4e88-9df9-14d3d4e8c456
```

**Success (`200 OK`)**

Returns one chirp object in the standard chirp shape. A missing chirp returns
`404 Not Found`.

#### `DELETE /api/chirps/:chirpId`

**Authentication:** Bearer access token

Deletes a chirp only when the authenticated user owns it.

**Example**

```http
DELETE /api/chirps/a7d3bb19-6f22-4e88-9df9-14d3d4e8c456
Authorization: Bearer <access-token>
```

**Success (`204 No Content`)**

The response has no body. A chirp owned by another user returns
`403 Forbidden`.

### Webhooks

#### `POST /api/polka/webhooks`

**Authentication:** API key

Send the configured Polka key using the `ApiKey` authorization scheme:

```http
Authorization: ApiKey <POLKA_KEY>
```

**Request body**

```json
{
  "event": "user.upgraded",
  "data": {
    "userId": "2f1c4b53-3d5d-4ed0-a9f6-6ed4db7ce123"
  }
}
```

For a valid `user.upgraded` event, the user's `isChirpyRed` flag is set to
`true`.

**Success (`204 No Content`)**

The response has no body. Events other than `user.upgraded` and malformed
upgrade payloads are intentionally acknowledged with `204`. An invalid API
key returns `401 Unauthorized`; an unknown user for a valid upgrade event
returns `404 Not Found`.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Compile TypeScript and start the server |
| `npm start` | Start the compiled server from `dist/index.js` |
| `npm run build` | Compile TypeScript |
| `npm run generate` | Generate Drizzle migrations |
| `npm run migrate` | Apply pending Drizzle migrations |
| `npm test` | Run Vitest tests once |
