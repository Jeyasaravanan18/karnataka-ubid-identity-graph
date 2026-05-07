# AI/ML Workflow

This platform uses ML where it is safe and justified, and keeps decisions reversible.

## Entity Resolution (UBID Linking)

1. Normalize fields:
   - Name: tokenization, legal suffix normalization, spelling variants.
   - Address: token cleanup, locality extraction, landmark tokens, unit/plot parsing.
   - Identifiers: PAN/GSTIN stored as hashes in sandbox; exact-match anchors.
2. Candidate generation (blocking):
   - PIN + locality tokens
   - identifier presence (PAN/GSTIN hash)
   - department priors (some systems are noisier)
3. Pair scoring:
   - Deterministic: exact PAN/GSTIN match, exact source-id known links.
   - Learned: name similarity, address similarity, sector overlap, temporal proximity.
4. Calibration:
   - convert scores into confidence bands
   - pick thresholds to minimize false merges
5. Human-in-the-loop:
   - mid-confidence candidates go to review
   - review labels update calibration/weights

## Activity Classification

- Inputs: joined events (inspection, renewal, filing, utility consumption, notices, closures).
- Output: `Active | Dormant | Closed` + evidence timeline.
- Explainability: store which events contributed, their weights, and window definitions.

