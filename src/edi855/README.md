# 855 workflow area

This folder is reserved for 855-specific work that should remain separate from the Excel MVP service.

Current intent:

- keep the Excel runtime in `src/server.js`, `src/routes/`, and `src/services/` focused on report delivery
- keep 855 generation, mapping, and transport decisions isolated here
- allow shared domain concepts later only if they are stable and truly common

Suggested next structure when 855 work resumes:

- `src/edi855/adapters/` for source-specific reads
- `src/edi855/mapping/` for document mapping and partner-specific transforms
- `src/edi855/transports/` for SAP PO, SFTP, or other outbound channels
- `src/edi855/runJob.js` for a dedicated entrypoint

Until that work starts, nothing in this folder is wired into the Excel MVP runtime.