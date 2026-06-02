# Claudiometro: Setup and Deployment Guide

> **Note for human readers**
> This guide is primarily written to be consumed by an AI coding agent (e.g. Claude Code) that will execute or orchestrate the setup on your behalf. It is intentionally terse and directive. If you landed here looking for context on what claudiometro is and why it exists, read the [companion Medium article first](https://medium.com/@danielepiscaglia/claudiometro-a-tiny-always-on-dashboard-for-claude-code-limits-02c90caa97dc). Once you're ready to set it up, paste the prompt at the end of that article into your claude code to point it to this guide and he will do everything for you.

---

> **For the AI coding agent**
> Read this entire guide before writing any code or commands. At each major step, ask the user for confirmation and environment details. Always prefer local/LAN-only access and never expose or log OAuth tokens; only handle `.credentials.json` as described in the repository.

## Prerequisites

The **only hard requirements** are:

- A Claude Code subscription and at least one machine where Claude Code is (or can be) authenticated, so that a `~/.claude/.credentials.json` file exists.
- **Node.js 18 or 20** on the machine the user will run the credentials upload script from. This is required regardless of whether the service itself runs via Docker or from source, because the helper script (`scripts/push-credentials.mjs`) that pushes the local credentials to the remote instance is a plain Node script.
- **Docker** (or a Docker-based platform like TrueNAS SCALE) on the target machine, **if the user wants the Docker path**.
- **Git + Node.js 18/20** on the target machine, **if the user wants the from-source path**.
- The target machine must have outbound internet access to `api.anthropic.com` and `console.anthropic.com`, with working DNS resolution.

> **Clarification on Node.js and Docker:** Even if the user deploys via Docker (meaning the service itself runs containerized and does not require Node on the host), Node.js is still needed on the PC or machine where the user manages their Claude Code credentials, in order to run `push-credentials.mjs`. Ask the user which machine they plan to run the script from and confirm Node is available there.

## Relevant links

- Source code github repo: https://github.com/danipisca07/claudiometro 
- Docker hub container image: https://hub.docker.com/repository/docker/danipisca07/claudiometro

## Project overview (high-level)

Claudiometro has three main parts:

- A **Node.js/TypeScript service** (Express) that reads Claude Code OAuth credentials, fetches usage data from Anthropic, exposes a REST API, and persists scheduled pings in a small JSON file.
- A **minimal static frontend** (HTML/CSS/JS) served by the same process, showing gauges for the 5-hour and weekly usage windows and any extra credits.
- A **helper script** (`scripts/push-credentials.mjs`) that uploads the user's local `.credentials.json` to the running instance via an authenticated admin endpoint.

All file-level details (exact env vars, Dockerfile, Compose structure) are in the repository. Read them there when you need specifics.

## Step 1 — Gather information before doing anything

Before writing a single command, ask the user:

1. **Do you want to use Docker, or run from source?**

   - Docker is recommended if the target machine already has it, especially for always-on deployments (NAS, server).
   - From source requires Git and Node.js on the target machine.
1. **Where do you want the service to run?** (local PC, home server, NAS such as TrueNAS SCALE, a VM, etc.)
1. **Can you give me direct CLI or SSH access to that machine, or should I only generate commands for you to copy-paste?**
1. **Which port do you want the dashboard on?** (default: 4317)
1. **Where on the target machine should we store** the credentials directory and the data directory for scheduled pings?
1. **On which machine will you run the credentials upload script?** (usually the PC where Claude Code is installed) — confirm Node.js is available there.

Use the answers to choose a path and proceed accordingly.

---

## Docker-based deployment

### Additional questions (Docker path)

- Is Docker already installed on the target machine?
- Is the target a TrueNAS SCALE device? (If yes, the user may prefer the Custom App UI instead of a compose file.)
- Do you want me to connect directly (e.g. via SSH) and run the deployment, or should I produce the files and commands for you to execute manually?

### High-level steps

1. **Prepare host directories** — create a `config` directory (for `.credentials.json`) and a `data` directory (for scheduled pings) on persistent storage on the target host.
2. **Write a `docker-compose.yml`** — use the public claudiometro image, map the chosen port, mount both directories, set the required environment variables (port, config dir, data dir, admin token), and configure explicit DNS servers if the platform is known to have DNS issues (e.g. TrueNAS). All configurable values should be marked `# ── CUSTOMIZE ──`.
3. **Start the container** — `docker compose up -d` (or platform equivalent). Confirm the container is running and logs show no startup errors.
4. **Push credentials** — on the user's PC, run `node scripts/push-credentials.mjs <BASE_URL> <ADMIN_TOKEN>` from the cloned repository. Confirm the script reports only metadata (expiry, scopes) and no raw token values.
5. **Verify** — ask the user to open the dashboard URL and confirm gauges load and update.

> **TrueNAS SCALE note:** If the user targets TrueNAS SCALE, guide them through the Custom App UI: set the image, port mapping, environment variables, host-path volumes (`config` dataset → `/config`, `data` dataset → `/data`), and explicit DNS entries. First-run sequence is the same: deploy, then push credentials from the PC.

---

## From-source deployment

### Additional questions (from-source path)

- Is Node.js (18 or 20) already installed on the target machine?
- Which directory should we clone the repository into?
- Where should the data directory for scheduled pings live (separate from the repo)?
- Do you want the service always-on (e.g. via systemd or pm2), or just manually started?

### High-level steps

1. **Clone the repository** into the chosen directory.
2. **Install dependencies** (`npm ci` or as instructed in the repo's README).
3. **Configure environment** — create the env file pointing to the credentials directory, data directory, port, and admin token. Ask the user for each value explicitly.
4. **Build and start** — run the TypeScript build step, then start the compiled server. Confirm the process is listening on the correct port.
5. **Always-on (optional)** — if the user wants the service to survive reboots, set up a systemd unit, pm2 process, or equivalent. Ensure the data directory is preserved across restarts.
6. **Push credentials** — same as the Docker path: run the helper script from the user's PC. Node.js must be available on that machine.
7. **Verify** — same as the Docker path.

---

## Verifying the running system

Regardless of deployment method, run through these checks:

1. **Health** — call `/health` and confirm the service responds with a success status.
2. **Dashboard** — open the root URL in a browser; confirm gauges for the 5-hour and weekly windows appear and auto-refresh.
3. **Immediate ping** — trigger a Haiku ping from the UI and confirm the 5-hour window reflects the new activity.
4. **Scheduled ping** — schedule a ping in the near future, confirm it appears in the scheduled list, and verify it fires as expected (even across a restart).

Remind the user: the dashboard is designed for LAN-only, plain HTTP access. For remote access from outside the LAN, recommend a VPN or a TLS reverse proxy — never expose the port directly to the internet.

---

## Troubleshooting

| Symptom / message                              | Likely cause                                         | Resolution                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Dashboard shows generic `fetch failed`         | Underlying DNS or network error reaching Anthropic   | Inspect server logs; look for a wrapped `ENOTFOUND` or similar error inside the cause field.         |
| Logs show `ENOTFOUND api.anthropic.com`        | Container or host cannot resolve Anthropic hostname  | Add explicit public DNS servers (e.g. 1.1.1.1, 8.8.8.8) to the Docker/NAS network config and restart. |
| Usage endpoint returns 401 / token error       | Access token expired or refresh failed               | Re-push valid credentials using the helper script; if both the NAS and the PC refresh tokens simultaneously one may get invalidated — consider disabling auto-refresh on one side. |
| Admin endpoint returns 503                     | Admin token env var not set                          | Set `CLAUDIOMETRO_ADMIN_TOKEN` on the server/container and restart.                                  |
| Dashboard shows missing or invalid credentials | `.credentials.json` not found at the configured path | Fix the directory mapping (Docker volume) or the env var pointing to the credentials location.       |
| Scheduled ping did not fire after downtime     | Service was offline at the scheduled time            | Verify the data directory is mounted and writable; pings missed during downtime should fire on startup — check logs. |
| Gauges empty after deployment                  | Credentials not yet pushed or wrong admin token      | Rerun the helper script with the correct base URL and admin token; confirm the script reports 200/202. |

---

## Quick reference commands

These are starting-point examples. Customize all placeholders before running anything.

```bash
# Clone the repository
git clone https://github.com/danipisca07/claudiometro claudiometro              # ── CUSTOMIZE ──

# Install and build (from-source path)
cd claudiometro
npm ci
npm run build
node dist/server.js

# Prepare host directories (Docker path)
mkdir -p /opt/claudiometro/config                     # ── CUSTOMIZE ──
mkdir -p /opt/claudiometro/data                       # ── CUSTOMIZE ──

# Start container (Docker path)
cd /opt/claudiometro                                  # ── CUSTOMIZE ──
docker compose up -d

# Push credentials from the user's PC
cd claudiometro
node scripts/push-credentials.mjs \
  http://192.168.1.50:4317 \                          # ── CUSTOMIZE ── base URL
  change-me                                           # ── CUSTOMIZE ── admin token
```