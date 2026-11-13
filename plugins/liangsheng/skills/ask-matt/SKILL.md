---
name: ask-matt
description: "凉笙路线指引：用户不知从哪里入手、需要判断工作路线时，依据目标推荐最短有用的技能顺序；复杂未知依赖用路径探明。"
disable-model-invocation: true
---

# 路线指引

## 凉笙调用约定

以下主体保留固定上游的方法与产物要求。独立任务按用户本次请求执行；P 岗位先读取主驱动的[岗位技能清单](../liangsheng-workflow/references/岗位技能清单.md)和当前任务卡。由主驱动选择步骤，所有组合、嵌套调用和临时代理都受同一岗位清单限制；清单外工作转交对应岗位。自动选技能不扩大职责、任务范围、模型、费用、远端写入或发布授权。

有材料的拷问优先由主驱动启动 grill-with-docs，实际组合 grilling 与 domain-modeling；讨论当前任务，不重新启动项目或重写他人 PRD。事实由助手查证，决定由用户作出。每次启动临时子代理前先向用户说明目的、数量和任务范围并等待同意；已有的本批明确许可可直接落实，不反复询问。未获准时可在当前窗口完成能独立处理的部分，注明独立性限制，不冒充隔离代理结果。P 员工必须是真实聊天，临时代理不替代 P 岗位。

恢复先读[进度与恢复](../liangsheng-workflow/references/进度与恢复.md)及记录指向的必要材料；已完成不重做，阶段确认沿用可信原始记录。真实 Plan 中不写文件或建窗，词汇和决定在对话中整理；实际退出 Plan 后及时落到既有词汇表和对应决定记录。原聊天不可读且记录未保存时明确缺口。

上游所称 Skill tool 或斜杠调用，在本环境通过实际读取本包 SKILL.md 并执行方法适配；不能只列名称。项目记录采用既有 PRD、任务卡、报告和词汇表，不新建竞争账本。上游的 issue/assign/close/publish 默认映射为本地记录与依赖状态；远端写入遵循项目已批准策略。上游提交、分支、推送及外部操作只在相应岗位和已有授权覆盖时执行，否则保留产物与版本指针交接。原型、研究与决策证据仍须保存。解释和输出使用易懂中文。具体操作受此约定及当前主驱动约束，方法的分析和完成标准继续保留。

正式计划生成前先询问“现在是否生成正式计划”，明确同意或直接要求生成才输出。已获生成许可且范围未变时沿用，不因等待真实 Plan 重问；重新讨论后的完整替代计划重新获准。生成计划须处于真实 Plan；修改文件、建窗和实施须有执行授权且真实退出 Plan。PRD 确认授权获批员工初始化，正式业务另等开工指令；各关口分别记录。

日常模型以本轮批准配置为准：P00a 请求 gpt-6.1-sol / high，P00b 请求 gpt-6-luna / xhigh；其余岗位在讨论时确认。配置不可用或不匹配时报告，不静默降级。请求配置与可核实实际配置分开记录，后台不可见写未知。改版测试配置仅见维护验收资料。
保留上游路线图和阶段判断；推荐路线须过滤当前岗位清单，其他岗位负责的工作只交接，不由调用者接管。

## 适用方法与资料

以下方法已按凉笙场景改编；仅在当前任务确需时读取相关参考、脚本和模板。

# Ask Matt

You don't remember every skill, so ask.

A **flow** is a path through the skills. Most paths run along one **main flow**, and two **on-ramps** merge onto it. Everything else is standalone, or a vocabulary layer that runs underneath.

## The main flow: idea → ship

The route most work travels. You have an idea and want it built.

1. **`liangsheng:grill-with-docs`** sharpens the idea by interview. Start here whenever you are **working in a working directory**: it's stateful, retaining what it learns in `CONTEXT.md` and ADRs. (No working directory? Use `liangsheng:grill-me` instead, covered under Standalone. Both run the same `liangsheng:grilling` primitive; `grill-with-docs` is the one that leaves a paper trail, which makes it the better of the two whenever a repo is there to leave it in.)
2. **Branch: can you settle every question in conversation?** If a question needs a runnable answer (state, business logic, a UI you have to see), detour through a prototype, bridged by **`liangsheng:handoff`** in both directions (a prototype lives in its own directory, which is exactly what `liangsheng:handoff` is for; see Phase boundaries):
   - **`liangsheng:handoff`** out, then open a fresh session against that file,
   - **`liangsheng:prototype`** to answer the question with throwaway code,
   - **`liangsheng:handoff`** back what you learned, and reference it from the original idea thread.
