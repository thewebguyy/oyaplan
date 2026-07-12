# OyaPlan Repository Boundary Charter

## Purpose
This document establishes a strict boundary between the marketing website and the MVP application to prevent cross-contamination of code, assets, and design systems.

## Repository 1: `OP` (Marketing)

**Owner:** Growth & Marketing

**Owns:**
* marketing
* waitlist
* landing pages
* SEO
* storytelling
* about
* why
* blog

**Cannot contain:**
* Forge
* Matching
* Plans
* Authentication
* User data

---

## Repository 2: `OyaPlan` (MVP)

**Owner:** Product & Engineering

**Owns:**
* product
* forge
* plans
* matching
* dashboard
* explore
* profile
* saved plans

**Cannot contain:**
* marketing homepage
* waitlist
* blog
* about
* why
* landing pages

## Repository Boundary Principle

**Shared**
-------
✓ Brand
✓ Design system
✓ UX philosophy
✓ Copy principles
✓ Product language

**Not Shared**
----------
✗ React components
✗ Routes
✗ Pages
✗ Utilities
✗ Hooks
✗ CSS modules
✗ Layouts
✗ Business logic
✗ Tests
✗ Configuration

> **HARD RULE:** If a feature belongs to another repository, reproduce only the **design language**, never the implementation. Code, components, assets, routes, and layouts must **never** be copied between repositories. Any UI components shared logically must be implemented independently according to the repository's specific architecture.
