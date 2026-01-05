###### YC Companies Intelligence Platform ######

A production-grade data pipeline that scrapes Y Combinator company data, stores structured and historical snapshots in PostgreSQL, exposes analytics APIs, and visualizes insights using a Next.js frontend.

# Architecture Overview
Scraper (Python)
   ↓
PostgreSQL (Companies + Snapshots + Runs + Enrichment)
   ↓
Next.js API Routes
   ↓
Next.js Frontend (Explorer, Detail, Analytics)


Scraper handles incremental ingestion and performance tracking

Database stores historical snapshots and run metadata

API layer exposes paginated, filterable, analytics-ready endpoints

Frontend demonstrates data exploration and analytics visualization

# Tech Stack
Backend / Scraper

Python 3.11

requests, BeautifulSoup

asyncio / Playwright (for dynamic content)

logging, hashlib

Database

PostgreSQL

API Layer

Next.js App Router (app/api/*)

Frontend

Next.js (React)

Chart.js (Analytics dashboard)

# Database Schema
companies

id (PK)

yc_company_id

name

domain

first_seen_at

last_seen_at

is_active

company_snapshots

id (PK)

company_id (FK)

batch

stage

description

location

tags (array)

employee_range

scraped_at

data_hash

# Rule: A new snapshot is inserted only if data_hash changes.

company_web_enrichment

id (PK)

company_id (FK)

has_careers_page

scraped_at

scrape_runs

id (PK)

started_at

ended_at

total_companies

new_companies

updated_companies

unchanged_companies

failed_companies

avg_time_per_company_ms

slowest_company_ms

# Incremental Scraping Logic

Each company is uniquely identified by yc_company_id

First scrape inserts:

company record

initial snapshot

Subsequent scrapes:

compute SHA256 hash of snapshot data

insert snapshot only if data changes

Companies not seen in a run are marked is_active = false

Snapshot normalization ensures analytics fields never collapse due to null values.

# Performance Metrics

Tracked per run:

Total runtime

Average time per company

Slowest company scrape

Metrics are:

Stored in scrape_runs

Logged to scraper.log

Exposed via /api/scrape-runs

# API Endpoints
GET /api/companies

Pagination

Filters:

batch

stage

location

active / inactive

Search by name or domain

GET /api/companies/:id

Company details

Full snapshot history

Derived change timeline

GET /api/analytics

Companies per batch

Stage distribution

Top locations

Top tags

GET /api/scrape-runs

Scrape history

Performance metrics

# Frontend Pages
Company Explorer

Paginated list

Filterable

Searchable

Company Detail Page

Company profile

Snapshot history

Change timeline

Analytics Dashboard

Batch distribution

Stage distribution

Location & tag insights

# How to Run Locally
Backend / Scraper
python scraper/runScraper.py

Frontend
cd yc-frontend
npm install
npm run dev


Open: http://localhost:3000

# Deployment

Frontend deployed on Vercel

Backend scraper runs locally / scheduled

PostgreSQL hosted externally