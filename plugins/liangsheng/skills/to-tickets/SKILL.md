---
name: to-tickets
description: "凉笙任务拆分：用户要把已明确的需求、方案或规格拆为可独立验收的小任务并排依赖时，生成纵向任务清单；未经整理的原始反馈用 triage。"
disable-model-invocation: true
---

# 任务拆分

## 凉笙调用约定

以下主体保留固定上游的方法与产物要求。独立任务按用户本次请求执行；P 岗位先读取主驱动的[岗位技能清单](../liangsheng-workflow/references/岗位技能清单.md)和当前任务卡。由主驱动选择步骤，所有组合、嵌套调用和临时代理都受同一岗位清单限制；清单外工作转交对应岗位。自动选技能不扩大职责、任务范围、模型、费用、远端写入或发布授权。

有材料的拷问优先由主驱动启动 grill-with-docs，实际组合 grilling 与 domain-modeling；讨论当前任务，不重新启动项目或重写他人 PRD。事实由助手查证，决定由用户作出。每次启动临时子代理前先向用户说明目的、数量和任务范围并等待同意；已有的本批明确许可可直接落实，不反复询问。未获准时可在当前窗口完成能独立处理的部分，注明独立性限制，不冒充隔离代理结果。P 员工必须是真实聊天，临时代理不替代 P 岗位。

恢复先读[进度与恢复](../liangsheng-workflow/references/进度与恢复.md)及记录指向的必要材料；已完成不重做，阶段确认沿用可信原始记录。真实 Plan 中不写文件或建窗，词汇和决定在对话中整理；实际退出 Plan 后及时落到既有词汇表和对应决定记录。原聊天不可读且记录未保存时明确缺口。

上游所称 Skill tool 或斜杠调用，在本环境通过实际读取本包 SKILL.md 并执行方法适配；不能只列名称。项目记录采用既有 PRD、任务卡、报告和词汇表，不新建竞争账本。上游的 issue/assign/close/publish 默认映射为本地记录与依赖状态；远端写入遵循项目已批准策略。上游提交、分支、推送及外部操作只在相应岗位和已有授权覆盖时执行，否则保留产物与版本指针交接。原型、研究与决策证据仍须保存。解释和输出使用易懂中文。具体操作受此约定及当前主驱动约束，方法的分析和完成标准继续保留。

正式计划生成前先询问“现在是否生成正式计划”，明确同意或直接要求生成才输出。已获生成许可且范围未变时沿用，不因等待真实 Plan 重问；重新讨论后的完整替代计划重新获准。生成计划须处于真实 Plan；修改文件、建窗和实施须有执行授权且真实退出 Plan。PRD 确认授权获批员工初始化，正式业务另等开工指令；各关口分别记录。

日常模型以本轮批准配置为准：P00a 请求 gpt-6.1-sol / high，P00b 请求 gpt-6-luna / xhigh；其余岗位在讨论时确认。配置不可用或不匹配时报告，不静默降级。请求配置与可核实实际配置分开记录，后台不可见写未知。改版测试配置仅见维护验收资料。
涉及代码实现、设计、测试或审查时，读取并遵守 [代码简洁约定](../liangsheng-workflow/references/代码简洁约定.md)。仅约束新增及当前任务直接涉及的改动，不自动清理无关旧代码。

保留纵向切片、阻塞关系及 expand-contract 方法；P00a/P03 写任务，P01 只负责派发。任务以本次明确范围为准。

## 适用方法与资料

以下方法已按凉笙场景改编；仅在当前任务确需时读取相关参考、脚本和模板。

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `liangsheng:setup-matt-pocock-skills`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the tickets to the configured tracker

Publish the approved tickets. **How** depends on the tracker `liangsheng:setup-matt-pocock-skills` configured; the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below: one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, Linear, …)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking / sub-issue relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. Apply the `ready-for-agent` triage label unless instructed otherwise; the tickets are agent-grabbable by construction.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

<local-ticket-template>

# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None (can start immediately)".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)".

</issue-template>

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
