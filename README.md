# 🔥 Hot Takes — Consumer Research & Behavioral Intelligence Platform

> **Take-Home Assignment Solution: Comprehensive Deliverables**  
> **Candidate Role:** Senior Full-Stack Engineer & Product Thinker  
> **Evaluation Dimensions:** Product Thinking (20%), Engineering (25%), AI/Behavioural Thinking (25%), System Architecture (20%), Communication (10%).

---

## 🧭 Deliverables & Documentation Index

All core proposals and engineering specifications are organized into focused documents within this repository:

| Document | Description | Key Topics |
| :--- | :--- | :--- |
| **[Interactive Prototype](/)** | Shipped Next.js App (Desktop 430px Container / Mobile 390px Viewport) | Limited Closet Game, Question Intelligence Lab, Dual-Lens Results, X-Ray Inspector |
| **[Challenge 1 Part B Proposal](docs/challenge1-partB.md)** | Methodological Strategy & Architecture | Telemetry taxonomy, 6-component RQS, bot vs. fast responder detection, continuous survey loop |
| **[Challenge 2 Proposal](docs/challenge2.md)** | Progressive Trust & Verification Engine | Aadhaar vs UPI penny-drop in India, Play-to-Earn onboarding, multi-vector graph dedup, Identity Vault |
| **[Video Presentation Script](docs/VIDEO_SCRIPT.md)** | Word-for-Word 4:30 Demo Script | Spoken dialogue, screen actions, timestamps, and delivery cues |
| **[Architectural Decisions](docs/DECISIONS.md)** | Trade-offs & Engineering Decisions | Anti-priming sequencing, heuristic RQS, storage constraints, and production roadmap |
| **[Design System Specification](docs/design-system.md)** | Mobile UI/UX Design System | Warm stone palette, typography scale, equal-weight chip rules, and Framer Motion easing |

---

## 📌 Executive Summary

### The Research Question Being Redesigned
Traditional market research assesses consumer ethics through abstract self-reports:
> *"How important is sustainability to you when buying clothing? (1: Not important ... 5: Extremely important)"*

### The Fundamental Flaw
Self-reports are heavily contaminated by **social desirability bias** and cost ₹0 to answer. Consumers almost universally claim high ethical standards, yet real-world purchasing behavior diverges dramatically when trade-offs against price, trend velocity, and brand familiarity become real—the well-documented **attitude-behaviour gap**.

### The Redesigned Solution: "Limited Closet" Budget-Allocation Game
Rather than asking a leading, unanchored question, Hot Takes immerses the participant in a 5-screen mobile capsule wardrobe curation simulation:
1. **Unprimed Framing:** Neutral premise (*"Build your capsule wardrobe on a budget"*). The words *"sustainability"*, *"eco"*, and *"ethical"* are strictly excluded from all headers, navigation, and intro screens to prevent priming.
2. **Zero-Sum Trade-Offs:** Fixed ₹3,000 budget across 5 closet slots (*Top, Bottom, Outerwear, Footwear, Accessory*).
3. **Competing Card Attributes:** Real certified sustainable options (GOTS Organic, GRS Recycled) compete at real price premiums against **greenwashed decoys** (*"eco-inspired"*, *"botanical vibe"*) and cheap high-style fast fashion.
4. **Mid-Game Disruptions:** Flash sales, budget cuts, and material surcharges test the true **price elasticity of sustainability**.
5. **Quality & Consistency Probes:** Disguised attention checks, reverse-framed choices, and inverted repeated scenarios.
6. **Dual-Lens Results:** Consumer receives an editorial *"Closet Personality"* card (*Conscious Curator*, *Budget Pragmatist*, *Trend Chaser*), while researchers access a diagnostic dashboard with the **Stated-vs-Revealed Gap**, **Willingness-to-Pay Curve**, **Greenwash Susceptibility**, and **Response Quality Score (RQS)**.

---

## 🎬 3–5 Minute Evaluator Demo Script Outline

Follow this structured script during product walkthroughs or video demonstrations:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        3–5 MINUTE DEMO PACING                          │
│                                                                        │
│  [0:00 - 2:00]  Interactive Prototype Walkthrough (Consumer & X-Ray)   │
│  [2:00 - 3:00]  Question Intelligence Lab & Heuristic Fallback         │
│  [3:00 - 4:15]  Challenge 1B (Quality Engine) & Challenge 2 (Trust)    │
│  [4:15 - 5:00]  Trade-offs, Architectural Isolation & Next Steps       │
└────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Interactive Prototype Walkthrough (0:00 – 2:00)
- **Step 1: Set Viewport & Frame (0:00 – 0:20)**
  - Open `http://localhost:3000`. Show that on desktop, the application renders inside a centered phone-width container (max-width 430px) with a neutral stone background (`#F2EFE9`), simulating an authentic consumer mobile experience.
  - Highlight the **Intro Screen**: Note the strict absence of priming words (*sustainability*, *green*, *eco*). Point out the transparent behavioral consent checkbox.
