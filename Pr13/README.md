# Full-Stack Task Management Application

[![CI Pipeline](https://github.com/hetkathiriya/task-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/hetkathiriya/task-manager/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Tests](https://img.shields.io/badge/Tests-Jest%20%7C%20Supertest-brightgreen.svg)

## Practical 12: CI/CD Pipeline with GitHub Actions

This repository contains an automated continuous integration (CI) pipeline configured via **GitHub Actions** (`.github/workflows/ci.yml`) to ensure all code pushed to the main branch is linted, built, and tested automatically.

### Automated CI Pipeline Architecture

```
git push / pull_request [main]
  │
  ├──► Job 1: lint (Code Quality & ESLint syntax check)
  │      └── Passes
  │
  └──► Job 2: build-and-test (needs: lint)
         ├── 1. Checkout repository (actions/checkout@v4)
         ├── 2. Setup Node.js 18 (actions/setup-node@v4)
         ├── 3. Install frontend dependencies (npm install)
         ├── 4. Build React frontend bundle (npm run build)
         ├── 5. Install backend dependencies (npm install)
         └── 6. Run automated Jest test suite (npm test)
               ├── GET /cache-stats (200 OK)
               ├── GET /tasks unauthorized rejection (401)
               ├── POST /register input validation (400)
               ├── POST /trigger-event-error safety test (200)
               └── GET /event-logs audit trail verification (200)
```

### Running Tests Locally

To run the automated backend test suite on your local development machine:

```bash
cd task-manager-api
npm test
```

### Pipeline Triggers
- **Push**: Runs on every direct commit or push to `main`.
- **Pull Request**: Runs on every proposed pull request targeting `main` before merging.
