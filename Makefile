export PROJECT_NAME=piac-bot
export PORT_NGINX=8080
export BASEURL=

dummy               := $(shell touch artifacts)
include ./artifacts

# compose command to merge production file and and dev/tools overrides
COMPOSE?=docker-compose -p $(PROJECT_NAME) -f docker-compose.yml

build:
	$(COMPOSE) build

dev:
	$(COMPOSE) up

up:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) stop

down:
	$(COMPOSE) down --remove-orphans
