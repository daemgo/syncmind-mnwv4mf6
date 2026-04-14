export interface Equipment {
  id: string
  equipmentNo: string
  equipmentName: string
  equipmentType: "magnetron" | "arc-ion" | "auxiliary"
  model: string
  manufacturer: string
  purchaseDate: string
  equipmentStatus: EquipmentStatus
  lastInspectionDate: string
  currentOee: number
  standardCycleTime: number
  plannedWorkingHours: number
  maintenanceInterval: number
  remark: string
}

export type EquipmentStatus = "running" | "idle" | "maintenance" | "fault" | "offline"

export interface Inspection {
  id: string
  inspectionNo: string
  equipmentId: string
  equipmentName: string
  inspectionType: "daily" | "weekly" | "monthly"
  inspectionTime: string
  inspectorName: string
  inspectionResult: "normal" | "abnormal"
  abnormalDesc: string
  nextInspectionDate: string
  remark: string
}
