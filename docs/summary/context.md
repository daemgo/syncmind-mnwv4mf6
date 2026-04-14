# 对话摘要

---
### 2026-04-14
**Skills**: init-app
**变更**: 生成完整前端 Demo

- 系统类型：PVD真空镀膜ERP（国彩真空）
- 模块：生产看板（Dashboard）、订单管理（list+detail）、批次追溯（list+detail）、OEE分析
- 数据来源：docs/spec/spec.md

**已生成页面**：
- `src/routes/index.tsx` — 生产看板（首页，含统计卡片、趋势图、订单状态分布、交付预警、设备OEE概览）
- `src/routes/production/orders/` — 订单管理列表页 + 详情页（含批次列表Tab）
- `src/routes/quality/batches/` — 批次追溯列表页 + 详情页（含追溯链路时间线）
- `src/routes/equipment/oee/` — OEE分析仪表盘（含OEE趋势折线图、设备OEE明细表）

**已生成完整页面（新增）**：
- `src/routes/equipment/assets/` — 设备台账列表页 + 详情页（含近30天OEE趋势折线图）

**其他页面**：
- 其余模块（排产计划、报工管理、质检记录、SPC控制图、报告导出、点检记录、批次成本、利润分析、客户门户、基础配置）已生成占位页，可通过继续对话增量生成

**待跟进**: 通过对话继续生成其他模块
