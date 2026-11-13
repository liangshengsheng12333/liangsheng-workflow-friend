---
name: setup-matt-pocock-skills
description: "凉笙规范接入：用户要为仓库补齐代理协作所需的记录、术语或指引入口时，检查缺项并复用已有状态源；不启动完整立项。"
disable-model-invocation: true
---

# 规范接入

## 凉笙调用约定

以下主体保留固定上游的方法与产物要求。独立任务按用户本次请求执行；P 岗位先读取主驱动的[岗位技能清单](../liangsheng-workflow/references/岗位技能清单.md)和当前任务卡。由主驱动选择步骤，所有组合、嵌套调用和临时代理都受同一岗位清单限制；清单外工作转交对应岗位。自动选技能不扩大职责、任务范围、模型、费用、远端写入或发布授权。

有材料的拷问优先由主驱动启动 grill-with-docs，实际组合 grilling 与 domain-modeling；讨论当前任务，不重新启动项目或重写他人 PRD。事实由助手查证，决定由用户作出。每次启动临时子代理前先向用户说明目的、数量和任务范围并等待同意；已有的本批明确许可可直接落实，不反复询问。未获准时可在当前窗口完成能独立处理的部分，注明独立性限制，不冒充隔离代理结果。P 员工必须是真实聊天，临时代理不替代 P 岗位。

恢复先读[进度与恢复](../liangsheng-workflow/references/进度与恢复.md)及记录指向的必要材料；已完成不重做，阶段确认沿用可信原始记录。真实 Plan 中不写文件或建窗，词汇和决定在对话中整理；实际退出 Plan 后及时落到既有词汇表和对应决定记录。原聊天不可读且记录未保存时明确缺口。

上游所称 Skill tool 或斜杠调用，在本环境通过实际读取本包 SKILL.md 并执行方法适配；不能只列名称。项目记录采用既有 PRD、任务卡、报告和词汇表，不新建竞争账本。上游的 issue/assign/close/publish 默认映射为本地记录与依赖状态；远端写入遵循项目已批准策略。上游提交、分支、推送及外部操作只在相应岗位和已有授权覆盖时执行，否则保留产物与版本指针交接。原型、研究与决策证据仍须保存。解释和输出使用易懂中文。具体操作受此约定及当前主驱动约束，方法的分析和完成标准继续保留。

正式计划生成前先询问“现在是否生成正式计划”，明确同意或直接要求生成才输出。已获生成许可且范围未变时沿用，不因等待真实 Plan 重问；重新讨论后的完整替代计划重新获准。生成计划须处于真实 Plan；修改文件、建窗和实施须有执行授权且真实退出 Plan。PRD 确认授权获批员工初始化，正式业务另等开工指令；各关口分别记录。

日常模型以本轮批准配置为准：P00a 请求 gpt-6.1-sol / high，P00b 请求 gpt-6-luna / xhigh；其余岗位在讨论时确认。配置不可用或不匹配时报告，不静默降级。请求配置与可核实实际配置分开记录，后台不可见写未知。改版测试配置仅见维护验收资料。
保留发现配置、状态映射、词汇布局及指引入口的完整接入步骤。P00b 从获批 PRD 取得配置答案，已有状态源优先复用；只新增必要指针，保留 AGENTS 周围内容。

## 适用方法与资料

以下方法已按凉笙场景改编；仅在当前任务确需时读取相关参考、脚本和模板。

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: where issues live (项目既有状态源优先，无则使用本地 Markdown; local markdown is also supported out of the box)
- **Triage labels**: the strings used for the five canonical triage roles
- **Domain docs**: where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config`: is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/`: does this skill's prior output already exist?
- `.scratch/`: a sign that a local-markdown issue tracker convention is already in use
- Is the `triage` skill installed? (a `triage` skill folder alongside this one, or `triage` in your available skills.) This decides whether Section B runs at all.
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `triage` isn't installed, Section C when there's no monorepo).

**Section A: Issue tracker.**

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, and `to-spec` read from and write to it. They need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub**: issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab**: issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown**: issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.): ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`. The GitHub and GitLab templates carry a "PRs as a request surface" flag, defaulted **off**. Leave it off and don't raise it: a user who wants external PRs in the triage queue can flip the flag in the file later.

**Section B: Triage label vocabulary.** Skip this section entirely if the `triage` skill isn't installed (exploration told you), since an uninstalled skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. On **yes**, write them as-is. Only if the user says no, usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`), collect the overrides so `triage` applies existing labels instead of creating duplicates.

**Section C: Domain docs.** Default to **single-context** (one `CONTEXT.md` + `docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only when `triage` is installed)

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- 在 Codex 中优先编辑现有 `AGENTS.md`；仅项目确实使用 CLAUDE 时才编辑 `CLAUDE.md`。
- Else if `AGENTS.md` exists, edit it.
- 两者都没有时按获批初始化方案建立 `AGENTS.md`；方案未覆盖时先确认。

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa); always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Include the `### Triage labels` sub-block, and write `docs/agents/triage-labels.md`, only when `triage` is installed and Section B ran. When it isn't, both are omitted.

Then write the docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md): GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md): GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md): local-markdown issue tracker
- [triage-labels.md](./triage-labels.md): label mapping (only if `triage` is installed)
- [domain.md](./domain.md): domain doc consumer rules + layout

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch using the user's description.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later; re-running this skill is only necessary if they want to switch issue trackers or restart from scratch.
