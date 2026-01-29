# Production Deployment (Server)

This repo contains a production-ready Docker Compose setup using Caddy as reverse proxy (TLS + host routing).

## Domains

- Frontend: `https://assettrack.gruen-ist-bund.de`
- API: `https://api.assettrack.gruen-ist-bund.de`

## 1) DNS

Create A/AAAA records pointing both domains to your server IP:

- `assettrack.gruen-ist-bund.de`
- `api.assettrack.gruen-ist-bund.de`

## 2) Server prerequisites

- Docker Engine installed
- Docker Compose plugin available (`docker compose`)
- Ports `80` and `443` reachable from the internet

## 3) Deploy

1. Clone the repository on the server.
2. Create a production env file:

   - Copy `.env.prod.example` to `.env.prod`
   - Set values:
     - `JWT_SECRET_KEY` (long random string)
     - `CORS_ORIGINS=https://assettrack.gruen-ist-bund.de`
     - `NEXT_PUBLIC_API_URL=https://api.assettrack.gruen-ist-bund.de/api`

3. Start the stack:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 4) Verify

```bash
curl -i https://api.assettrack.gruen-ist-bund.de/api/health
```

Open `https://assettrack.gruen-ist-bund.de` in the browser and test login + asset list.

## Data persistence

- SQLite database is stored at `asset-track-backend/instance/assettrack.db` and mounted into the backend container.
- Caddy TLS state is stored in named volumes `caddy_data` and `caddy_config`.
