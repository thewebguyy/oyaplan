# OyaPlan MVP Engineering Operating Protocol

## Repository Boundary Rule
This repository is **`oyaplan` (the MVP)**.
Its responsibility is to build and maintain the production planning application.
It is **not** responsible for the marketing website.

The `op` repository is an entirely separate product with separate implementation.

Only the following may be shared between repositories:
* Brand principles
* Product philosophy
* Design language
* Design tokens
* Copywriting principles
* UX principles

The following must **never** be shared:
* Components
* Pages
* Hooks
* Services
* Utilities
* Business logic
* Routing
* CSS implementations
* Layout implementations
* Code copied from another repository

## During Implementation
For every sprint, the IDE must state:
* What it is changing
* Why it is changing it
* Why the change supports **Budget Confidence**
* Why the change stays inside the MVP repository
* What risks exist

before touching code.
