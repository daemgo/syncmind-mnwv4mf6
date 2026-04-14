> **版本**：1.0.0 | **状态**：draft | **更新时间**：2026-04-14
>
> **来源方案**：normal 场景 v1.0.0 版本

---

#### 约定说明

本文档使用以下标准值：
- **布局类型**: `list` / `detail` / `form` / `dashboard` / `steps` / `custom`
- **区块类型**: `table` / `form` / `card` / `cards` / `chart` / `tabs` / `steps` / `timeline` / `description` / `statistic` / `custom`
- **字段类型**: `text` / `textarea` / `number` / `money` / `date` / `select` / `multiselect` / `switch` / `upload` 等（完整列表见下游约定）

---

## 一、产品概述

### 1.1 项目背景

温州市国彩真空科技有限公司（国彩真空）成立于2017年，位于瑞安塘下镇，主营PVD真空镀膜加工，服务五金、3C、汽摩配、眼镜、卫浴等多个行业，已进入宜家、苏泊尔、吉利等品牌供应商名单。公司约18人、4000平方米厂房，当前依赖Excel和微信管理生产，无系统支撑。项目目标为构建轻量级ERP系统，覆盖生产调度、质量追溯、设备运维与成本管控四大核心模块，预计周期3-4个月，预算控制在10-20万元以内。

### 1.2 产品目标

- 提升交期准确率，减少因人工排产和插单协调导致的交期延误
- 实现膜厚0.1微米精度的批次级质量追溯，满足宜家等国际客户供应商审核要求
- 提升设备OEE，减少真空镀膜设备突发故障造成的非计划停机
- 降低管理成本，5分钟内完成任意批次的完整追溯
- 支撑精准报价，通过批次级成本核算实现利润可控

### 1.3 目标用户

| 角色 | 描述 | 核心诉求 |
|------|------|---------|
| 生产主管 | 负责生产调度和交期协调 | 快速排产、插单重排、交期预警 |
| 车间工人 | 执行扫码报工 | 操作简便，扫码即用，不增加负担 |
| 质检员 | 负责膜厚检验和数据记录 | 减少人工记录，SPC自动预警，报告快速导出 |
| 设备工程师 | 负责真空镀膜设备运维 | 设备运行透明，OEE可视化，预测性维护提醒 |
| 财务/管理者 | 负责成本核算和利润分析 | 批次级成本透明，利润报表支撑报价决策 |
| 大客户（宜家、苏泊尔等） | 通过客户门户查看订单进度和下载质量数据报告 | 在线查看进度，减少人工催单，满足数字化对接需求 |

### 1.4 范围定义

**本期包含**

- 生产调度与APS排产：针对来料加工订单的智能排产、甘特图可视化、插单重排
- 条码批次追溯：批次绑定原料、工艺参数、检验数据，支持扫码追溯
- 生产报工与进度跟踪：车间扫码报工，实时更新订单生产进度，交付预警
- SPC质量控制：膜厚控制图（均值图、控制图），异常自动预警，检验报告导出
- 设备OEE管理：设备运行数据采集（通过网关+OPC UA/Modbus），OEE自动计算，点检记录
- 客户门户：客户在线查看订单进度、下载检验报告
- 批次成本核算：批次级工时、材料、能源成本归集，利润报表
- 基础数据配置：设备台账、工艺路线、客户、物料等基础数据管理

**本期不含**

- MRP物料需求计划（来料加工模式，材料由客户提供，无需采购管理）
- 供应链管理/供应商管理（客户来料，供应链复杂度低）
- 财务总账/应收应付（仅做批次成本归集和利润分析，不含财务凭证）
- 多工厂/多车间管理（单工厂，18人扁平化团队）
- 高级APS（多目标优化、排程模拟，仅含基于约束的基础排产）
- 移动端原生App（通过移动端H5覆盖，无iOS/Android原生开发）
- 与ERP/SAP等大型系统对接（小型私有化部署，无此需求）

---

## 二、信息架构

### 2.1 站点地图

```
生产管理 (Package)
├── 订单管理 (/production/orders) — Package
├── 排产计划 (/production/scheduling) — Package
├── 报工管理 (/production/reports) — Package
└── 生产看板 (/production/progress) — Dashboard

质量管理 (ShieldCheck)
├── 批次追溯 (/quality/batches) — Package
├── 质检记录 (/quality/inspection) — Package
├── SPC控制图 (/quality/spc) — Package
└── 报告导出 (/quality/reports) — Package

设备管理 (Cog)
├── 设备台账 (/equipment/assets) — Package
├── 点检记录 (/equipment/inspection) — Package
└── OEE分析 (/equipment/oee) — Package

成本管理 (Coins)
├── 批次成本 (/cost/batches) — Package
└── 利润分析 (/cost/profit) — Package

客户门户 (Building2)
├── 订单进度 (/portal/progress) — Dashboard
└── 报告下载 (/portal/reports) — Package

系统管理 (Settings)
└── 基础配置 (/system/settings) — Package
```

### 2.2 导航结构

| 一级菜单 | 二级菜单 | 路由 | 说明 |
|---------|---------|------|------|
| 生产管理 | 订单管理 | /production/orders | 客户订单列表和管理 |
| 生产管理 | 排产计划 | /production/scheduling | APS甘特图排产 |
| 生产管理 | 报工管理 | /production/reports | 车间扫码报工记录 |
| 生产管理 | 生产看板 | /production/progress | 整体生产进度仪表盘 |
| 质量管理 | 批次追溯 | /quality/batches | 条码批次追溯查询 |
| 质量管理 | 质检记录 | /quality/inspection | 膜厚检验数据记录 |
| 质量管理 | SPC控制图 | /quality/spc | 膜厚统计过程控制图 |
| 质量管理 | 报告导出 | /quality/reports | 检验报告导出 |
| 设备管理 | 设备台账 | /equipment/assets | 真空镀膜设备基础信息 |
| 设备管理 | 点检记录 | /equipment/inspection | 设备日常点检 |
| 设备管理 | OEE分析 | /equipment/oee | 设备综合效率分析 |
| 成本管理 | 批次成本 | /cost/batches | 批次级成本明细 |
| 成本管理 | 利润分析 | /cost/profit | 利润分析报表 |
| 客户门户 | 订单进度 | /portal/progress | 客户视角订单进度（外网访问） |
| 客户门户 | 报告下载 | /portal/reports | 客户下载检验报告 |
| 系统管理 | 基础配置 | /system/settings | 基础数据字典配置 |

