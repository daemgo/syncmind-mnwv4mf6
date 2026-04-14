export interface BatchCost {
  id: string
  batchId: string
  batchNo: string
  orderId: string
  orderNo: string
  customerName: string
  materialName: string
  endTime: string
  materialCost: number
  laborCost: number
  energyCost: number
  otherCost: number
  totalCost: number
  unitCost: number
}
