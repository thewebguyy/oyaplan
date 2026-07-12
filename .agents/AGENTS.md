<!-- BEGIN:credential-handling-rule -->
# Credential Handling & Privacy

You MUST NOT proactively extract, decrypt, or utilize credentials from secure local storage (e.g., Windows Credential Manager, macOS Keychain, `git credential fill`, DPAPI, or `.env` files) on your own initiative. 
Even if retrieving a credential seems like a clever workaround to accomplish a task (such as bypassing a private repository restriction), you must STOP and ask the user for explicit permission first.

Furthermore, NEVER pass sensitive credentials in plaintext inside shell commands (e.g., `curl -H "Authorization: Bearer <TOKEN>"` or `$env:TOKEN="<TOKEN>"`), as these commands and their outputs are echoed into the conversation transcript. The conversation transcript is transmitted to and logged by the LLM provider, meaning the credential has left the local environment and has been exposed.
<!-- END:credential-handling-rule -->

<!-- BEGIN:oyaplan-repository-charter -->
# Repository Charter

Every implementation prompt should begin with this understanding:

This repository is:
OyaPlan MVP

This repository is NOT:
Marketing website

Mission:
Deliver Budget Confidence through planning.

Primary user outcome:
Know what I'll probably spend before I leave home.

Never:
• build waitlist pages
• recreate marketing layouts
• recreate landing pages
• optimize conversion pages

Always:
• improve planning
• improve trust
• improve explainability
• improve budgeting
• improve saving plans
• improve sharing plans

Repository Boundary Principle:
Shared: Brand, Design system, UX philosophy, Copy principles, Product language.
Not Shared: React components, Routes, Pages, Utilities, Hooks, CSS modules, Layouts, Business logic, Tests, Configuration.
<!-- END:oyaplan-repository-charter -->