---

## 三、功能模块

### 3.1 生产管理

> 生产管理模块解决来料加工订单批次多、规格杂、人工排产效率低的问题。通过APS智能排产和车间报工，实现交期承诺和进度透明化。

#### 3.1.1 订单管理

**路由**：`/production/orders`
**布局**：`list`
**描述**：管理客户订单，按物料、颜色、膜厚规格分类，支持插单重排

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 订单编号 | orderNo | text | 是 | 系统自动生成 |
| 客户名称 | customerName | text | 是 | 来自客户基础数据 |
| 订单类型 | orderType | tag | 否 | dict-order-type |
| 物料名称 | materialName | text | 是 | 待镀膜物料描述 |
| 颜色 | color | tag | 否 | 镀膜颜色 |
| 膜厚规格 | thicknessSpec | text | 否 | 目标膜厚（微米） |
| 数量 | quantity | number | 是 | 订单数量 |
| 单位 | unit | text | 否 | 件/个/套 |
| 交期 | dueDate | date | 是 | 承诺交期 |
| 订单状态 | orderStatus | status | 否 | dict-order-status |
| 优先级 | priority | tag | 否 | dict-priority |
| 创建时间 | createdAt | datetime | 是 | 系统自动记录 |
| 操作 | — | action | 否 | 查看/编辑/删除 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增订单 | primary | toolbar-right | navigate → /production/orders/new |
| 批量导入 | default | toolbar-left | modal（Excel导入模板） |
| 导出 | default | toolbar-left | download（当前筛选结果） |
| 查看 | default | row | navigate → /production/orders/:id |
| 编辑 | default | row | navigate → /production/orders/:id/edit |
| 删除 | danger | row-more | modal（二次确认） |

##### 业务规则

- 订单编号格式：`ORD-{YYYYMMDD}-{序号}`，序号每日从1重置
- 删除仅允许"已取消"状态的订单
- 编辑时若订单已处于"生产中"，仅允许修改备注字段
- 颜色字段来源于基础数据字典 dict-color

---

**路由**：`/production/orders/new`、`/production/orders/:id/edit`
**布局**：`form`
**描述**：新增或编辑订单

##### 基本信息（form）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 客户 | customerId | select | 是 | 关联客户基础数据 |
| 订单类型 | orderType | select | 是 | dict-order-type |
| 物料名称 | materialName | text | 是 | 待镀膜物料名称 |
| 颜色 | color | select | 是 | dict-color |
| 膜厚规格 | thicknessSpec | number | 是 | 单位：微米，精度0.1 |
| 数量 | quantity | number | 是 | 正整数 |
| 单位 | unit | text | 是 | 默认"件" |
| 交期 | dueDate | date | 是 | 不得早于当前日期+3天 |
| 优先级 | priority | select | 是 | dict-priority |
| 工艺要求 | techRequirement | textarea | 否 | 特殊工艺要求说明 |
| 备注 | remark | textarea | 否 | 内部备注 |

##### 业务规则

- 保存后订单状态自动置为"待排产"
- 膜厚规格精度要求0.1微米，输入框需限制小数位

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 保存 | primary | form-footer | action（保存后跳转列表） |
| 保存并排产 | default | form-footer | action（保存后跳转排产页面） |
| 取消 | default | form-footer | navigate（返回列表） |

---

**路由**：`/production/orders/:id`
**布局**：`detail`
**描述**：订单详情，含批次信息和报工进度

##### 基本信息（description）

- 订单编号、客户名称、订单类型、物料、颜色、膜厚规格、数量、单位、交期、订单状态、优先级、工艺要求、备注

##### 批次列表（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 批次编号 | batchNo | text | 是 | 系统自动生成 |
| 批次状态 | batchStatus | status | 否 | dict-batch-status |
| 数量 | quantity | number | 是 | 本批次数量 |
| 开工时间 | startTime | datetime | 是 | 实际开工时间 |
| 完工时间 | endTime | datetime | 是 | 实际完工时间 |
| 良品数 | qualifiedQty | number | 是 | 合格品数量 |
| 不良数 | defectiveQty | number | 是 | 不良品数量 |
| 操作 | — | action | 否 | 查看批次追溯 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 重新排产 | default | card-footer | navigate → /production/scheduling（带入订单参数） |
| 新增批次 | default | card-footer | modal（快速创建批次） |
| 取消订单 | danger | card-footer | modal（二次确认，仅"待排产"状态可操作） |
| 查看批次追溯 | default | row | navigate → /quality/batches/:batchId |

##### 业务规则

- 订单进度 = 已完工批次良品数之和 / 订单总数量
- 当订单进度达100%且所有批次完工时，订单状态自动变为"已完成"

---

#### 3.1.2 排产计划

**路由**：`/production/scheduling`
**布局**：`custom`
**描述**：APS甘特图排产，按设备产能、工艺路径、交期约束自动排产，支持插单重排

##### 排产甘特图（custom）

- X轴：时间线（按班次/日视图切换）
- Y轴：设备/产线
- 甘特条：显示批次编号、订单编号、颜色、预计时长
- 颜色编码：按订单优先级区分
- 拖拽支持：手动调整批次在时间轴上的位置
- 插单高亮：新增订单后，相关时间轴段高亮提示冲突

##### 排产控制（card）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 视图模式 | viewMode | select | 是 | 日视图/班次视图 |
| 设备筛选 | equipmentId | multiselect | 否 | 多选设备筛选 |
| 显示范围 | dateRange | daterange | 是 | 默认显示当前周 |
| 排产策略 | strategy | select | 否 | 交期优先/产能优先（默认交期优先） |

##### 待排订单列表（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 订单编号 | orderNo | text | 是 | 关联订单 |
| 客户 | customerName | text | 是 | |
| 物料 | materialName | text | 否 | |
| 颜色 | color | tag | 否 | |
| 膜厚 | thicknessSpec | number | 是 | |
| 数量 | quantity | number | 是 | |
| 交期 | dueDate | date | 是 | 红字提示超期 |
| 优先级 | priority | tag | 否 | |
| 操作 | — | action | 否 | 选中排产/批量排产 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 自动排产 | primary | card-header | action（按策略自动分配时间轴） |
| 一键重排 | warning | card-header | action（重新计算全部排产，甘特图刷新） |
| 保存排产 | primary | card-footer | action（确认排产结果，生成批次） |
| 导出甘特图 | default | card-header | download（PNG/PDF格式） |

##### 业务规则

- 自动排产按交期紧迫度排序，结合设备产能和工艺路径分配
- 插单时自动检测冲突，高亮显示冲突时间段，支持手动或自动解决
- 排产保存后自动生成对应批次，订单状态由"待排产"变为"已排产"
- 设备运行时间假设：每日2班，每班8小时（可配置）
- 排产计算考虑工艺路径中的准备时间和工序间隔

---

#### 3.1.3 报工管理

**路由**：`/production/reports`
**布局**：`list`
**描述**：车间扫码报工，记录批次生产进度，支持PDA/扫码枪操作

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 报工单号 | reportNo | text | 是 | 系统自动生成 |
| 批次编号 | batchNo | link | 是 | 关联批次，可点击跳转追溯 |
| 订单编号 | orderNo | text | 是 | 关联订单 |
| 设备 | equipmentName | text | 是 | 报工对应的设备 |
| 工序 | processName | tag | 否 | 当前报工工序 |
| 开工时间 | startTime | datetime | 是 | 扫码开工时间 |
| 完工时间 | endTime | datetime | 否 | 扫码完工时间 |
| 良品数 | qualifiedQty | number | 是 | 本次报工良品数 |
| 不良数 | defectiveQty | number | 是 | 本次报工不良数 |
| 报工人员 | operatorName | text | 是 | 扫码人员 |
| 状态 | reportStatus | status | 否 | dict-report-status |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 扫码报工 | primary | toolbar-right | modal（扫码入口，输入框支持扫码枪） |
| 扫码完工 | default | toolbar-right | modal（扫码完工入口） |
| 查看详情 | default | row | drawer（报工详情） |
| 导出 | default | toolbar-left | download |

##### 业务规则

- 扫码报工流程：扫描批次条码 → 输入良品数/不良数 → 确认完工
- 完工报工后批次状态自动推进至下一工序或"待检验"
- 不良数超过批次数量5%时弹出预警提示，确认后仍可提交
- 报工数据实时同步到订单生产进度看板

---

**路由**：`/production/reports/scan`
**布局**：`form`
**描述**：扫码报工页面，适配PDA/手机端操作

##### 扫码报工表单（form）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 批次条码 | batchBarcode | text | 是 | 扫码输入，自动识别批次 |
| 设备 | equipmentId | select | 是 | 当前使用设备 |
| 工序 | processName | select | 是 | dict-process-name |
| 良品数 | qualifiedQty | number | 是 | 整数≥0 |
| 不良数 | defectiveQty | number | 是 | 整数≥0，默认0 |
| 开工备注 | startRemark | textarea | 否 | 异常情况备注 |
| 完工时间 | endTime | datetime | 否 | 默认为当前时间，可手动调整 |

##### 业务规则

- 扫码后自动回填批次信息，只读显示
- 不良品需选择不良类型 dict-defect-type
- 提交后显示成功提示，自动清空表单等待下一批次扫码

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 提交报工 | primary | form-footer | action（提交成功后保持页面等待下次扫码） |
| 返回 | default | form-footer | navigate → /production/reports |

---

#### 3.1.4 生产看板

**路由**：`/production/progress`
**布局**：`dashboard`
**描述**：整体生产进度仪表盘，实时展示订单、批次、交付预警等关键指标

##### 统计卡片（statistic）

| 指标 | fieldKey | 说明 |
|------|----------|------|
| 今日报工批次 | todayReportCount | 今日已完成报工的批次数量 |
| 生产中订单 | inProgressOrderCount | 状态为"生产中"的订单数量 |
| 待排产订单 | pendingOrderCount | 状态为"待排产"的订单数量 |
| 今日交付 | todayDeliveryCount | 今日应交付订单数量 |

##### 生产进度概览（chart）

- 折线图：近7日每日报工批次数量趋势
- 饼图：当前订单各状态分布（待排产/已排产/生产中/已完成/已取消）

##### 交付预警（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 订单编号 | orderNo | link | 是 | 点击跳转订单详情 |
| 客户 | customerName | text | 是 | |
| 交期 | dueDate | date | 是 | 红字预警超期 |
| 剩余天数 | remainingDays | number | 是 | 倒计时，≤3天高亮 |
| 当前进度 | progress | progress | 是 | 百分比 |
| 负责人 | assignee | text | 否 | |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 刷新 | default | card-header | action（刷新看板数据） |
| 全部订单 | default | card-header | navigate → /production/orders |

##### 业务规则

- 看板数据每30秒自动刷新一次（WebSocket推送优先）
- 交付预警：距离交期≤3天的订单触发红色预警
- 进度百分比 = 已完工批次良品数之和 / 订单总数量

---

### 3.2 质量管理

> 质量管理模块解决膜厚0.1微米精度管控困难、缺乏SPC统计过程控制、批次追溯依赖人工的问题。通过条码批次追溯和SPC控制图，提升良品率至目标3-5个百分点，满足宜家等国际客户的供应商审核要求。

#### 3.2.1 批次追溯

**路由**：`/quality/batches`
**布局**：`list`
**描述**：批次追溯查询，通过条码关联原料、工艺参数、检验数据、出货信息，支持扫码快速定位

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 批次编号 | batchNo | text | 是 | 系统自动生成，格式 BATCH-{YYYYMMDD}-{序号} |
| 批次条码 | batchBarcode | text | 是 | 支持扫码搜索 |
| 订单编号 | orderNo | link | 是 | 关联订单，点击跳转 |
| 客户 | customerName | text | 是 | |
| 物料 | materialName | text | 否 | |
| 颜色 | color | tag | 否 | |
| 膜厚规格 | thicknessSpec | number | 是 | 目标膜厚（微米） |
| 实际膜厚 | actualThickness | number | 是 | 检验测量值 |
| 良品率 | qualifyRate | percent | 是 | 良品数/总数 |
| 设备 | equipmentName | text | 是 | 生产设备 |
| 开工时间 | startTime | datetime | 是 | |
| 完工时间 | endTime | datetime | 是 | |
| 批次状态 | batchStatus | status | 否 | dict-batch-status |
| 操作 | — | action | 否 | 查看/追溯 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 扫码查询 | primary | toolbar-right | modal（扫码输入条码） |
| 高级搜索 | default | toolbar-right | form（展开更多筛选条件） |
| 导出追溯报告 | default | toolbar-left | download（当前批次追溯报告） |
| 查看详情 | default | row | navigate → /quality/batches/:id |
| 快速追溯 | default | row-more | drawer（批次完整链路） |

##### 业务规则

- 扫码查询：扫描批次条码 → 直接跳转该批次详情
- 5分钟内完成一次完整批次追溯（宜家审核要求）

---

**路由**：`/quality/batches/:id`
**布局**：`detail`
**描述**：批次完整链路追溯详情

##### 基本信息（description）

- 批次编号、批次条码、订单编号、客户、物料名称、颜色、膜厚规格、实际膜厚、数量、良品数、不良数、设备、操作员、开工时间、完工时间

##### 追溯链路（timeline）

追溯链路分以下环节，每环节展示时间、内容、操作人：

1. **来料接收** — 原料批次、供应商、来料时间、来料检验结果
2. **工艺参数** — 设备名称、工艺路线、各工序参数（真空度、温度、镀膜时间等）
3. **生产报工** — 开工时间、完工时间、良品数、不良数、报工人员
4. **质检记录** — 检验时间、膜厚测量值、检验员、检验结论
5. **出货信息** — 出货时间、收货客户、物流信息

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 导出追溯报告 | primary | card-footer | download（PDF格式，含完整链路） |
| 打印追溯标签 | default | card-footer | print（条码标签打印） |
| 返回 | default | card-footer | navigate（返回列表） |

---

#### 3.2.2 质检记录

**路由**：`/quality/inspection`
**布局**：`list`
**描述**：膜厚检验数据记录，每批次检验一条或多条测量值

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 检验单号 | inspectionNo | text | 是 | 系统自动生成 |
| 批次编号 | batchNo | link | 是 | 关联批次，点击跳转追溯 |
| 订单编号 | orderNo | text | 是 | |
| 设备 | equipmentName | text | 是 | |
| 膜厚规格 | thicknessSpec | number | 是 | 目标值（微米） |
| 测量值1 | measureValue1 | number | 是 | 第一个测量点（微米） |
| 测量值2 | measureValue2 | number | 是 | 第二个测量点（微米） |
| 测量值3 | measureValue3 | number | 是 | 第三个测量点（微米） |
| 平均值 | avgValue | number | 是 | 自动计算 |
| 偏差 | deviation | number | 是 | 平均值-规格值 |
| 检验结论 | conclusion | status | 否 | dict-inspection-conclusion |
| 检验时间 | inspectionTime | datetime | 是 | |
| 检验员 | inspectorName | text | 是 | |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增检验 | primary | toolbar-right | navigate → /quality/inspection/new |
| 导出 | default | toolbar-left | download（Excel格式） |
| 查看详情 | default | row | drawer（检验详情） |

##### 业务规则

- 测量值精度要求0.01微米，输入框需限制小数位
- 结论自动判断：所有测量值在规格±0.1微米范围内为"合格"，否则"不合格"
- 每批次至少录入3个测量点，多于3个可继续添加

---

**路由**：`/quality/inspection/new`、`/quality/inspection/:id/edit`
**布局**：`form`
**描述**：新增或编辑检验记录

##### 检验表单（form）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 批次 | batchId | select | 是 | 关联批次，选择后自动填充规格值 |
| 设备 | equipmentId | select | 是 | 关联设备 |
| 测量点1 | measureValue1 | number | 是 | 精度0.01微米 |
| 测量点2 | measureValue2 | number | 是 | 精度0.01微米 |
| 测量点3 | measureValue3 | number | 是 | 精度0.01微米 |
| 测量点4+ | extraMeasureValues | textarea | 否 | JSON数组格式，多于3个测量点 |
| 检验时间 | inspectionTime | datetime | 是 | 默认当前时间 |
| 检验员 | inspectorName | text | 是 | 当前登录用户 |
| 备注 | remark | textarea | 否 | 异常情况说明 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 保存 | primary | form-footer | action（保存后跳转列表） |
| 保存并继续 | default | form-footer | action（保存后清空表单继续录入） |
| 取消 | default | form-footer | navigate（返回列表） |

##### 业务规则

- 选择批次后自动回填膜厚规格、设备信息
- 保存后自动计算平均值和偏差，生成检验结论

---

#### 3.2.3 SPC控制图

**路由**：`/quality/spc`
**布局**：`custom`
**描述**：膜厚统计过程控制图，展示均值图和控制图，自动预警异常

##### 控制图（chart）

- **X均值图（X-bar Chart）**：批次均值随时间变化，叠加UCL（控制上限）、CL（中心线）、LCL（控制下限）
- **R图（Range Chart）**：批次极差随时间变化
- 控制限计算：基于最近20个批次数据，使用标准SPC公式（X-bar±A2·R̄）
- 异常标记：超出控制限的点标红，自动标注异常类型（超出控制限/连续7点上升等）

##### 筛选条件（card）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 设备 | equipmentId | select | 否 | 筛选特定设备数据 |
| 颜色 | color | select | 否 | 筛选特定颜色批次 |
| 日期范围 | dateRange | daterange | 是 | 默认近30天 |
| 规格上限 | usl | number | 否 | 手动设置规格上限（微米） |
| 规格下限 | lsl | number | 否 | 手动设置规格下限（微米） |

##### 统计概览（statistic）

| 指标 | fieldKey | 说明 |
|------|----------|------|
| 过程能力Cp | cp | 近30天Cp值 |
| 过程能力Cpk | cpk | 近30天Cpk值 |
| 超限点数 | outOfControlCount | 超出控制限的点数量 |
| 连续异常预警 | trendAlertCount | 连续7点上升/下降等趋势预警数量 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 刷新数据 | default | card-header | action（重新计算并刷新图表） |
| 导出SPC报告 | default | card-header | download（PDF格式含图表和数据） |
| 查看超限批次 | default | card-header | drawer（超限批次列表） |

##### 业务规则

- Cp/Cpk ≥ 1.33 为过程能力良好（绿色），1.0-1.33 为一般（黄色），<1.0 为不足（红色）
- 异常自动触发预警通知（系统消息），通知相关质检员和生产主管
- 规格上下限（USL/LSL）可手动设置，若未设置则仅显示控制限（UCL/LCL）

---

#### 3.2.4 报告导出

**路由**：`/quality/reports`
**布局**：`list`
**描述**：检验报告导出，按订单或批次批量生成符合大客户格式要求的质量数据报告

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 报告编号 | reportNo | text | 是 | 系统自动生成 |
| 报告类型 | reportType | tag | 否 | dict-report-type |
| 订单编号 | orderNo | link | 是 | 关联订单 |
| 客户 | customerName | text | 是 | 报告对应客户 |
| 批次范围 | batchRange | text | 否 | 如 BATCH-001 ~ BATCH-005 |
| 检验时间 | inspectionTimeRange | datetime | 是 | 报告覆盖的检验时间范围 |
| 生成时间 | createdAt | datetime | 是 | 报告生成时间 |
| 操作人 | creatorName | text | 是 | |
| 操作 | — | action | 否 | 下载/预览/删除 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 生成报告 | primary | toolbar-right | modal（选择订单/批次，生成报告） |
| 批量下载 | default | toolbar-left | download（ZIP格式） |
| 预览 | default | row | drawer（PDF预览） |
| 下载 | default | row | download（PDF文件） |
| 删除 | danger | row-more | modal（二次确认） |

##### 业务规则

- 报告模板支持按客户定制（宜家模板/苏泊尔模板等）
- 报告内容：包含批次汇总表、各批次检验数据、SPC统计、追溯链路摘要
- 删除仅允许未发送的报告

---

### 3.3 设备管理

> 设备管理模块解决真空镀膜设备运维依赖外部工程师、OEE不透明的问题。通过设备运行数据采集和OEE分析，实现设备运行可视化，支持预测性维护提醒，减少非计划停机。

#### 3.3.1 设备台账

**路由**：`/equipment/assets`
**布局**：`list`
**描述**：真空镀膜设备基础信息管理

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 设备编号 | equipmentNo | text | 是 | 系统自动生成 |
| 设备名称 | equipmentName | text | 是 | |
| 设备类型 | equipmentType | tag | 否 | dict-equipment-type |
| 型号 | model | text | 否 | |
| 厂商 | manufacturer | text | 否 | |
| 采购日期 | purchaseDate | date | 否 | |
| 当前状态 | equipmentStatus | status | 否 | dict-equipment-status |
| 最近点检 | lastInspectionDate | date | 是 | |
| 当前OEE | currentOee | number | 是 | 近7日平均值（%） |
| 操作 | — | action | 否 | 查看/编辑 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增设备 | primary | toolbar-right | navigate → /equipment/assets/new |
| 导出 | default | toolbar-left | download |
| 查看详情 | default | row | navigate → /equipment/assets/:id |
| 编辑 | default | row | navigate → /equipment/assets/:id/edit |

---

**路由**：`/equipment/assets/:id`
**布局**：`detail`
**描述**：设备详情，含运行参数配置和OEE历史

##### 基本信息（description）

- 设备编号、名称、类型、型号、厂商、采购日期、使用年限、当前状态、备注

##### 运行参数配置（form）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 标准节拍 | standardCycleTime | number | 是 | 单批次标准时间（分钟） |
| 计划工作时间 | plannedWorkingHours | number | 是 | 每日计划工作时间（小时） |
| 维护周期 | maintenanceInterval | number | 否 | 点检周期（天） |

##### OEE历史（chart）

- 折线图：近30天每日OEE值

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 编辑设备信息 | default | card-footer | navigate → /equipment/assets/:id/edit |
| 查看点检记录 | default | card-footer | navigate → /equipment/inspection（带入设备参数） |
| 查看OEE分析 | default | card-footer | navigate → /equipment/oee（带入设备参数） |

---

#### 3.3.2 点检记录

**路由**：`/equipment/inspection`
**布局**：`list`
**描述**：设备日常点检记录

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 点检单号 | inspectionNo | text | 是 | 系统自动生成 |
| 设备 | equipmentName | text | 是 | |
| 点检类型 | inspectionType | tag | 否 | dict-inspection-type |
| 点检时间 | inspectionTime | datetime | 是 | |
| 点检人 | inspectorName | text | 是 | |
| 点检结果 | inspectionResult | status | 否 | dict-inspection-result |
| 异常描述 | abnormalDesc | text | 否 | 有异常时显示 |
| 下次点检时间 | nextInspectionDate | date | 是 | 自动计算 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增点检 | primary | toolbar-right | navigate → /equipment/inspection/new |
| 导出 | default | toolbar-left | download |
| 查看详情 | default | row | drawer |

##### 业务规则

- 设备新增时自动按维护周期生成下次点检提醒
- 点检结果为"异常"时，自动生成维护工单通知设备负责人
- 异常描述必填，其他项按点检模板录入

---

**路由**：`/equipment/inspection/new`
**布局**：`form`
**描述**：新增点检记录

##### 点检表单（form）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 设备 | equipmentId | select | 是 | |
| 点检类型 | inspectionType | select | 是 | dict-inspection-type |
| 点检时间 | inspectionTime | datetime | 是 | 默认当前时间 |
| 点检项目 | inspectionItems | custom | 是 | 按设备型号加载点检模板，逐项填写结果 |
| 点检结果 | inspectionResult | select | 是 | dict-inspection-result |
| 异常描述 | abnormalDesc | textarea | 否 | inspectionResult为"异常"时必填 |
| 备注 | remark | textarea | 否 | |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 保存 | primary | form-footer | action |
| 取消 | default | form-footer | navigate |

---

#### 3.3.3 OEE分析

**路由**：`/equipment/oee`
**布局**：`dashboard`
**描述**：设备综合效率分析，展示OEE三要素（可用率、性能率、质量率）

##### 筛选条件（card）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 设备 | equipmentId | multiselect | 否 | 多选，默认全部 |
| 日期范围 | dateRange | daterange | 是 | 默认近30天 |

##### OEE概览（statistic）

| 指标 | fieldKey | 说明 |
|------|----------|------|
| 平均OEE | avgOee | 选定范围内所有设备OEE平均值（%） |
| 可用率 | avgAvailability | 平均可用率（%） |
| 性能率 | avgPerformance | 平均性能率（%） |
| 质量率 | avgQuality | 平均质量率（%） |

##### OEE趋势（chart）

- 折线图：各设备OEE趋势线，支持多设备对比

##### 设备OEE明细（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 设备 | equipmentName | text | 是 | |
| 平均OEE | avgOee | number | 是 | 百分比 |
| 可用率 | availability | number | 是 | |
| 性能率 | performance | number | 是 | |
| 质量率 | quality | number | 是 | |
| 状态 | equipmentStatus | status | 否 | |
| 操作 | — | action | 否 | 查看详情 |

##### OEE计算公式（description）

- OEE = 可用率 × 性能率 × 质量率
- 可用率 = (计划时间 - 停机时间) / 计划时间
- 性能率 = (实际产量 × 标准节拍) / 运行时间
- 质量率 = 良品数 / 实际产量

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 刷新 | default | card-header | action |
| 导出OEE报告 | default | card-header | download |

##### 业务规则

- OEE数据来源：设备网关实时采集运行数据（开关机状态、产量计数），结合报工数据计算
- 若设备无网关数据，支持手动录入停机时间和产量
- OEE目标值可配置，默认目标70%

---

### 3.4 成本管理

> 成本管理模块解决多品种小批量模式下成本不透明、报价缺乏数据支撑的问题。通过批次级工时、材料、能源成本归集，支撑精准报价和利润分析。

#### 3.4.1 批次成本

**路由**：`/cost/batches`
**布局**：`list`
**描述**：批次级成本明细查询

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 批次编号 | batchNo | link | 是 | 点击跳转批次追溯 |
| 订单编号 | orderNo | text | 是 | |
| 客户 | customerName | text | 是 | |
| 物料 | materialName | text | 否 | |
| 完工时间 | endTime | datetime | 是 | |
| 材料成本 | materialCost | money | 是 | 批次材料消耗金额 |
| 人工成本 | laborCost | money | 是 | 工时 × 人工单价 |
| 能源成本 | energyCost | money | 是 | 设备运行时间 × 能源单价 |
| 其他成本 | otherCost | money | 否 | 分摊的其他成本 |
| 总成本 | totalCost | money | 是 | 前四项之和 |
| 单位成本 | unitCost | money | 是 | 总成本 / 良品数量 |
| 操作 | — | action | 否 | 查看详情 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 刷新成本 | primary | toolbar-right | action（重新计算选中批次的成本） |
| 批量刷新 | default | toolbar-left | action（批量刷新成本数据） |
| 导出成本报表 | default | toolbar-left | download |
| 查看详情 | default | row | drawer（成本构成明细） |

##### 业务规则

- 成本自动归集：完工批次自动触发成本计算，关联报工工时、设备运行时间、材料消耗数据
- 工时来源：报工记录中的开工-完工时间差
- 能源成本：按设备功率（kW）× 运行时间（小时）× 电价计算
- 材料成本：来料批次消耗量 × 材料单价（待确认数据来源）
- 若成本数据未就绪，显示"待计算"，不显示金额

---

##### 成本明细抽屉（drawer）

展示单个批次的完整成本构成：

| 成本项 | fieldKey | 类型 | 说明 |
|--------|----------|------|------|
| 材料消耗 | materialConsumption | table | 原料批次、消耗量、单价、金额 |
| 工时明细 | laborDetail | table | 工序名称、工时（小时）、人工单价、金额 |
| 能源消耗 | energyConsumption | table | 设备名称、运行时间（小时）、功率（kW）、电价、金额 |
| 成本汇总 | costSummary | description | 各成本项合计及总成本 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 导出成本单 | default | drawer-footer | download（PDF格式批次成本单） |
| 调整成本 | default | drawer-footer | modal（手动调整成本项，需填写调整原因） |

##### 业务规则

- 手动调整成本需记录调整人和调整原因
- 成本调整后自动重新计算单位成本和利润

---

#### 3.4.2 利润分析

**路由**：`/cost/profit`
**布局**：`dashboard`
**描述**：订单利润分析，支撑精准报价决策

##### 筛选条件（card）

| 字段 | fieldKey | 类型 | 必填 | 说明 |
|------|----------|------|------|------|
| 日期范围 | dateRange | daterange | 是 | 默认本月 |
| 客户 | customerId | select | 否 | |
| 订单状态 | orderStatus | multiselect | 否 | |

##### 利润概览（statistic）

| 指标 | fieldKey | 说明 |
|------|----------|------|
| 本期总收入 | totalRevenue | 已结算订单总收入 |
| 本期总成本 | totalCost | 已结算订单总成本 |
| 本期总利润 | totalProfit | 总收入 - 总成本 |
| 平均利润率 | avgProfitRate | 总利润 / 总收入（%） |

##### 利润趋势（chart）

- 柱状图：近6个月每月利润金额
- 折线图：每月利润率趋势

##### 订单利润明细（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 订单编号 | orderNo | link | 是 | 点击跳转订单详情 |
| 客户 | customerName | text | 是 | |
| 完工日期 | completedDate | date | 是 | 订单完成时间 |
| 订单金额 | orderAmount | money | 是 | 客户结算金额 |
| 总成本 | totalCost | money | 是 | |
| 利润 | profit | money | 是 | 正数绿色，负数红色 |
| 利润率 | profitRate | percent | 是 | |
| 操作 | — | action | 否 | 查看批次成本 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 刷新 | default | card-header | action |
| 导出利润报表 | default | card-header | download |
| 查看批次成本 | default | row | drawer |

##### 业务规则

- 利润率 = (订单金额 - 总成本) / 订单金额 × 100%
- 利润率<0时红色预警，<10%时黄色预警
- 订单金额需手动录入（来自销售合同），待确认录入入口

---

### 3.5 客户门户

> 客户门户为宜家、苏泊尔等大客户提供外网访问入口，实现在线查看订单进度和下载检验报告，减少人工催单和邮件往来。

#### 3.5.1 订单进度

**路由**：`/portal/progress`
**布局**：`dashboard`
**描述**：客户视角查看自有订单的生产进度（外网访问，无需登录公司内网）

##### 进度概览（card）

| 指标 | fieldKey | 说明 |
|------|----------|------|
| 总订单数 | totalOrderCount | 客户所有订单数量 |
| 生产中 | inProductionCount | 当前生产中的订单数 |
| 已完成 | completedCount | 已完成的订单数 |
| 待交付 | pendingDeliveryCount | 完工待交付订单数 |

##### 订单进度列表（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 订单编号 | orderNo | text | 是 | |
| 物料 | materialName | text | 是 | |
| 颜色 | color | tag | 否 | |
| 交期 | dueDate | date | 是 | |
| 当前状态 | orderStatus | status | 否 | dict-order-status |
| 进度 | progress | progress | 是 | 百分比 |
| 预计完成 | estimatedCompleteDate | date | 否 | 系统预估完工日期 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 刷新 | default | card-header | action |
| 查看详情 | default | row | drawer（批次进度详情） |

##### 业务规则

- 客户门户数据按客户账号隔离，客户只能看到自有订单
- 进度实时更新，显示最新生产状态
- 外网访问，需单独登录（独立于内部系统）

---

#### 3.5.2 报告下载

**路由**：`/portal/reports`
**布局**：`list`
**描述**：客户下载检验报告和质量数据

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 报告编号 | reportNo | text | 是 | |
| 报告类型 | reportType | tag | 否 | dict-report-type |
| 订单编号 | orderNo | text | 是 | |
| 批次范围 | batchRange | text | 否 | |
| 生成时间 | createdAt | datetime | 是 | |
| 报告状态 | reportStatus | status | 否 | dict-report-status |
| 操作 | — | action | 否 | 下载/预览 |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 下载 | primary | row | download（PDF文件） |
| 预览 | default | row | drawer（PDF预览） |

##### 业务规则

- 报告仅显示与当前客户相关的批次
- 报告状态为"已发布"时方可下载

---

### 3.6 系统管理

> 系统管理提供基础数据配置，包括设备台账初始化、工艺路线、客户基础数据、物料字典、颜色字典等。

#### 3.6.1 基础配置

**路由**：`/system/settings`
**布局**：`tabs`
**描述**：基础数据字典和配置管理

##### 标签页（tabs）

按数据类型分标签页：

1. **客户管理** — 客户基础数据
2. **物料管理** — 待镀膜物料字典
3. **工艺路线** — PVD工艺路线配置
4. **字典配置** — 颜色、优先级、订单类型等枚举值

---

**客户管理** — `/system/settings/customers`

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 客户编号 | customerNo | text | 是 | |
| 客户名称 | customerName | text | 是 | |
| 客户类型 | customerType | tag | 否 | dict-customer-type |
| 联系人 | contactName | text | 否 | |
| 联系电话 | contactPhone | phone | 否 | |
| 地址 | address | text | 否 | |
| 备注 | remark | text | 否 | |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增客户 | primary | toolbar-right | modal（新增表单） |
| 编辑 | default | row | modal（编辑表单） |
| 删除 | danger | row-more | modal（仅无关联订单的客户可删除） |

---

**物料管理** — `/system/settings/materials`

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 物料编码 | materialNo | text | 是 | |
| 物料名称 | materialName | text | 是 | |
| 物料类型 | materialType | tag | 否 | |
| 规格 | spec | text | 否 | |
| 备注 | remark | text | 否 | |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增物料 | primary | toolbar-right | modal |
| 编辑 | default | row | modal |
| 删除 | danger | row-more | modal |

---

**工艺路线** — `/system/settings/process-routes`

##### 数据表格（table）

| 列名 | fieldKey | 列类型 | 可排序 | 说明 |
|------|----------|--------|--------|------|
| 路线编号 | routeNo | text | 是 | |
| 路线名称 | routeName | text | 是 | 如"磁控溅射-标准工艺" |
| 工序数 | processCount | number | 是 | |
| 颜色 | color | multiselect | 否 | 适用的颜色 |
| 膜厚范围 | thicknessRange | text | 否 | 如"0.1-5微米" |
| 备注 | remark | text | 否 | |

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 新增路线 | primary | toolbar-right | navigate（工艺路线编辑页） |
| 编辑 | default | row | navigate |
| 删除 | danger | row-more | modal |

