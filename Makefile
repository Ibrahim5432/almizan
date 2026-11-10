.PHONY: dev build test lint eval backup docker-up docker-down

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

test:
	npx --yes tsx --test src/core/pipeline.test.ts

eval:
	npx --yes tsx --test src/core/eval-suite.test.ts

backup:
	bash scripts/backup-db.sh

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
