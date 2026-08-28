# Coding Agent Contract

## Purpose

This repository contains the institutional website for Valinor Agency. The site must explain the agency's current services, build trust, demonstrate design and technical judgment, and convert qualified visitors into potential clients.

Git-tracked project documents are the source of truth. Agent memory, assumptions, generated copy, and external examples are not authority.

## Canonical documents

Read `README.md` first and use its document map.

| Topic | Canonical source |
| --- | --- |
| Product, users, goals, conversion, and scope | `PRODUCT.md` |
| Visual, content, responsive, and motion direction | `DESIGN.md` |
| Stack, routes, boundaries, and integrations | `docs/ARCHITECTURE.md` |
| Quality gates and validation evidence | `docs/QUALITY.md` |
| Current launch findings and priorities | `docs/audits/2026-08-28-launch-readiness.md` |
| Significant technical or product decisions | `docs/decisions/` |
| Proven project lessons | `docs/LESSONS.md` |

Update the canonical source for a topic. Do not create parallel or contradictory guidance.

## Before changing anything

1. Inspect `git status`, the current branch, and the relevant files.
2. Read `README.md` and the canonical documents related to the task.
3. Inspect the existing implementation before assuming something is missing.
4. Separate confirmed facts from `Pending confirmation`, `Not decided`, and `Not applicable`.
5. Explain briefly:
   - what was understood;
   - which files would be affected;
   - the proposed approach;
   - risks, trade-offs, or unresolved decisions.
6. If the request is analysis, audit, diagnosis, or planning, do not modify implementation files without explicit authorization.

## Working rules

- Stay within the requested scope.
- Prefer the smallest coherent change and apply YAGNI.
- Preserve existing work and unrelated user changes.
- Do not invent requirements, client claims, portfolio cases, metrics, testimonials, integrations, contact data, or approvals.
- Do not add dependencies when the objective can be met with the current stack.
- Do not replace existing technologies without a clear reason and explicit approval.
- Do not perform broad refactors as part of a focused task.
- Keep TypeScript strict and avoid `any` unless technically justified.
- Do not leave debug logs, dead code, unused imports, or commented-out implementations.
- Reuse existing components when reasonable; do not create premature abstractions.
- Treat accessibility, SEO, performance, and security as delivery concerns, not optional polish.

## Commercial scope

Valinor currently presents these services publicly:

- institutional websites and landing pages;
- ecommerce;
- web applications;
- dashboards and internal web tools;
- custom digital solutions.

Artificial intelligence may be described as part of Valinor's internal design and development process. Do not present AI agents, private ChatGPT-like products, chatbots, AI consulting, or business automation as independent current services unless the user explicitly changes the commercial scope in `PRODUCT.md`.

## Implementation boundaries

- The current product is a public institutional frontend.
- Do not introduce a backend, database, authentication, CMS, analytics, tracking, email provider, or form service without explicit approval.
- Never expose secrets, tokens, private environment variables, or personal data.
- Use `"use client"` only when state, effects, browser APIs, events, or client-only libraries require it.
- Prefer CSS for simple transitions, Framer Motion for declarative UI motion, GSAP for justified sequences, and Three.js only for experiences whose value outweighs their performance cost.
- Respect `prefers-reduced-motion` and preserve usable fallbacks when JavaScript or advanced effects fail.

## Content and design changes

When changing public content:

- verify it against `PRODUCT.md`;
- state important copy changes in the plan;
- explain what Valinor does, for whom, what problem it solves, what the client receives, and the next step;
- avoid unverified promises, invented outcomes, inflated team descriptions, generic marketing language, and unnecessary technical jargon.

When changing visual behavior, read `DESIGN.md` and validate the relevant responsive widths. Do not interpret "more modern" as "more effects."

## Validation

Use the real gates documented in `docs/QUALITY.md`. Run only applicable checks, but never claim a gate passed without executing it or completing its documented manual procedure.

After a change, report:

- files changed;
- checks executed and their results;
- applicable checks not executed and why;
- remaining risks, failures, or pending confirmations.

## Authorization boundaries

Commit, push, deploy, dependency installation or upgrade, external messages, form submissions, changes to Git configuration, remotes, branches, hosting, domains, or third-party services require explicit user authorization.