- **Step 2: Walk Through Capsule Curation (0:20 – 1:10)**
  - Click *"Start Curation"*. Explain the persistent top bar: animated ₹ budget meter, 5 closet slot icons, and progress tracker.
  - **Toggle "X-Ray Inspector" to ON:** Show how researchers can see the underlying constructs (*"genuine_sustainable"*, *"greenwash_decoy"*, *"cheap_fast_fashion"*) while the consumer only sees equal-weight neutral chips.
  - Select an item for Slot 1 (Top). Show card lift micro-interaction and details sheet.
  - Progress through Slot 2 (Bottom) and experience **Disruption 1 (Flash Sale)**. Note the 1.5s deliberate review delay before dismissal to prevent auto-skipping.
  - Progress through Slot 3 (Outerwear) and hit **Disruption 2 (Budget Cut)**. Observe how budget constraints force painful trade-offs.
  - Point out the **disguised attention check** on Slot 4 (*"Attention Check: Select this specific basic tee..."*) and the **repeated consistency scenario** on Slot 5.
- **Step 3: Stated Question & Dual-Lens Results (1:10 – 2:00)**
  - Answer the Stated Baseline question (1–5 Likert slider). Explain why asking this *after* the game prevents priming while capturing the gap.
  - **Consumer Lens:** Review the delightful *"Closet Personality"* reward card (e.g., *Conscious Curator* or *Trend Chaser*).
  - **Researcher Lens:** Toggle to the Researcher View. Walk through:
    1. **Stated vs. Revealed Gap:** Highlight the two-bar comparison (e.g., Stated: 80% vs. Revealed: 40% = +40% Gap).
    2. **Willingness-to-Pay (WTP) Curve:** Identify the highest ₹ premium paid.
    3. **Greenwash Susceptibility Index:** Did the user choose the vague buzzword decoy?
    4. **Response Quality Score (RQS):** Gauge score (0–100) with active reason codes.
  - **Persona Switcher:** Use the top bar dropdown to switch between **"Fast Rusher (Bot-like)"** (shows low RQS, speed warnings) and **"Thoughtful Curator"** (shows high RQS).

### Phase 2: Question Intelligence Lab (2:00 – 3:00)
- Navigate to `/question-lab` via the bottom navigation link.
- Review the pre-loaded clothing sustainability question.
- Click *"Analyze Question"*. Show how the Gemini API (or the automated high-fidelity heuristic fallback) returns structured JSON:
  - 5 Bias Flags with severity 0–3 (Social Desirability: 3, Abstract/Unanchored: 3).
  - Recommended format: *Trade-off / Budget Allocation*.
  - Redesigned gamified mechanic specification.
  - Construct preservation check confirming measurement validity.

### Phase 3: Challenge 1B & Challenge 2 Architecture (3:00 – 4:15)
- Open and summarize **`docs/challenge1-partB.md`**:
  - Telemetry ring buffer logging to `data/events.json`.
  - The 6-component RQS formula: Attention (25%), Consistency (20%), Speeding (20%), Straight-lining (15%), Social Desirability (10%), Interaction Depth (10%).
  - Differentiating fast human intuition from automated click bots using micro-jitter, touch surface variance, and honeypot traps.
- Open and summarize **`docs/challenge2.md`**:
  - Why upfront Aadhaar OTP fails in India (friction, cost, user distrust).
  - The progressive **"Play-to-Earn, Verify-to-Redeem"** funnel.
  - NPCI **UPI Penny-Drop** (₹1 deposit) as the optimal lightweight KYC layer.
  - Multi-vector deduplication graph preventing farm fraud.
  - Strict physical and cryptographic separation between the **Identity Vault** and **Survey Research Database** to comply with the DPDP Act 2023.

### Phase 4: Trade-Offs & What to Build Next (4:15 – 5:00)
- Reference **`docs/DECISIONS.md`**:
  - Trade-off 1: Heuristic RQS vs. Black-box ML (transparency vs. complexity).
  - Trade-off 2: Storage constraint (in-memory + JSON) vs. Postgres/Kafka.
  - Next engineering steps: Apache Flink real-time streaming, Multi-Armed Bandit incentive optimization, and live NPCI sandbox adapters.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v20+` (developed & verified on Node `v26.0.0`)
- npm `v10+`

### 1. Installation
```bash
git clone <repo-url>
cd hot_takes_assignment
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` (optional):
```bash
cp .env.example .env.local
```
- `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for Question Lab AI analysis. If omitted, the engine automatically engages its heuristic fallback analyzer with zero disruption.

