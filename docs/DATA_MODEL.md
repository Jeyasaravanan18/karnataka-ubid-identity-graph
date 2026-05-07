# Data Model (Reference)

The prototype is UI-only. In production, the following tables/entities are a practical baseline.

## Core Entities

- `source_record(department, source_id, normalized_fields, identifier_hashes, snapshot_ts)`
- `ubid(ubid_id, anchor_type, anchor_hash, created_ts)`
- `ubid_edge(ubid_id, source_record_pk, confidence, evidence_json, status)`
- `review_task(task_id, left_ref, right_ref, score, evidence_json, state, reviewer_action)`
- `event(event_id, source, raw_ref, normalized_payload, event_ts)`
- `event_join(event_id, ubid_id, join_confidence, evidence_json, state)`
- `activity_status(ubid_id, status, confidence, window_start, window_end, evidence_json)`
- `audit_log(audit_id, actor, action, target_ref, reversible, details_json, ts)`

## Evidence JSON Shape (example)

- `evidence[]`: list of factors
- each factor:
  - `label`
  - `score`
  - `detail`

