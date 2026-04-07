# plan / issue


Great question. You've identified a real judging risk. Let me clarify:

The short answer: JSON is suitable if you add an automated pipeline. Without it, you lose credibility.

What judges will ask:

"How do you update prices monthly?"
"Is it manual?"
"What happens Jan 2027 when new data arrives?"
If you say "We manually upload CSV → run Python → regenerate JSON", that's not scalable. But if you say "Automated pipeline: new CSV → batch processor → JSON generation → auto-deployed", you win the technical excellence points.

Let me check what you already have:

I see the issue. You have validation scripts but no data aggregation script that generates the JSON files from CSVs. This is exactly what judges will ask about.

Here's my recommendation:
Modified Strategy (still 2 days, better for judges)
Instead of rushing to database, do this:

Keep JSON serving layer + Add automated aggregation pipeline

New CSV arrives → Python script processes → Updates public/data/*.json → Auto-deployed to live demo

This actually impresses judges more because:

✅ Shows data engineering maturity
✅ Answers "how do you handle new data?" → Automated, not manual
✅ JSON stays performant for frontend
✅ Pipeline is clear and documented (judges can see it in your GitHub)
✅ You can say: "We chose JSON + automation for predictability. At commercial scale, we'd migrate to database with materialized views."
New Timeline
Add to the plan:

Phase 0.5: Data Pipeline Script — 2-3 hours (Adam)
Do this immediately, before auth features

"scripts": {
  "data:update": "python analysis/generate_json_aggregates.py"
}

Create analysis/generate_json_aggregates.py:

Read latest CSV from price_table_dataset
Parse and aggregate prices (avg, min, max by item/state/store)
Generate all 10 JSON files in data
Includes validation checks (item counts, price ranges, etc.)
Add to package.json:

Document in root: Create DATA_PIPELINE.md:

## Data Update Pipeline

When new monthly CSV arrives:
1. Place in price_table_dataset/pricecatcher-2026-04.csv
2. Run: npm run data:update
3. Validates data, regenerates JSON files, auto-deploys
4. Live demo updates within minutes

Fully automated; no manual intervention needed.

Optional: GitHub Actions workflow (.github/workflows/update-data.yml) to run monthly, OR just document the script + manual run

Why This Wins for Judges
When judges ask: "What happens when new data arrives next month?"

You answer:

"We have an automated data pipeline. New CSV → Python aggregation script → JSON generation → Auto-deployed to Lovable. It's fully documented and can run with one command. For commercial scale with millions of users, we'd migrate to Supabase with materialized views for incremental updates."

They think: "These guys understand data engineering, scalability, AND pragmatism."

Revised Plan Summary ⏱️
Should you do this?
YES, because:

✅ Judges ask data questions = you answer with evidence
✅ Shows you've thought through operations
✅ Only 2-3 hours (Adam handles it)
✅ Makes JSON approach credible instead of "we hardcoded data"
✅ This narrative differentiates you from competitors