### 3. Run Unit Tests (Scoring Engine)
```bash
npm test
```
*Executes all 8 unit tests in ~150ms using Node's standard test runner (`node:test`). Tests verify speedrunning penalties, position bias, repeated scenario consistency, attention check traps, gap calculation, and archetype classification.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
```bash
npm run build
npm start
```

---

## 📐 Project Structure

```
hot_takes_assignment/
├── docs/
│   ├── challenge1-partB.md      # Part B: Telemetry taxonomy, RQS formula & bot detection
│   ├── challenge2.md            # Challenge 2: India progressive KYC, UPI & Identity Vault
│   ├── DECISIONS.md             # Architecture, behavioural & product trade-off matrix
│   └── design-system.md         # Tokens, typography, layout & Framer Motion rules
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── events/route.ts          # Ingests telemetry, appends to memory & data/events.json
│   │   │   └── question-lab/route.ts    # Gemini API route with strict JSON schema + heuristic fallback
│   │   ├── question-lab/page.tsx        # Question Intelligence Lab interactive page
│   │   ├── page.tsx                     # Centered 430px mobile viewport host container
│   │   └── layout.tsx                   # Root HTML shell & viewport metadata
│   ├── components/
│   │   ├── ui/
│   │   │   └── GarmentIllustrations.tsx # Bespoke minimal SVG flat-lay garment artwork
│   │   └── game/
│   │       ├── LimitedClosetGame.tsx    # Master game controller, state machine & demo simulator
│   │       ├── ProductCard.tsx          # Card with equal-weight chips and fabric details sheet
│   │       ├── AttributeChip.tsx        # Neutral-weight attribute chip (prevents priming)
│   │       ├── BudgetBar.tsx            # Animated budget meter with INR tabular figures
│   │       ├── ClosetTracker.tsx        # 5 slot status indicators with SVG outlines
│   │       ├── DisruptionSheet.tsx      # Bottom sheet shock with 1.5s review delay
│   │       ├── ResultCard.tsx           # Editorial consumer personality outcome card
│   │       ├── QualityGauge.tsx         # Analytical RQS gauge with diagnostic reason codes
│   │       ├── ResearcherView.tsx       # Researcher validity, two-bar gap, & audit stream
│   │       ├── ExplainerModal.tsx       # Interactive 5-tab reference guide for evaluators
│   │       └── DemoModeToggle.tsx       # Live Play / Rusher / Thoughtful persona switcher
│   ├── hooks/
│   │   └── useBehavioralTelemetry.ts    # Dual-trigger telemetry hook (interval + sendBeacon)
│   ├── lib/
│   │   ├── eventLogger.ts               # In-memory ring buffer + append-only JSON persistence
│   │   ├── gameData.ts                  # Closet slots, disruptions, items & probe definitions
│   │   ├── questionLabFallback.ts       # Deep heuristic analyzer for question transformation
│   │   └── scoring.ts                   # Core RQS formula and personality classification
│   └── types/
│       ├── game.ts                      # Product, slot, disruption, and personality schemas
│       ├── question-lab.ts              # Bias flags and redesign schema definitions
│       └── telemetry.ts                 # Typed event taxonomy & scoring interfaces
├── tests/
│   └── scoring.test.ts                  # Unit test suite for scoring heuristics & edge cases
├── data/
│   └── events.json                      # Local file persistence for raw telemetry events
├── .env.example                         # Documented environment variables template
└── README.md
```

---

## 🔬 Behavioral Metrics & Constructs Captured

- **Revealed Sustainability Share:** Percentage of closet slots filled with certified sustainable items (GOTS, GRS).
- **Stated-vs-Revealed Gap Index:** Normalized difference between stated Likert score (0–100%) and revealed choice share.
- **Willingness-to-Pay (WTP) Curve:** Maximum ₹ premium tolerated before switching to conventional alternatives, plus elasticity under disruptions.
- **Greenwash Susceptibility Index:** Propensity to select unverified buzzword items (*"eco-inspired"*).
- **Consistency Score:** Choice alignment across identical scenarios with swapped card positions.
- **Response Quality Score (RQS):** Composite 0–100 metric incorporating attention checks, speed pacing, straight-lining detection, and social desirability markers.
