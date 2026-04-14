export interface DictItem {
  label: string
  value: string
  color?: string
}

export const dictionaries: Record<string, DictItem[]> = {
  "dict-order-status": [
    { label: "待排产", value: "pending", color: "gray" },
    { label: "已排产", value: "scheduled", color: "blue" },
    { label: "生产中", value: "in-production", color: "yellow" },
    { label: "已完成", value: "completed", color: "green" },
    { label: "已取消", value: "cancelled", color: "gray" },
    { label: "已交付", value: "delivered", color: "green" },
  ],
  "dict-batch-status": [
    { label: "待排产", value: "pending", color: "gray" },
    { label: "已排产", value: "scheduled", color: "blue" },
    { label: "生产中", value: "in-production", color: "yellow" },
    { label: "已完工", value: "completed", color: "green" },
    { label: "不合格", value: "rejected", color: "red" },
    { label: "已出货", value: "delivered", color: "green" },
  ],
  "dict-report-status": [
    { label: "开工未完工", value: "in-progress", color: "yellow" },
    { label: "已完工", value: "completed", color: "green" },
  ],
  "dict-inspection-conclusion": [
    { label: "合格", value: "qualified", color: "green" },
    { label: "不合格", value: "unqualified", color: "red" },
  ],
  "dict-equipment-status": [
    { label: "运行中", value: "running", color: "green" },
    { label: "空闲", value: "idle", color: "gray" },
    { label: "维护中", value: "maintenance", color: "yellow" },
    { label: "故障", value: "fault", color: "red" },
    { label: "离线", value: "offline", color: "gray" },
  ],
  "dict-inspection-result": [
    { label: "正常", value: "normal", color: "green" },
    { label: "异常", value: "abnormal", color: "red" },
  ],
  "dict-order-type": [
    { label: "标准订单", value: "standard" },
    { label: "加急订单", value: "urgent" },
  ],
  "dict-priority": [
    { label: "普通", value: "normal", color: "gray" },
    { label: "高", value: "high", color: "yellow" },
    { label: "紧急", value: "urgent", color: "red" },
  ],
  "dict-color": [
    { label: "金色", value: "gold" },
    { label: "银色", value: "silver" },
    { label: "黑色", value: "black" },
    { label: "玫瑰金", value: "rose-gold" },
    { label: "蓝色", value: "blue" },
    { label: "自定义", value: "custom" },
  ],
  "dict-equipment-type": [
    { label: "磁控溅射镀膜机", value: "magnetron" },
    { label: "多弧离子镀膜机", value: "arc-ion" },
    { label: "辅助设备", value: "auxiliary" },
  ],
  "dict-report-type": [
    { label: "检验报告", value: "inspection" },
    { label: "追溯报告", value: "traceability" },
    { label: "SPC统计报告", value: "spc" },
  ],
  "dict-inspection-type": [
    { label: "日常点检", value: "daily" },
    { label: "周点检", value: "weekly" },
    { label: "月度点检", value: "monthly" },
  ],
  "dict-customer-type": [
    { label: "品牌客户", value: "brand" },
    { label: "经销商", value: "distributor" },
    { label: "其他", value: "other" },
  ],
  "dict-portal-report-status": [
    { label: "草稿", value: "draft", color: "gray" },
    { label: "已发布", value: "published", color: "green" },
  ],
}
