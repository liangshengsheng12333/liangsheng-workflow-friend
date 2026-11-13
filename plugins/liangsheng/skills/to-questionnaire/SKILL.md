---
name: to-questionnaire
description: "凉笙调研提纲：用户要向他人收集信息、准备访谈或回填问题时，生成有重点的提问稿；不自动发送。"
disable-model-invocation: true
---

# 调研提纲

## 凉笙调用约定

以下主体保留固定上游的方法与产物要求。独立任务按用户本次请求执行；P 岗位先读取主驱动的[岗位技能清单](../liangsheng-workflow/references/岗位技能清单.md)和当前任务卡。由主驱动选择步骤，所有组合、嵌套调用和临时代理都受同一岗位清单限制；清单外工作转交对应岗位。自动选技能不扩大职责、任务范围、模型、费用、远端写入或发布授权。

有材料的拷问优先由主驱动启动 grill-with-docs，实际组合 grilling 与 domain-modeling；讨论当前任务，不重新启动项目或重写他人 PRD。事实由助手查证，决定由用户作出。每次启动临时子代理前先向用户说明目的、数量和任务范围并等待同意；已有的本批明确许可可直接落实，不反复询问。未获准时可在当前窗口完成能独立处理的部分，注明独立性限制，不冒充隔离代理结果。P 员工必须是真实聊天，临时代理不替代 P 岗位。

恢复先读[进度与恢复](../liangsheng-workflow/references/进度与恢复.md)及记录指向的必要材料；已完成不重做，阶段确认沿用可信原始记录。真实 Plan 中不写文件或建窗，词汇和决定在对话中整理；实际退出 Plan 后及时落到既有词汇表和对应决定记录。原聊天不可读且记录未保存时明确缺口。

上游所称 Skill tool 或斜杠调用，在本环境通过实际读取本包 SKILL.md 并执行方法适配；不能只列名称。项目记录采用既有 PRD、任务卡、报告和词汇表，不新建竞争账本。上游的 issue/assign/close/publish 默认映射为本地记录与依赖状态；远端写入遵循项目已批准策略。上游提交、分支、推送及外部操作只在相应岗位和已有授权覆盖时执行，否则保留产物与版本指针交接。原型、研究与决策证据仍须保存。解释和输出使用易懂中文。具体操作受此约定及当前主驱动约束，方法的分析和完成标准继续保留。

正式计划生成前先询问“现在是否生成正式计划”，明确同意或直接要求生成才输出。已获生成许可且范围未变时沿用，不因等待真实 Plan 重问；重新讨论后的完整替代计划重新获准。生成计划须处于真实 Plan；修改文件、建窗和实施须有执行授权且真实退出 Plan。PRD 确认授权获批员工初始化，正式业务另等开工指令；各关口分别记录。

日常模型以本轮批准配置为准：P00a 请求 gpt-6.1-sol / high，P00b 请求 gpt-6-luna / xhigh；其余岗位在讨论时确认。配置不可用或不匹配时报告，不静默降级。请求配置与可核实实际配置分开记录，后台不可见写未知。改版测试配置仅见维护验收资料。
保留受访者、信息缺口、异步问卷模板和覆盖完成标准，只准备提问稿；实际发送须用户明确授权。

## 适用方法与资料

以下方法已按凉笙场景改编；仅在当前任务确需时读取相关参考、脚本和模板。

Turn something the user can't answer alone into a **questionnaire**: a Markdown document they hand to one person to fill in async, or fill out together over a meeting. The recipient holds knowledge the user lacks; the questionnaire pulls it out of them.

**Grill the send, not the subject.** Interview the user only about the _send_, which they can always answer: who it goes to, and what they need back. The questions in the document then target the **gap** between what the recipient knows and what the user needs.


1. **Who is it going to?** Ask, in one exchange, the recipient's role, expertise, and relationship to the user. This fixes the questionnaire's tone and how much context it must carry. Done when you know who the recipient is and what they know that the user doesn't.

2. **What do you need back?** Ask, in one exchange, the specific decisions or facts the user can't resolve alone and needs from this person. Done when you have a concrete list of what the user must walk away able to do or decide.

3. **Write the questionnaire.** Draft questions aimed at the gap from steps 1–2, following the Document structure below. Write it to `to-questionnaire-<slug>.md` in the current directory (slug from the topic) and report the path. Done when the file exists and every item the user named in step 2 is covered by a question.

## Document structure

Frame the document as a **discovery questionnaire**: the user lacks context, the recipient holds it. Order questions most-important-first, since async means you may only get one pass, and group them under `##` headings by theme once there are more than a handful. Write it using the template below.

<questionnaire-template>

# <Questionnaire title>

**Purpose:** why this questionnaire exists and the decision riding on it.

**From:** <the user>, **To:** <the recipient>, **How your answers will be used:** <where they go>

## Context

One paragraph orienting a recipient who wasn't in the user's head. Enough to answer well, not a page.

## How to answer

Deadline and rough effort. Partial answers and "I don't know" are useful: flag anything you're unsure of rather than skipping it.

## <Theme heading>

One `##` section per theme. Under each, its questions, most-important-first. Every question is one idea, never compound, with an answer stub directly beneath, and a one-line _why this matters_ only where the question could be misread or invite a throwaway answer.

<question-example>
### What load is the system expected to handle at launch?

_Why this matters: it decides whether we provision for burst traffic now or defer it._

>
</question-example>

## Anything else?

A closing catch-all: anything we didn't ask that we should know?

</questionnaire-template>
