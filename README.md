# Customer PO Status Report

Phase 1 implementation scaffold for push-based customer PO status reporting, focused on Excel delivery for the MVP.

## Current scope

- Single-sheet Excel report generation
- Report header includes report date and generation timestamp
- First 13 columns fixed in required order
- Email delivery per customer subscription
- Daily scheduler with retry-ready orchestration hooks
- Dry-run mode when SMTP is not configured

## Quick start

1. Install dependencies

```bash
npm install
```

2. Copy environment file

```bash
copy .env.example .env
```

3. Start service

```bash
npm start
```

Service runs on `http://localhost:3100` by default.

## Useful endpoints

- `GET /api/health`
- `GET /api/subscriptions`
- `POST /api/subscriptions/:id/run` (triggers one report delivery now)

## Run one delivery job from CLI

```bash
npm run run:job -- customer-a
```

## Notes

- If SMTP settings are not supplied, delivery runs in dry-run mode and writes files to the `output/` folder.
- 855 generation is out of scope for the Excel MVP runtime, but it can live separately in this repo under `src/edi855/`.
- Sample subscriptions and data are in `src/data/` and should be replaced by SAP/PS Data Hub adapters in next steps.

## Repo layout

- `src/` contains the active Excel MVP service.
- `src/edi855/` is reserved for a separate 855 workflow so it can share the repo without sharing the runtime path.
