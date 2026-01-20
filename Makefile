.PHONY: help install dev build test clean docker-up docker-down setup-db

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install
	cd extension && npm install
	cd backend && npm install
	cd shared && npm install

dev: ## Run extension and backend in development mode
	npm run dev

build: ## Build all packages
	npm run build

test: ## Run all tests
	npm run test

lint: ## Run linters
	npm run lint

clean: ## Clean build artifacts and dependencies
	npm run clean

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

setup-db: ## Setup database (run migrations)
	cd backend && npx prisma migrate dev

seed-demo: ## Seed demo data
	./scripts/seed_demo_data.sh

extension-build: ## Build extension for production
	cd extension && npm run build

extension-package: ## Package extension as .zip
	cd extension && npm run package

backend-build: ## Build backend for production
	cd backend && npm run build

backend-start: ## Start backend in production mode
	cd backend && npm start

# Development helpers
watch-extension: ## Watch extension files for changes
	cd extension && npm run dev

watch-backend: ## Watch backend files for changes
	cd backend && npm run dev

# Database helpers
db-studio: ## Open Prisma Studio
	cd backend && npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	cd backend && npx prisma migrate reset

db-generate: ## Generate Prisma client
	cd backend && npx prisma generate

# Docker helpers
docker-rebuild: ## Rebuild Docker images
	docker-compose build --no-cache

docker-clean: ## Clean Docker volumes and images
	docker-compose down -v
	docker system prune -f
