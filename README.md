# ⚡ 凉笙工作流 (Liangsheng Workflow) · v2.1 朋友版

<p align="center">
  <b>半自动项目工程协作流 · 岗位驱动与智能开发协同插件体系</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Plugin-Codex%20Agent-007ACC.svg?style=flat-square" alt="Plugin" />
  <img src="https://img.shields.io/badge/Architecture-Multi--Role%20Driven-8A2BE2.svg?style=flat-square" alt="Architecture" />
  <img src="https://img.shields.io/badge/Release-v2.1.0--friend-green.svg?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

---

## 📖 项目简介

**《凉笙工作流》** 是一套面向 AI 辅助工程研发的高效**半自动多角色协作流程规范与插件体系**。通过严格的状态机与依赖链路，将复杂软件工程交付拆解为可追踪、可复现、可恢复的标准化流水线：

`	ext
需求讨论 (P00) ──► 简要PRD裁定 ──► 岗位提示词派发 ──► 独立测试查收 ──► 交付归档与快照恢复
`

本仓库发布的是面向协作者的 **v2.1.0 朋友版候选包**，已彻底剥离个人私有凭证与内部维护档案，提供干净即用的工程协作模板。

---

## 📂 仓库结构导航

`	ext
├── .agents/plugins/marketplace.json   # 本地插件市场索引清单
├── plugins/liangsheng/                # 凉笙工作流核心技能与规则源码
├── 使用说明.md                         # 插件快速安装与启动指南
├── 功能介绍.md                         # 核心多角色协作流全景介绍
├── 版本验收说明.md                     # 质量门禁与跨平台环境要求
├── 测试说明.md                         # 待执行的真实工作流验收指南
└── releases/                          # v2.1.0 预编译发布包与 SHA-256 哈希
`

---

## 🚀 快速上手

1. 克隆或下载本仓库至本地；
2. 在 Codex 或对应 Agent 工具的本地插件市场中，添加根目录的 `.agents/plugins/marketplace.json`；
3. 点击安装 `liangsheng` 工作流插件；
4. 首次使用请阅读 [使用说明.md](使用说明.md)，并在测试项目中参照 [测试说明.md](测试说明.md) 进行独立验证。

---

## 📜 许可证

本项目采用 [MIT License](LICENSE) 开源协议。