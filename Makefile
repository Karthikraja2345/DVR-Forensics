.PHONY: help setup test demo run-backend run-frontend docker-up docker-down clean validate

help:
	@echo "SIH-26150 DVR/NVR Forensics Platform - Developer Commands"
	@echo "=========================================================="
	@echo "make setup         : Setup virtualenv, install dependencies, init dirs"
	@echo "make demo          : Seed DEMO-CASE-001 with synthetic forensic fixtures"
	@echo "make test          : Run all automated unit and forensic tests"
	@echo "make validate      : Run forensic validation engine against ground truth"
	@echo "make run-backend   : Start FastAPI backend server on port 8000"
	@echo "make run-frontend  : Start React/Vite development server on port 5173"
	@echo "make docker-up     : Build and start all services via Docker Compose"
	@echo "make docker-down   : Stop all Docker containers"
	@echo "make clean         : Remove cached files, temporary databases, and builds"

setup:
	python -m pip install --upgrade pip
	pip install -r backend/requirements.txt
	cd frontend && npm install
	python scripts/setup_dev.py

demo:
	python scripts/generate_synthetic_fixtures.py
	python scripts/create_demo_case.py

test:
	pytest tests/ -v --durations=10

validate:
	python scripts/run_validation.py

run-backend:
	uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache
