
.PHONY: dev build start stop down logs

dev:
	npm run dev

build:
	docker-compose build

up:
	docker-compose up -d

stop:
	docker-compose stop

down:
	docker-compose down

logs:
	docker-compose logs -f