---

**字典配置** — `/system/settings/dicts`

展示所有枚举字典（颜色、优先级、订单类型、设备类型等），每个字典可展开查看和编辑枚举值。

##### 字典列表（cards）

每个字典卡片展示：字典ID、字典名称、枚举值数量

##### 操作

| 按钮 | 类型 | 位置 | 行为 |
|------|------|------|------|
| 编辑 | default | card-footer | modal（编辑枚举值列表） |

---

## 四、全局规则

### 4.1 角色权限

| 角色 | 描述 | 模块权限 |
|------|------|---------|
| 生产主管 | 生产调度和交期协调 | 生产管理（增删改查）、设备查看、成本查看 |
| 车间工人 | 执行报工操作 | 生产管理（报工：新增查看） |
| 质检员 | 质量检验和数据记录 | 质量管理（增删改查） |
| 设备工程师 | 设备运维管理 | 设备管理（增删改查）、点检管理 |
| 财务/管理者 | 成本核算和利润分析 | 成本管理（查看）、利润分析（查看） |
| 大客户用户 | 通过门户查看订单和报告 | 客户门户（查看自有数据） |
| 系统管理员 | 系统配置和基础数据管理 | 系统管理（增删改查） |

### 4.2 数据字典

#### dict-order-status（订单状态）

| 值 | 显示 | 颜色 |
|----|------|------|
| pending | 待排产 | default |
| scheduled | 已排产 | blue |
| in-production | 生产中 | processing |
| completed | 已完成 | success |
| cancelled | 已取消 | default |
| delivered | 已交付 | success |

#### dict-batch-status（批次状态）

| 值 | 显示 | 颜色 |
|----|------|------|
| pending | 待排产 | default |
| scheduled | 已排产 | blue |
| in-production | 生产中 | processing |
| completed | 已完工 | success |
| rejected | 不合格 | danger |
| delivered | 已出货 | success |

#### dict-report-status（报工状态）

| 值 | 显示 | 颜色 |
|----|------|------|
| in-progress | 开工未完工 | processing |
| completed | 已完工 | success |

#### dict-inspection-conclusion（检验结论）

| 值 | 显示 | 颜色 |
|----|------|------|
| qualified | 合格 | success |
| unqualified | 不合格 | danger |

#### dict-equipment-status（设备状态）

| 值 | 显示 | 颜色 |
|----|------|------|
| running | 运行中 | success |
| idle | 空闲 | default |
| maintenance | 维护中 | warning |
| fault | 故障 | danger |
| offline | 离线 | default |

#### dict-inspection-result（点检结果）

| 值 | 显示 | 颜色 |
|----|------|------|
| normal | 正常 | success |
| abnormal | 异常 | danger |

#### dict-order-type（订单类型）

| 值 | 显示 |
|----|------|
| standard | 标准订单 |
| urgent | 加急订单 |

#### dict-priority（优先级）

| 值 | 显示 | 颜色 |
|----|------|------|
| normal | 普通 | default |
| high | 高 | warning |
| urgent | 紧急 | danger |

#### dict-color（颜色）

| 值 | 显示 |
|----|------|
| gold | 金色 |
| silver | 银色 |
| black | 黑色 |
| rose-gold | 玫瑰金 |
| blue | 蓝色 |
| custom | 自定义 |

#### dict-equipment-type（设备类型）

| 值 | 显示 |
|----|------|
| magnetron | 磁控溅射镀膜机 |
| arc-ion | 多弧离子镀膜机 |
| auxiliary | 辅助设备 |

#### dict-report-type（报告类型）

| 值 | 显示 |
|----|------|
| inspection | 检验报告 |
| traceability | 追溯报告 |
| spc | SPC统计报告 |

#### dict-inspection-type（点检类型）

| 值 | 显示 |
|----|------|
| daily | 日常点检 |
| weekly | 周点检 |
| monthly | 月度点检 |

#### dict-customer-type（客户类型）

| 值 | 显示 |
|----|------|
| brand | 品牌客户 |
| distributor | 经销商 |
| other | 其他 |

#### dict-report-status（报告状态，门户用）

| 值 | 显示 | 颜色 |
|----|------|------|
| draft | 草稿 | default |
| published | 已发布 | success |

### 4.3 状态流转

#### 订单状态流转

| 当前状态 | 操作 | 目标状态 | 条件 |
|---------|------|---------|------|
| —（新建） | 保存 | 待排产 | 新建订单 |
| 待排产 | 排产保存 | 已排产 | APS排产完成 |
| 已排产 | 首个批次开工 | 生产中 | 有批次进入生产 |
| 生产中 | 全部批次完工 | 已完成 | 所有批次完工且良品数达标 |
| 生产中 | 取消 | 已取消 | 手动取消（需填写原因） |
| 已完成 | 确认交付 | 已交付 | 客户确认收货 |
| 已排产/待排产 | 取消 | 已取消 | 手动取消 |

#### 批次状态流转

| 当前状态 | 操作 | 目标状态 | 条件 |
|---------|------|---------|------|
| —（新建） | 排产生成 | 已排产 | APS排产保存 |
| 已排产 | 扫码开工 | 生产中 | 报工管理中开工 |
| 生产中 | 扫码完工 | 已完工 | 报工管理中完工 |
| 已完工 | 质检合格 | 已出货 | 检验结论为合格 |
| 已完工 | 质检不合格 | 不合格 | 检验结论为不合格 |
| 不合格 | 返工 | 生产中 | 重新生产 |
| 不合格 | 报废 | 不合格 | 确认报废 |

---

## 附录

### A. 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0.0 | 2026-04-14 | 初始版本，基于normal场景v1.0.0方案生成 |
