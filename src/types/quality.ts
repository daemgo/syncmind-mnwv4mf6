export interface Inspection {
  id: string
  inspectionNo: string
  batchId: string
  batchNo: string
  orderId: string
  orderNo: string
  equipmentId: string
  equipmentName: string
  thicknessSpec: number
  measureValue1: number
  measureValue2: number
  measureValue3: number
  avgValue: number
  deviation: number
  conclusion: "qualified" | "unqualified"
  inspectionTime: string
  inspectorName: string
  remark: string
}
