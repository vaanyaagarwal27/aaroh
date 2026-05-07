# Aaroh — Court Judgment Intelligence Platform

> आरोह (Aaroh) — the ascending scale in Indian classical music. 
> From document, to accountability.

**Live Demo:** https://aaroh-mauve.vercel.app  
**Demo Login:** `vaanya.agarwal` / `12345`

---

## The Problem

Government departments in Karnataka receive court judgments daily through CCMS (Court Case Monitoring System). These 30–60 page PDFs contain critical directions — deadlines, compliance orders, mandatory actions that government officers must act on.

Officers manually read every page. They miss things. Deadlines slip. And when a deadline is missed, officers face contempt of court — personally.

The problem isn't access. CCMS already delivers the PDFs. **The problem is that no one has turned that delivery into action.**

---

## What Aaroh Does

Aaroh sits as an intelligence layer on top of CCMS. It reads any court judgment PDF, extracts every direction, classifies them, calculates deadlines, and puts nothing on a dashboard until a human officer has verified and approved it.

### The Four Stages

**Stage 1 — Extract**  
Upload any court judgment PDF. Gemini AI reads the entire document and extracts every direction with:
- Case number, court, bench, date of order
- Three-category classification of every direction
- Responsible entity and timeline
- AI confidence score per field

**Three Categories:**
| Category | Definition |
|----------|-----------|
| Binding to Government | Court orders the government must act on |
| To Petitioner | Orders directed at other parties — noted, not actioned |
| Observation | Judicial commentary — no legal obligation |

**Stage 2 — Verify**  
No extraction goes live without human approval. Officers review every field, edit anything incorrect, and must provide a reason for every change. Every edit is logged with name, timestamp, original text, new text, and reason.

**Stage 3 — Track**  
Approved cases flow into the dashboard with urgency tracking, deadline calculation, and an Action Center per case with a completion checklist.

---

## Key Features

- **Mandatory human verification** — AI assists, humans decide
- **Complete edit audit trail** — every change attributed to a named officer with reason
- **Resume interrupted workflows** — navigate away mid-extraction, pick up where you left off
- **Urgency tracking** — days remaining, overdue alerts, interim order flags
- **Action Center** — per-case checklist with completion tracking
- **Gemini fallback system** — auto-switches from 2.5-flash to 1.5-flash under load; shows demo extraction if both unavailable
- **Authenticated access** — every action tied to a named, credentialed officer

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| AI | Google Gemini API (gemini-2.5-flash / gemini-1.5-flash fallback) |
| Storage | localStorage (prototype) → PostgreSQL (production) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- Gemini API key from Google AI Studio

### Setup

```bash
# Clone the repo
git clone https://github.com/vaanyaagarwal27/aaroh.git
cd aaroh

# Backend
cd backend
npm install
# Create .env file:
echo "GEMINI_API_KEY=your_key_here" > .env
node server.js

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### Demo Credentials
| Username | Password | Role |
|----------|----------|------|
| vaanya.agarwal | 12345 | Officer |
| admin | admin123 | Administrator |

---

## Sample Judgments

The `/samples` folder contains real Karnataka High Court judgment PDFs for testing.

---

## What's Production-Ready vs Prototype

| Feature | Status |
|---------|--------|
| PDF extraction + classification | ✅ Production-ready |
| Human verification workflow | ✅ Production-ready |
| Edit audit trail | ✅ Production-ready |
| Urgency tracking + deadlines | ✅ Production-ready |
| Authenticated access | ✅ Prototype (hardcoded users → NIC SSO in production) |
| Database | 🔄 localStorage → PostgreSQL in production |
| CCMS API integration | 🔄 Planned for production |
| Kannada/OCR support | 🔄 Planned for production |

---

## Built By

Team vaanya2708_e83e — AI for Bharat Hackathon 2026