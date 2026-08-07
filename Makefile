.DEFAULT_GOAL := help

.PHONY: help prep backend web ios android build-dev build-ios build-android down logs

help:
	@echo "make prep          Install dependencies and build Docker services"
	@echo "make web           Start backend and Expo Web"
	@echo "make ios           Start backend and iOS dev client"
	@echo "make android       Start backend and Android dev client"
	@echo "make build-dev     Build both development clients with EAS"
	@echo "make build-ios     Build the iOS development client with EAS"
	@echo "make build-android Build the Android development client with EAS"
	@echo "make prep web      Prepare everything, then start Web"
	@echo "make down          Stop Docker services"
	@echo "make logs          Follow backend logs"

prep:
	pnpm install --frozen-lockfile
	@test -f apps/api/.env || cp apps/api/.env.example apps/api/.env
	docker compose pull postgres
	docker compose build api

backend:
	docker compose up -d postgres api

web: backend
	EXPO_PUBLIC_API_URL=http://localhost:3001 pnpm --filter @squinder/mobile web

ios: backend
	pnpm --filter @squinder/mobile ios

android: backend
	pnpm --filter @squinder/mobile android

build-dev:
	pnpm --filter @squinder/mobile build:dev

build-ios:
	pnpm --filter @squinder/mobile build:dev:ios

build-android:
	pnpm --filter @squinder/mobile build:dev:android

down:
	docker compose down

logs:
	docker compose logs --follow api
