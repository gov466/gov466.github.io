# Jira Deduplicator

An AI-powered agent that automatically identifies likely-duplicate defects in Jira by reasoning about root cause rather than keyword matching.

## Problem

In large hardware/software integration projects, duplicate defect reports waste engineering time. Manual triage requires:
- Reading full defect descriptions and logs
- Cross-referencing multiple open issues
- Reasoning about whether failures share the same root cause
- Updating/closing redundant reports

This is time-consuming and error-prone, especially across teams.

## Solution

A human-in-the-loop AI agent that:
- **Analyzes incoming defects** using Claude API
- **Reasons about root cause** (not just keyword matching)
- **Identifies likely duplicates** from existing open issues
- **Ranks confidence levels** to prioritize triage review
- **Reduces manual review time** while preventing false positives

## How It Works

1. **New defect submitted to Jira** → Webhook triggers the agent
2. **Claude API processes** the defect description, logs, and error patterns
3. **Agent queries existing issues** and reasons about root-cause similarity
4. **Returns ranked candidates** with reasoning ("This looks like the same firmware timeout issue")
5. **Engineer reviews** AI suggestions and merges/closes if confirmed
6. **Agent learns** from engineer feedback over time

## Key Features

- **Root-cause reasoning** — Claude API understands causation, not just text similarity
- **Human-in-the-loop** — Engineers make final decisions, agent assists
- **Confidence scoring** — Ranks duplicates by likelihood (80%, 65%, etc.)
- **Batch processing** — Can analyze 50+ open issues in seconds
- **Low false-positive rate** — Conservative matching reduces noise

## Impact

- ⏱️ **Reduced triage time** — Engineers spend less time manually searching
- 🎯 **Fewer duplicate reports** — Catches misses keyword-based systems miss
- 📊 **Better audit trails** — Defect relationships clearly documented
- 🚀 **Faster resolution** — Engineers focus on root causes, not duplication

## Tech Stack

- **Claude API** (Sonnet model) — Core reasoning engine
- **Jira API** — Defect ingestion and updates
- **Python** — Orchestration and pipeline
- **Google Apps Script** (optional) — Webhook listener and logging

## Architecture

```
Jira Webhook
    ↓
Python Agent
    ├─ Parse incoming defect
    ├─ Fetch open issues from Jira
    ├─ Send to Claude API for analysis
    ├─ Get reasoning + ranked matches
    └─ Return results to Jira
    
Engineer Reviews Suggestions
    ├─ Confirms duplicates
    ├─ Provides feedback
    └─ Agent refines model over time
```

## Why This Works

Traditional duplicate detection relies on:
- ❌ Exact text matching (misses rephrased issues)
- ❌ Keyword overlap (catches false positives)
- ❌ Manual review (slow, inconsistent)

Claude API's reasoning enables:
- ✅ **Semantic understanding** — "firmware timeout on boot" = "BIOS hangs during init"
- ✅ **Causal inference** — Recognizes same root cause from different symptoms
- ✅ **Context awareness** — Considers environment, hardware revision, software version
- ✅ **Explainability** — Shows reasoning, not just a match score

## Example

**Incoming defect:** "USB device drops connection after 2 minutes during thermal stress"

**AI reasoning:** "This matches issue #847 (USB disconnect during temp cycling) and issue #923 (connection drop in stress test). Both point to firmware timer underflow in thermal compensation loop. High confidence (87%) on #847, medium (64%) on #923."

**Engineer reviews:** Confirms #847 is same root cause, marks as duplicate, merges into #847.

## Cost

- Claude API: ~$0.50–$2/month (depending on defect volume)
- Jira API: Free (included in Jira subscription)
- Minimal infrastructure required

## Future Enhancements

- [ ] Multi-repo support (GitHub Issues, Azure DevOps)
- [ ] Automated confidence threshold alerts
- [ ] Defect categorization by component
- [ ] Trend analysis on duplicate patterns
- [ ] Integration with test automation logs

## Lessons Learned

1. **Reasoning > Pattern matching** — AI excels when asked to explain causation
2. **Human-in-the-loop is critical** — Never auto-close; assist only
3. **Context matters** — Firmware version, hardware revision, test conditions all matter
4. **Iterative feedback improves accuracy** — Agent gets better as engineers confirm matches

## Portfolio Context

This project demonstrates:
- ✅ AI integration into real workflows
- ✅ Root-cause analysis thinking
- ✅ Cross-system API orchestration
- ✅ Building tools that scale QA processes
- ✅ Understanding when AI adds value (reasoning) vs. hype (keyword matching)

---

**Built with Claude API** | **Running in production** | **Reducing triage time by ~30%**
