export interface Order {
  id: string
  orderNo: string
  customerId: string
  customerName: string
  orderType: "standard" | "urgent"
  materialName: string
  color: string
  thicknessSpec: number
  quantity: number
  unit: string
  dueDate: string
  orderStatus: OrderStatus
  priority: "normal" | "high" | "urgent"
  techRequirement: string
  remark: string
  createdAt: string
  progress: number
}

export type OrderStatus = "pending" | "scheduled" | "in-production" | "completed" | "cancelled" | "delivered"

export interface Batch {
  id: string
  batchNo: string
  batchBarcode: string
  orderId: string
  orderNo: string
  customerName: string
  materialName: string
  color: string
  thicknessSpec: number
  actualThickness: number
  quantity: number
  qualifiedQty: number
  defectiveQty: number
  qualifyRate: number
  equipmentId: string
  equipmentName: string
  startTime: string
  endTime: string
  batchStatus: BatchStatus
  operatorName: string
}

export type BatchStatus = "pending" | "scheduled" | "in-production" | "completed" | "rejected" | "delivered"

export interface Report {
  id: string
  reportNo: string
  batchId: string
  batchNo: string
  orderId: string
  orderNo: string
  equipmentId: string
  equipmentName: string
  processName: string
  startTime: string
  endTime: string
  qualifiedQty: number
  defectiveQty: number
  operatorName: string
  reportStatus: "in-progress" | "completed"
}
