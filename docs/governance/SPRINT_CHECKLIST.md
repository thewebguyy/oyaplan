# OyaPlan Sprint Checklist

Before writing **any code**, complete the PRE-SPRINT SAFETY CHECK. Every sprint must also finish with the POST-SPRINT VALIDATION.

```text
=================================================
PRE-SPRINT SAFETY CHECK
=================================================

Repository:
[ ]

Repository Purpose:
[ ]

Sprint:
[ ]

Current Branch:
[ ]

Files expected to change:
[ ]

Files explicitly out of scope:
[ ]

Am I importing implementation from another repository?

YES / NO

If YES
STOP.

Am I only borrowing:
• Product principles
• Brand language
• Design tokens
• Interaction philosophy

YES / NO

If NO
STOP.

=================================================
BOUNDARY STATUS
=================================================

Repository Boundary
PASS / FAIL

Build
PASS / FAIL

Tests
PASS / FAIL

Lint
PASS / FAIL

=================================================
IMPLEMENTATION PLAN REVIEW
=================================================

Will this change alter architecture?
YES / NO
If YES
Architecture review required before implementation.

Will this change affect routing?
YES / NO
If YES
Document affected routes.

Will this change affect shared UI?
YES / NO
If YES
List affected components.

=================================================
APPROVAL TO PROCEED
=================================================
Every new screen, component, or interaction must explain how it increases either Budget Confidence or Decision Confidence. If it does neither, it should not be built.

YES / NO
```

---

```text
=================================================
POST-SPRINT VALIDATION
=================================================

Repository Boundary
PASS / FAIL

Build
PASS / FAIL

Tests
PASS / FAIL

Lint
PASS / FAIL

Unused files introduced
YES / NO

Dead imports introduced
YES / NO

New technical debt introduced
YES / NO

Brand consistency maintained
PASS / FAIL

Product identity maintained
PASS / FAIL
```