3. **Branch: is this a multi-session build?**
   - **Yes** → **`liangsheng:to-spec`** (turn the thread into a spec), then **`liangsheng:to-tickets`** to split it into tracer-bullet tickets, each declaring its **blocking edges**. On a local tracker that's one file per ticket under `.scratch/<feature>/issues/`, worked blockers-first by hand; on a real tracker the edges become native blocking links, so any ticket whose blockers are done can be grabbed: kick off **`liangsheng:implement`** per ticket, **`/clear`ing context between each one**. Each ticket is self-contained, so the last one's context is disposable.
   - **No** → **`liangsheng:implement`** right here, in the same context window.

   Either way, **`liangsheng:implement`** builds each issue by driving **`liangsheng:tdd`** internally (one red-green slice at a time), then closes out by running **`liangsheng:code-review`**, a two-axis review (Standards + Spec) of the diff, before committing. Reach for **`liangsheng:tdd`** on its own when you just want to build a concrete behaviour test-first without a full spec, and **`liangsheng:code-review`** on its own whenever you want to review a branch or PR against a fixed point.

### Context hygiene

Keep steps 1–3 in **one unbroken context window** (don't compact or clear until after `liangsheng:to-tickets`) so the grilling, spec, and tickets all build on the same thinking. Each `liangsheng:implement` then starts fresh, working from the ticket.

The limit on this is the **[smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**: the window (~150k tokens on state-of-the-art models) within which the model still reasons sharply. If a session approaches it before `liangsheng:to-tickets`, don't push on degraded; `/compact` at the nearest phase boundary and carry on (see Phase boundaries).

## On-ramps

A starting situation that generates work, then merges onto the main flow.

- **Bugs and requests piling up** → **`liangsheng:triage`**. It moves issues through triage roles and produces agent-ready issues, which **`liangsheng:implement`** later picks up.

  Triage is only for issues **you didn't create**: bug reports, incoming feature requests, anything that arrives raw. Tickets that `liangsheng:to-tickets` produced are already agent-ready, so **don't triage them**.

- **Something's broken** → **`liangsheng:diagnosing-bugs`**. For the hard ones: the bug that resists a first glance, the intermittent flake, the regression that crept in between two known-good states. It refuses to theorise until it has a **tight feedback loop** (one command that already goes red on *this* bug), then fixes with a regression test. Its post-mortem hands off to **`liangsheng:improve-codebase-architecture`** when the real finding is that there's no good seam to lock the bug down.

- **A huge, foggy effort: a greenfield project or a huge feature build, too big for one session** → **`liangsheng:wayfinder`**, the most cognitively demanding flow here. When the way from here to the destination isn't visible yet, it charts a **shared map** of **decision tickets** on the issue tracker and resolves them one at a time, producing **decisions, not deliverables**, until the fog is pushed back and the way is clear. Where **`liangsheng:grill-with-docs`** sharpens an idea you can hold in one session, wayfinder is for the idea you can't, and it's slower and denser, so save it for exactly that, never a well-scoped feature.

  When the map clears, **it hands off, it doesn't build**: merge onto the main flow at **`liangsheng:to-spec`**, which collapses the map's linked decisions into a buildable plan, then `liangsheng:to-tickets` and `liangsheng:implement` as usual. Looping the map straight into `liangsheng:implement` skips that collapse and throws the linked detail away, so go straight to `liangsheng:implement` only when the effort turned out genuinely small.

## Codebase health

Not feature work, just upkeep.

- **`liangsheng:improve-codebase-architecture`** runs whenever you have a spare moment to keep the codebase good for agents to operate in. It surfaces **deepening opportunities**; picking one _generates an idea_ you can take into the main flow at `liangsheng:grill-with-docs`. It's the survey that finds the candidates; **`liangsheng:codebase-design`** (below) is the bench you design the chosen one on.

## Vocabulary underneath

Two model-invoked references that run *beneath* the other skills, each the single source of truth for its vocabulary. Reach for them directly when the **words**, not the process, are the problem; or let the skills above pull them in.

- **`liangsheng:domain-modeling`**: sharpen the project's *domain* language: challenge a fuzzy term, resolve an overloaded word ("account" doing three jobs), record a hard-to-reverse decision as an ADR. It's the active discipline `liangsheng:grill-with-docs` drives to keep `CONTEXT.md` a clean glossary.
- **`liangsheng:codebase-design`** is the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) for designing a module's *shape*: a lot of behaviour behind a small interface at a clean seam. `liangsheng:tdd` and `liangsheng:improve-codebase-architecture` both speak it.

## Phase boundaries

A **phase** is a chunk of work inside a session: the grilling, the implementation, the QA. At the **boundary** between two of them you have five options, and picking between them is the fuzziest decision in this whole map:

- **Continue**: stay put. Costs nothing, loses nothing.
- **`/clear`**: empty the window, when nothing here matters to what's next.
- **`liangsheng:handoff`** writes a portable markdown file. Narrow: only for a **new harness**, a **new directory**, a **colleague**, or forking a side task **mid-phase**. What it buys is portability.
- **Subagent**: send a tightly-scoped task to its own window and get a report back.
- **`/compact`** compresses this context and seeds a fresh session with it. The **default**, at the bottom of the tree rather than the first reach.

Read [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md) for the ordered tree: the five questions, the reasoning behind each branch, and why the primary-source cost makes **Continue** the one to rule out first. Make the decision **at** a boundary; mid-phase, continue or split the rest into subagents.

## Standalone

Off the main flow entirely.

- **`liangsheng:grill-me`**: the same relentless interview as `liangsheng:grill-with-docs`, but **stateless**: it saves nothing locally and builds no `CONTEXT.md`. Reach for it when you are **not working in a working directory** (sharpening a plan, a design, a piece of writing, anything with no repo under it). If you are in a working directory, use `liangsheng:grill-with-docs` instead: it runs the same interview and leaves a paper trail, so it is strictly the better one.
- **`liangsheng:grilling`** is the interview primitive itself: rounds, the frontier, facts are the agent's job and decisions are yours. `liangsheng:grill-me` and `liangsheng:grill-with-docs` are the two named ways in, and `liangsheng:triage`, `liangsheng:wayfinder` and `liangsheng:improve-codebase-architecture` all run it internally. Reach for it directly only when you want the interview with no wrapper around it.
- **`liangsheng:resolving-merge-conflicts`** works an in-progress merge or rebase conflict hunk by hunk, resolving by **intent** traced to each side's primary source rather than by picking lines, then finishes the operation. It never runs `--abort`. Standalone and off every flow: reach for it when you are already mid-conflict.
- **`liangsheng:prototype`** is a small, throwaway program that answers one design question: does this state model feel right, or what should this UI look like. Throwaway is a constraint on how the code is written, not a promise to destroy it: the answer folds into the real code, and the prototype itself is kept as a **primary source** on a `prototype/<name>` branch out of main, pointed at from the implementation issue. It's the detour in step 2 of the main flow, but reach for it any time a design question is hard to settle on paper.
- **`liangsheng:research`**: delegate reading legwork to a **background agent**: it investigates a question against **primary sources**, then leaves a cited Markdown file in the repo. Keep working while it reads. The file it produces is something to take *into* the main flow at `liangsheng:grill-with-docs`, since research feeds the thinking rather than replacing it.
- **`liangsheng:to-questionnaire`** comes in when the thing blocking you isn't in your head or the codebase but in **someone else's**, and it writes them a questionnaire to fill in. It's the inverse of `liangsheng:grill-me`: instead of interviewing you about the subject, it interviews you about the **send** (who it's going to, what you need back) and aims the questions at the gap. What comes back is material for `liangsheng:grill-with-docs` or `liangsheng:to-spec`.
- **`liangsheng:wizard`** is for the steps only a **human** can take: provisioning infrastructure, setting up credentials or CI secrets, clicking through an unfamiliar third-party dashboard, running a one-off migration or cutover. It generates an interactive bash script that opens each URL, captures each value, and writes it into `.env` and GitHub secrets, so the procedure stops being something you re-explain to an agent every time. Model-invoked, so the agent reaches for it the moment it hits a wall only you can pass. If the agent could just do it itself, it should; this is for where a human is genuinely in the loop.
- **`liangsheng:wait-what`** is the corrective for a message that didn't land. Use it mid-conversation, inside any other skill, and the agent re-pitches what it just said with the context you were missing, in 易懂中文, using the `CONTEXT.md` vocabulary. It works after the fact; `liangsheng:grill-with-docs` is the upfront cure, because a shared language agreed early is what stops the jargon arriving at all.
- **`liangsheng:teach`**: learn a concept over multiple sessions, using the current directory as a stateful workspace.
- **`liangsheng:writing-for-agents`** is the reference for writing documents agents consume: skills, AGENTS.md, pointed-at docs.

## Precondition

**`liangsheng:setup-matt-pocock-skills`**: run before your first engineering flow to configure the issue tracker, triage labels, and doc layout the other skills assume. Custom issue trackers also work.
