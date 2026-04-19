# Phase 4: CI/CD and Release Automation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 04-ci-cd-and-release-automation
**Areas discussed:** Publishing flow, CI workflow scope, Demo site deploy, Repository identity, License rights

---

## Publishing Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Changesets-driven | changesets/action creates Version Packages PR, merging publishes to npm | ✓ |
| Tag-driven | Manual git tag push triggers npm publish | |
| Both paths | Changesets primary + tag-trigger backup | |

**User's choice:** Changesets-driven
**Notes:** Single publish path, no tag-based backup

| Option | Description | Selected |
|--------|-------------|----------|
| Manual first publish | First npm publish done locally, then configure OIDC | ✓ |
| NPM_TOKEN secret fallback | Temporary classic token for first publish | |
| You decide | Claude picks bootstrapping approach | |

**User's choice:** Manual first publish
**Notes:** Simplest bootstrapping, no temporary secrets

| Option | Description | Selected |
|--------|-------------|----------|
| No, Changesets only | Single publish path, hotfixes still through Changesets | ✓ |
| Yes, add tag-trigger backup | Second workflow for emergency bypasses | |

**User's choice:** No, Changesets only

| Option | Description | Selected |
|--------|-------------|----------|
| PR you merge | Version PR reviewed and merged manually | ✓ |
| Auto-merge version PR | Version PRs merge without intervention | |

**User's choice:** PR you merge

---

## CI Workflow Scope

| Option | Description | Selected |
|--------|-------------|----------|
| lint + test + build | Matches CICD-01 requirements | ✓ |
| typecheck | Add tsc --noEmit | ✓ |
| format:check | Add Prettier check | ✓ |
| test:exports (attw) | Add package export validation | ✓ |

**User's choice:** All checks selected
**Notes:** Full quality gate on every PR

| Option | Description | Selected |
|--------|-------------|----------|
| Node 22 only | Single version, matches CLAUDE.md | ✓ |
| Node 20 + 22 matrix | Current + previous LTS | |
| Node 18 + 20 + 22 matrix | All supported versions | |

**User's choice:** Node 22 only

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential, fail-fast | Stops on first failure | ✓ |
| Parallel steps | All checks simultaneously | |
| You decide | Claude picks | |

**User's choice:** Sequential, fail-fast

| Option | Description | Selected |
|--------|-------------|----------|
| PR + main push | Standard for OSS | ✓ |
| PR only | Skip CI on direct pushes | |
| You decide | Claude picks | |

**User's choice:** PR + main push

| Option | Description | Selected |
|--------|-------------|----------|
| 2 files | ci.yml + release.yml | |
| 3 files | ci.yml + release.yml + deploy.yml | ✓ |
| You decide | Claude picks | |

**User's choice:** 3 files

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add a note | Comment about branch protection | ✓ |
| No, workflow only | No mention of branch protection | |

**User's choice:** Yes, add a note

| Option | Description | Selected |
|--------|-------------|----------|
| actions/setup-node cache | Built-in npm cache | ✓ |
| No caching | Fresh install every run | |
| You decide | Claude picks | |

**User's choice:** actions/setup-node cache

| Option | Description | Selected |
|--------|-------------|----------|
| Major version tags | e.g., actions/checkout@v4 | ✓ |
| SHA pinning | Exact commit SHA | |
| You decide | Claude picks | |

**User's choice:** Major version tags

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add size check | Fail CI if > 1KB gzipped | ✓ |
| No, trust manual checks | No automated size gate | |
| You decide | Claude picks | |

**User's choice:** Yes, add size check

---

## Demo Site Deploy

| Option | Description | Selected |
|--------|-------------|----------|
| Create workflow now, skip if no site | Conditional check for docs/ directory | ✓ |
| Defer to Phase 6 | Don't create deploy.yml yet | |
| Stub site + workflow | Minimal placeholder index.html | |

**User's choice:** Create workflow now, skip if no site

| Option | Description | Selected |
|--------|-------------|----------|
| withastro/action@v6 | Official Astro GitHub Action | ✓ |
| Manual npm build + deploy | More control, more config | |
| You decide | Claude picks | |

**User's choice:** withastro/action@v6

| Option | Description | Selected |
|--------|-------------|----------|
| Main push + manual dispatch | Automatic + manual trigger | ✓ |
| Main push only | Automatic only | |
| You decide | Claude picks | |

**User's choice:** Main push + manual dispatch

| Option | Description | Selected |
|--------|-------------|----------|
| docs/ directory | Standard convention | ✓ |
| demo/ directory | Custom naming | |
| You decide | Claude picks | |

**User's choice:** docs/ directory

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, cancel in-progress | Concurrency with cancel-in-progress | ✓ |
| No concurrency control | Let deployments queue | |
| You decide | Claude picks | |

**User's choice:** Yes, cancel in-progress

| Option | Description | Selected |
|--------|-------------|----------|
| Default github.io URL | jorislacance.github.io/react-site-icon | ✓ |
| Custom domain | Configure DNS | |

**User's choice:** Default github.io URL (initially selected custom domain, then decided to use default)

| Option | Description | Selected |
|--------|-------------|----------|
| Trust main is clean | Skip CI in deploy workflow | |
| Re-run checks before deploy | Belt-and-suspenders | ✓ |
| You decide | Claude picks | |

**User's choice:** Re-run checks before deploy

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, build library first | Run npm run build before Astro build | ✓ |
| No, assume dist/ exists | Depend on published package | |
| You decide | Claude picks | |

**User's choice:** Yes, build library first

---

## Repository Identity

| Option | Description | Selected |
|--------|-------------|----------|
| jorislacance | Use jorislacance/react-site-icon | ✓ |
| Different owner | Custom username/org | |

**User's choice:** jorislacance

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, fix all placeholders | Update package.json + changeset config | ✓ |
| Leave placeholders | Only use real owner in workflows | |

**User's choice:** Yes, fix all placeholders

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, set author | Set to Joris Lacance | ✓ |
| Leave empty | Keep empty for now | |

**User's choice:** Yes, set author — "Joris Lacance"

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Pages URL | https://jorislacance.github.io/react-site-icon/ | ✓ |
| GitHub repo URL | https://github.com/jorislacance/react-site-icon | |
| You decide | Claude picks | |

**User's choice:** GitHub Pages URL

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add bugs URL | https://github.com/jorislacance/react-site-icon/issues | ✓ |
| No | Skip bugs field | |

**User's choice:** Yes, add bugs URL

---

## License Rights

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, create MIT LICENSE | Standard MIT with name and year | ✓ |
| Defer to Phase 5 | Handle in documentation phase | |
| You decide | Claude picks | |

**User's choice:** Yes, create MIT LICENSE

| Option | Description | Selected |
|--------|-------------|----------|
| 2026 Joris Lacance | Standard copyright format | ✓ |
| Different holder | Custom copyright line | |

**User's choice:** 2026 Joris Lacance

---

## Claude's Discretion

- Exact workflow YAML structure and step naming
- Job names and workflow display names
- Specific gzip size check implementation
- OIDC permission blocks in release.yml
- Conditional logic for skipping deploy when docs/ doesn't exist
- Order of package.json field updates

## Deferred Ideas

None — discussion stayed within phase scope
