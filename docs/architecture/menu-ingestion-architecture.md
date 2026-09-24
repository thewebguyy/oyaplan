# Safe Human-in-the-Loop Menu Ingestion Architecture

## Executive Principle
> **"AI may extract. AI must not silently publish."**

In Nigerian hospitality, menu changes, price surges, and stealth service charges are common. Automatically updating live consumer pricing from unstructured inputs without human approval creates immediate bill shock for squads and degrades user trust. 

All ingestion systems must enforce strict human verification boundaries before modifying active database rows in `menu_items` or `venues`.

---

## Ingestion Pipeline

```text
[WhatsApp Image / PDF / Portal Upload]
                   │
                   ▼
       1. Document Normalization
       (MIME validation, SHA256 deduplication, virus scan)
                   │
                   ▼
       2. Multimodal Extraction Engine
       (Gemini Multimodal / OCR model extracts line items, categories, prices, taxes)
                   │
                   ▼
       3. Domain Contract Validation
       (Rejects unknown fields, enforces currency >= 0, flags outliers)
                   │
                   ▼
       4. Staged Candidate Review (Pending Queue)
       (Stored in pending_evidence / menu_item_drafts with diff view)
                   │
                   ▼
       5. Human Decision Boundary
       (Venue Operator 1-tap review OR OyaPlan Ops verification)
                   │
                   ├── Reject ───► Archived with reason (Audit Log)
                   │
                   └── Approve ──► Atomic Database Commit to live `menu_items`
```

---

## 1. Storage & Processing Layers

### Raw Asset Storage
* Receipts, menu photos, and PDF files are stored in an access-restricted Supabase storage bucket (`menu-evidence`).
* Files are immutable and cryptographically hashed (`content_sha256`) to prevent re-extracting identical menus.

### Extraction Layer
* Extraction uses structured output contracts with strict Zod / JSON Schema validation.
* Extracted fields:
  * `raw_name`: Exact text as printed.
  * `normalized_name`: Capitalized, cleaned name.
  * `category`: One of `starter | main | dessert | cocktail | wine | beer | spirits | soft_drink | activity_fee`.
  * `price_ngn`: Non-negative integer. Outliers (>₦1,000,000 or <₦500) trigger manual inspection flags.
  * `tax_mentions`: Extraction of printed notes (e.g. "+7.5% VAT", "10% service charge").
  * `confidence_score`: 0.00 – 1.00 score based on OCR clarity.

---

## 2. The Verification Boundary

At no point does the extraction pipeline call `UPDATE menu_items` directly.

Instead:
1. **Candidate Staging**: Rows are written to `price_evidence` with `verification_status = 'pending'` and `confidence_weight = 0.85`.
2. **Side-by-Side Diff**: The OyaPlan for Business portal presents the operator with:
   * Original photo crop.
   * Current price vs. Extracted price.
   * One-click "Accept All" or individual item toggles.
3. **Audit Trail**: Every confirmed price update writes an immutable entry into `price_audit_logs`:
   ```sql
   INSERT INTO price_audit_logs (
     menu_item_id,
     changed_by,
     action_type,
     previous_price,
     new_price,
     evidence_id,
     reason
   )
   ```
4. **Freshness Refresh**: Once approved, `venues.last_price_updated_at` is updated to current UTC timestamp.

---

## 3. Failure Handling & Degradation

* **Unclear photos or illegible handwriting**: The system flags `status = 'manual_review_needed'` and routes to the OyaPlan Lagos ops queue without rejecting the venue submission.
* **Conflicting prices**: If an existing verified price conflicts with an extracted menu photo, the existing verified price remains live until an operator or admin explicitly approves the new price.
