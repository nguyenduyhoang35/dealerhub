# DealerHub — Claude AI Agent Configuration

**Project:** DealerHub — Quản lý giao hàng đại lý (Vietnamese SMB delivery management)
**Maintainer:** Hoang Nguyen (hoangnguyen@fetch.tech)
**Tier:** Standard — see [TIERS.md](rules/TIERS.md)

> **Important:** This project has its own concrete tech stack ([rules/dealerhub.md](rules/dealerhub.md)).
> Where the generic [rules/tech-stack.md](rules/tech-stack.md) lists "preferred" choices (Prisma, BullMQ, Express, etc.), the DealerHub overrides in [rules/dealerhub.md](rules/dealerhub.md) win — read it before suggesting new dependencies.

---

## What DealerHub is

A web app for Vietnamese wholesalers / depots (kho) to:
- Manage agents (đại lý), products (sản phẩm), orders (đơn hàng)
- Plan delivery routes (lên tuyến) and assign drivers
- Driver mobile-web flow at `/my-route` to mark delivered + record cash collected
- Admin dashboard, Excel exports (orders, agents, products, delivery slips)
- PIN-based auth (cookie session, no NextAuth)

---

## Development Workflow

```
/spec  →  /plan  →  /build  →  /test  →  /review  →  Ship
Define   Plan      Build      Verify    Review     Deploy
```

| Phase | Command | Purpose |
|-------|---------|---------|
| **Define** | `/spec` | Create PRD with objectives, scope, boundaries |
| **Plan** | `/plan` | Decompose into vertical slices with acceptance criteria |
| **Build** | `/build` | Implement incrementally |
| **Verify** | `/test` | Tests; Prove-It for bug fixes |
| **Review** | `/review` | Five-axis code review before merge |
| **Ship** | `/deploy` | Build, test, deploy with staged rollout |

### Supporting Commands

| Command | Purpose |
|---------|---------|
| `/debug` | Systematic error diagnosis and root cause analysis |
| `/simplify` | Reduce complexity without changing behavior |
| `/fix-issue` | Analyze and fix reported issues |

---

## Core Principles

- **Test-Driven Development** — Write failing tests first, then implement
- **Incremental Implementation** — Small vertical slices, always buildable
- **Five-Axis Review** — Correctness, Readability, Architecture, Security, Performance
- **Progress over perfection** — fix root causes, not symptoms

---

## Mandatory Rules

All rules in `.claude/rules/` are mandatory:

### Project-specific (read first)
| Rule | Description |
|------|-------------|
| `dealerhub.md` | **DealerHub-specific stack, conventions, and folder layout — overrides generic rules where they conflict** |

### Code Quality
| Rule | Description |
|------|-------------|
| `clean-code.md` | Variables, functions, SOLID, async/await |
| `code-style.md` | Formatting, naming conventions |
| `error-handling.md` | AppError class, global handler patterns |

### Architecture & Design
| Rule | Description |
|------|-------------|
| `tech-stack.md` | Generic approved tech stack (treat as default reference) |
| `system-design.md` | CAP theorem, caching, scaling, queues |
| `project-structure.md` | Generic layered architecture (see `dealerhub.md` for actual layout) |
| `api-conventions.md` | REST standards, response envelopes |

### Data & Naming
| Rule | Description |
|------|-------------|
| `naming-conventions.md` | Cache keys, DB, queues, env vars |
| `database.md` | DB patterns, transactions, N+1 prevention |

### Operations
| Rule | Description |
|------|-------------|
| `security.md` | **CRITICAL** — Never violate security rules |
| `monitoring.md` | Prometheus, Grafana, logging, alerting |
| `testing.md` | Coverage thresholds, test patterns |
| `git-workflow.md` | Branching strategy, conventional commits |

---

## Available Agents

| Agent | When to Invoke |
|-------|---------------|
| 🖥️ **Frontend Developer** | Components, pages, routing, state, UI performance |
| 📱 **Mobile Developer** | Mobile-web flows (`/my-route`); not React Native here |
| 🔧 **Backend Developer** | App Router API routes, Supabase queries |
| 🏗️ **Systems Architect** | Architecture decisions, ADRs, system design |
| 👀 **Code Reviewer** | Five-axis PR review |
| 🧪 **Test Engineer** | Test strategy, TDD, coverage |
| 🔒 **Security Auditor** | Vulnerability assessment, PIN/cookie auth review |
| ✅ **QA Engineer** | Test plans, E2E tests, bug reports |
| 📋 **Project Manager** | User stories, sprint planning |
| 🎨 **UI/UX Designer** | Antd theming, mobile-first responsive UX |
| ✍️ **Copywriter/SEO** | Vietnamese microcopy, page copy |

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `tdd` | Test-Driven Development patterns |
| `code-review` | Five-axis review framework |
| `incremental-implementation` | Vertical slice development |
| `deploy` | Full deployment pipeline |
| `security-review` | Security audit checklist |

---

## Reference Checklists

| Reference | Use For |
|-----------|---------|
| `security-checklist.md` | Pre-deploy security verification |
| `testing-patterns.md` | Test structure and anti-patterns |
| `performance-checklist.md` | Core Web Vitals, optimization |
| `accessibility-checklist.md` | WCAG 2.1 AA compliance |
| `mobile-performance-checklist.md` | Mobile-web responsive performance |

---

## Agent Behavior Guidelines

1. **Read `dealerhub.md` first** — it overrides generic rules
2. **Follow the workflow** — `/spec` → `/plan` → `/build` → `/review`
3. **Apply mandatory rules** — non-negotiable
4. **Test first** — failing tests before implementing
5. **Incremental changes** — small commits, always buildable
6. **Explain before acting** — describe changes before making them
7. **Fix root causes** — don't patch symptoms
8. **Use the right agent** — invoke specialists for their domain
9. **Vietnamese microcopy** — user-facing text is Vietnamese (vi-VN), variable/code names are English
