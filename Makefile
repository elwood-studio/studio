turbo := ./node_modules/.bin/turbo
prettier := ./node_modules/.bin/prettier
lerna := ./node_modules/.bin/lerna

# UP
up: ## bring up docker-compose services
	@echo "up..."
	docker-compose --env-file=.env -f ./docker/docker-compose-dev.yml up --build --force-recreate 
.PHONY: up

# DOWN
down: ## bring up docker-compose services
	@echo "down..."
	docker-compose --env-file=.env -f ./docker/docker-compose-dev.yml down
.PHONY: down

# BUILD
build: ## build an app
	@echo "build..."
	$(turbo) run build
.PHONY: build

# DIST
dist: ## build an app
	@echo "dist..."
	$(turbo) run dist
.PHONY: dist

# DEV
dev: ## run "dev" on all apps/* or packages/*
	@echo "dev..."
	$(turbo) run --concurrency 15 --parallel dev
.PHONY: dev

# LINT
lint: ## run "lint" on all apps/* or packages/*
	@echo "lint..."
	$(turbo) run lint
.PHONY: lint

# FORMAT
format: ## run prettier on all apps/* or packages/*
	@echo "format..."
	$(prettier) --write "**/*.{ts,tsx,md}"
.PHONY: format

# CLEAN
clean: ## cleanup compile and build artifacts
	@echo "clean..."
	git clean -dfqX -- ./node_modules **/node_modules/ apps/**/lib/ packages/**/lib **/dist **/.next **/tsconfig.tsbuildinfo **/*.zip **/*.log **/.DS_Store
.PHONY: clean

# TEST 
test: ## test all 
	@echo "test..."
	$(turbo) run test
.PHONY: test

# VERSION
version: ## version all packages
	@echo "version..."
	$(turbo) run build && $(lerna) version --no-private

# PUBLISH
publish: ## publish all packages
	@echo "publish..."
	pnpm publish -r --access public --publish-branch main	

# INSTALL
install: ## install workspace dependencies
	@echo "installing..."
	pnpm install
.PHONY: install

# READY
ready: clean install build ## clean, install, build workspace
.PHONY: ready

help: ## Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;36m%-15s\033[m %s\n", $$1, $$2}'
	@echo "\n"
	@echo "For more information, view the online documentation at:"
	@echo " https://elwood.studio/docs/development"
	@echo ""
.PHONY: help