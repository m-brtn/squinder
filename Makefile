.DEFAULT_GOAL := help

.PHONY: help prep backend crm-daemon dev web ios android crm seed status build-dev build-ios build-android down logs

CRM_PORT := 7132

help:
	@echo "make prep          Install dependencies and build Docker services"
	@echo "make dev           Start backend and Metro for the dev client"
	@echo "make web           Start backend and Expo Web"
	@echo "make ios           Start backend and iOS dev client"
	@echo "make android       Start backend and Android dev client"
	@echo "make crm           Start backend + CRM and follow the CRM logs"
	@echo "make seed          Load persona seeds from apps/api/seeds"
	@echo "make status        Show where API, CRM, and other services run"
	@echo "make build-dev     Build both development clients with EAS"
	@echo "make build-ios     Build the iOS development client with EAS"
	@echo "make build-android Build the Android development client with EAS"
	@echo "make prep web      Prepare everything, then start Web"
	@echo "make down          Stop Docker services and the background CRM"
	@echo "make logs          Follow backend logs"

prep:
	pnpm install --frozen-lockfile
	@test -f apps/api/.env || cp apps/api/.env.example apps/api/.env
	docker compose pull postgres minio minio-init
	docker compose build api

backend:
	docker compose up -d --build postgres minio minio-init api
	@$(MAKE) --no-print-directory crm-daemon
	@node scripts/dev-console.mjs

# Starts the CRM dev server in the background unless something already
# listens on its port. Logs go to .crm.log; make down stops it.
crm-daemon:
	@if lsof -ti tcp:$(CRM_PORT) -sTCP:LISTEN >/dev/null 2>&1; then \
		echo "CRM already running on http://localhost:$(CRM_PORT)"; \
	else \
		echo "Starting CRM in the background (logs: .crm.log)"; \
		nohup pnpm --filter @squinder/crm dev > .crm.log 2>&1 & \
		for i in $$(seq 1 20); do \
			lsof -ti tcp:$(CRM_PORT) -sTCP:LISTEN >/dev/null 2>&1 && break; \
			sleep 0.5; \
		done; \
	fi

dev: backend
	pnpm --filter @squinder/mobile dev

web: backend
	EXPO_PUBLIC_API_URL=http://localhost:7131 pnpm --filter @squinder/mobile web

ios: backend
	pnpm --filter @squinder/mobile ios

android: backend
	pnpm --filter @squinder/mobile android

crm: backend
	@touch .crm.log
	@echo "CRM: http://localhost:$(CRM_PORT) — following logs, Ctrl+C to detach"
	@tail -n 40 -f .crm.log

seed:
	pnpm --filter @squinder/api db:seed

status:
	@node scripts/dev-console.mjs

build-dev:
	pnpm --filter @squinder/mobile build:dev

build-ios:
	pnpm --filter @squinder/mobile build:dev:ios

build-android:
	pnpm --filter @squinder/mobile build:dev:android

down:
	@-lsof -ti tcp:$(CRM_PORT) -sTCP:LISTEN | xargs kill 2>/dev/null || true
	docker compose down

logs:
	docker compose logs --follow api
