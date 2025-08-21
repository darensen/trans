FRONT_DIR=srcs/front
BACK_DIR=srcs/back

.PHONY: all simple docker build up clean re

# Version simple avec Docker seulement
all:
	docker compose up --build

# Version avec build manuel (pour développement)
build-manual: front back
	# Ensure Vault is up, seed dev secrets, then start the full stack
	docker compose up -d vault
	bash ./init-vault.sh
	docker compose up --build

front:
	cd $(FRONT_DIR) && npm install && npx tsc

back:
	cd $(BACK_DIR) && npm install --save-dev prisma && npm install @prisma/client && npm install @fastify/session  && npm install @fastify/cookie && npx tsc && npx prisma migrate deploy && npx prisma generate

docker:
	docker compose build

build: all

up:
	docker compose up
down:
	docker compose down

clean:
	cd $(FRONT_DIR) && rm -rf *.js *.js.map node_modules dist
	cd $(BACK_DIR) && rm -rf *.js *.js.map node_modules dist prisma/node_modules prisma/.cache
	docker compose down -v --remove-orphans
	docker system prune -af --volumes
	npm cache clean --force

re: clean all