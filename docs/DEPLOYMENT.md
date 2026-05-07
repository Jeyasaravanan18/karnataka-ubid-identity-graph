# Scalability & Deployment

## Scaling Strategy

- Partition by PIN prefix / district for throughput.
- Resolve incrementally per snapshot; avoid full recompute.
- Separate worker pools for ingest, normalize, score, and reclassify.
- Use conservative thresholds to minimize false merges; keep review capacity predictable.

## Deployment Reference

- Services: connector workers, normalization service, resolver service, event joiner, activity classifier, API gateway.
- Storage: PostgreSQL HA (snapshots + review + audit + materializations).
- Optional: object storage for large raw extracts; cache for hot lookups.

## Security Posture

- Keep PII in source systems; use scrambled fixtures in sandbox.
- Hash identifiers for anchoring when permitted.
- No hosted LLM calls on raw PII.

