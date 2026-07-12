# OyaPlan Experience Principles v1.0

**OyaPlan is a Planning Companion that helps people confidently decide how to spend their time and money.**

OyaPlan helps people confidently choose experiences that fit both their budget and their intent. The fundamental promise we make to our users is not just "Budget Confidence" (you can afford this), but **Decision Confidence** (this is the right choice). 

> **Budget Confidence is how we earn trust. Decision Confidence is what the user leaves with.**

Every interaction, transition, and word on the screen must serve this goal.

---

## 1. Core Philosophical Tenets

### The Product is the Recommendation
> **The recommendation is the product. The interface simply earns enough trust for the user to accept it.**
Everything built into the interface must justify its existence by either increasing trust or making the recommendation clearer.

### Plans before Places
We do not build venue directories. We do not sell restaurants. We sell confidence in the plan. The venue is merely a component of the explanation.

### Simplicity before Choice
> We would rather recommend three plans we believe in than overwhelm someone with thirty venues.
Infinite options create planning anxiety. Our job is to filter the noise and present opinionated, confident recommendations.

### Guidance before Discovery
> We guide before we let people browse.
People open OyaPlan because they already have a problem ("What should we do tonight?"). We do not celebrate aimless exploration until we have first offered concrete guidance.

### Conversation before Forms
The configuration phase must never feel like filling out a form. It must feel like a conversation discovering **intent**.

---

## 2. The OyaPlan Decision Ladder

This ladder is our experience framework. It forms the backbone of every screen, every feature, and every sprint.

```text
Intent
  ↓
Constraints
  ↓
Understanding
  ↓
Recommendation
  ↓
Confidence
  ↓
Action
  ↓
Memory
```

---

## 3. Core Emotional Outcomes

### What should the user feel in the first 10 seconds?
> *"I don't have to overthink tonight anymore."*
The interface should immediately absorb the cognitive load of planning. It should feel like handing the steering wheel to someone who knows the city better than you do.

### What emotion should the loading state create?
> *Anticipation and Trust.*
It should not feel like waiting for a database query to resolve. It should feel like a concierge stepping away for a moment to put together something special just for you.

### When should we reassure?
Whenever the user makes a defining choice (e.g., setting a budget, picking an occasion). Reassurance builds Decision Confidence.
- *Good:* "Saved."
- *OyaPlan:* "Perfect. We'll find something that fits."

### When should we stay silent?
When the user reaches the final recommendation. Let the plan speak for itself. Do not clutter the Plan Summary with tooltips, badges, or unnecessary marketing copy. The confidence is in the outcome.

### What should never appear in the interface?
- SaaS UI patterns (sidebars, dense data tables, sharp borders).
- Clinical data-entry terminology ("Inputs", "Filters", "Parameters", "Submit").
- Empty states that look like errors.
- Unexplained algorithmic scores.

### What makes someone instantly recognize "this feels like OyaPlan"?
- The conversation. 
- The summary ribbon building a natural sentence (`Date Night for two around ₦50k in Lekki`).
- Massive, thumb-friendly touch targets.
- The warm, opinionated tone ("Here's what we'd do.")

---

## 4. Planning Conversation Guidelines

### Question Order & Wording
The sequence of questions intentionally moves from abstract intent to concrete constraints.

1. **Intent (The Why)**
   - *Question:* "What are you in the mood for tonight?"
2. **Squad (The Who)**
   - *Question:* "Nice. How many people are coming?"
3. **Budget (The Constraint)**
   - *Question:* "What feels comfortable to spend?"
4. **Location (The Where)**
   - *Question:* "Anywhere you'd like us to stay close to?"

### The Summary Ribbon
The summary ribbon is our signature interaction. It does not just display selected filters; it tells the story of the night, updating dynamically with every tap.
- *Step 1:* `Date Night`
- *Step 2:* `Date Night for two`
- *Step 3:* `Date Night for two around ₦50k`
- *Step 4:* `Date Night for two around ₦50k in Lekki`

### Chip Design & Rhythm
Do not overuse chips. Mix interaction styles to create rhythm and prevent fatigue.
- **Occasion:** Large, expressive cards with emojis.
- **Budget/Squad:** Massive horizontal pills.
- **Location:** A vertical list of large tap targets, optimized strictly for one-handed thumb reach on mobile devices.

### Interaction Timing & Transitions
- **Auto-Advance:** After tapping a choice, highlight it briefly (tap feedback), then auto-advance to the next question after exactly 300ms. No "Next" buttons.
- **Animations:** Use subtle fades and slides (`slide-in-from-right`). Avoid jarring jumps.
- **Editing:** Tapping any part of the summary ribbon immediately slides the user back to that specific question without losing subsequent answers.

### The Loading Philosophy (The Plan Reveal)
The transition between the conversation and the final plan is sacred. Do not use generic spinners. 
- Step 1: "Checking recent prices..."
- Step 2: "Putting everything together..."
- Step 3: Reveal the Plan.
This multi-step progression reinforces that OyaPlan is doing the heavy lifting, cementing the user's Decision Confidence.
