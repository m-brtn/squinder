.DEFAULT_GOAL := help

.PHONY: help prep backend web ios android down logs

help:
	@echo "make prep          Install dependencies and build Docker services"
	@echo "make web           Start backend and Expo Web"
	@echo "make ios           Start backend and Expo iOS"
	@echo "make android       Start backend and Expo Android"
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

down:
	docker compose down

logs:
	docker compose logs --follow api
