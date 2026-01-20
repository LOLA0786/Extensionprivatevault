# Getting Started with PrivateVault

This guide will help you get PrivateVault up and running in under 15 minutes.

## Prerequisites

- **Node.js 20+** ([download](https://nodejs.org/))
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/))
- **Chrome Browser**
- **Git**

## Quick Start (5 minutes)

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/LOLA0786/Extensionprivatevault.git
cd Extensionprivatevault

# Run setup script
./scripts/setup.sh

# Start services with Docker
docker-compose up
The setup script will:

Install all dependencies

Build the shared library

Set up the database

Create environment files

Option 2: Manual Setup
bash
Copy code
# 1. Install dependencies
npm install

# 2. Build shared library
cd shared
npm install
npm run build
cd ..

# 3. Set up backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npx prisma generate
npx prisma migrate dev
cd ..

# 4. Set up extension
cd extension
npm install
cd ..

# 5. Start services
docker-compose up

## Running the Extension

### Development Mode

1. **Build the extension:**
   ```bash
   cd extension
   npm run dev
Load in Chrome:

Open Chrome

Go to chrome://extensions

Enable "Developer mode" (top right)

Click "Load unpacked"

Select the extension/dist folder

Verify it's working:

Open ChatGPT or Claude

You should see a PrivateVault icon in your extensions bar

A sidebar should appear on the page

Production Build
bash
Copy code
cd extension
npm run build
npm run package
This creates privatevault-extension.zip ready for Chrome Web Store.

Running the Backend
Development Mode
bash
Copy code
cd backend
npm run dev
Backend runs on http://localhost:3000

Production Mode
bash
Copy code
cd backend
npm run build
npm start
With Docker
bash
Copy code
docker-compose up backend

## First Test

### 1. Create a Test User

```bash
curl -X POST http://localhost:3000/v1/auth/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "publicKey": "test-key",
    "deviceInfo": {
      "browser": "Chrome",
      "os": "macOS",
      "version": "1.0.0"
    }
  }'
2. Test Event Capture
Open ChatGPT

Type a prompt: "Hello, world!"

Hit Enter

Open the extension sidebar

You should see the event captured

3. Check Backend
bash
Copy code
# View database
cd backend
npx prisma studio
Opens Prisma Studio at http://localhost:5555 where you can view events.

Development Workflow
Frontend (Extension) Changes
bash
Copy code
cd extension
npm run dev  # Watch mode, auto-reloads
After changes:

Reload extension in chrome://extensions

Refresh the AI website

Backend Changes
bash
Copy code
cd backend
npm run dev  # Watch mode, auto-restarts
Changes take effect immediately.

### Shared Library Changes

```bash
cd shared
npm run dev  # Watch mode

# In another terminal, rebuild extension/backend
cd extension && npm run dev
cd backend && npm run dev
Database Changes
bash
Copy code
cd backend

# Edit prisma/schema.prisma
# Then create migration:
npx prisma migrate dev --name add_new_field

# Generate client:
npx prisma generate
Environment Variables
Backend (.env)
env
Copy code
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://privatevault:dev@localhost:5432/privatevault
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=privatevault-payloads
Extension
No environment variables needed for development.

## Troubleshooting

### Extension Not Loading

1. Check build completed: `ls extension/dist`
2. Check for errors in Chrome extensions page
3. Try rebuilding: `cd extension && npm run build`

### Backend Not Starting

1. Check database is running: `docker-compose ps`
2. Check migrations ran: `cd backend && npx prisma migrate status`
3. Check logs: `docker-compose logs backend`

### Database Connection Errors

1. Ensure Postgres is running: `docker-compose up postgres`
2. Check DATABASE_URL in `.env`
3. Try resetting: `cd backend && npx prisma migrate reset`

### Build Errors

1. Clear all builds: `make clean`
2. Reinstall: `rm -rf node_modules */node_modules && npm install`
3. Rebuild shared library first: `cd shared && npm run build`

## Next Steps

1. **Read the [Architecture](docs/architecture.md)** - Understand how it works
2. **Review the [Demo Script](docs/demo_script_tony.md)** - Prepare to show Tony
3. **Check the [Roadmap](docs/roadmap.md)** - See what's next
4. **Read [Contributing](CONTRIBUTING.md)** - Start developing

## Useful Commands

```bash
# Start everything
make dev

# Build everything
make build

# Run tests
make test

# Clean everything
make clean

# View logs
docker-compose logs -f

# Database UI
make db-studio

# Reset database
make db-reset
Getting Help
Documentation: docs/ folder

Issues: GitHub Issues

Architecture: docs/architecture.md

API Docs: Coming soon

What You Should See
After successful setup:

✅ Extension loaded in Chrome
✅ Backend running on :3000
✅ Postgres running on :5432
✅ Redis running on :6379
✅ MinIO running on :9000
✅ Sidebar appears on ChatGPT/Claude
✅ Events captured in database

If you see all of these, you're ready to start developing! 🚀
