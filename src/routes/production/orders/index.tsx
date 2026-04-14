import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Download, Upload, Search } from "lucide-react"
import { DataTable, type ColumnConfig } from "@/components/biz/data-table"
import { DataFilter, type FilterField } from "@/components/biz/data-filter"
import { FormDialog, type FormField } from "@/components/biz/form-dialog"
import { ordersMock } from "@/mock/production"
import type { Order } from "@/types/production"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/production/orders/")({
  component: OrdersPage,
})

const columns: ColumnConfig<Order>[] = [
  { key: "orderNo", label: "订单编号", type: "mono" },
  { key: "customerName", label: "客户名称" },
  {
    key: "orderType", label: "订单类型", type: "badge",
    dictId: "dict-order-type",
    render: (val) => getDictLabel("dict-order-type", val as string)
  },
  { key: "materialName", label: "物料名称" },
  {
    key: "color", label: "颜色", type: "badge",
    dictId: "dict-color",
    render: (val) => getDictLabel("dict-color", val as string)
  },
  { key: "thicknessSpec", label: "膜厚规格", type: "number", suffix: "μm" },
  { key: "quantity", label: "数量", type: "number" },
  { key: "unit", label: "单位" },
  { key: "dueDate", label: "交期", type: "date" },
  {
    key: "orderStatus", label: "订单状态", type: "badge", dictId: "dict-order-status",
    render: (val) => getDictLabel("dict-order-status", val as string)
  },
  {
    key: "priority", label: "优先级", type: "badge", dictId: "dict-priority",
    render: (val) => getDictLabel("dict-priority", val as string)
  },
  { key: "createdAt", label: "创建时间", type: "datetime" },
]

const filterFields: FilterField[] = [
  { key: "customerName", label: "客户名称", type: "text" },
  { key: "orderStatus", label: "订单状态", type: "select", dictId: "dict-order-status" },
  { key: "priority", label: "优先级", type: "select", dictId: "dict-priority" },
  { key: "dueDate", label: "交期", type: "date" },
]

const formFields: FormField[] = [
  { key: "customerId", label: "客户", type: "select", dictId: "dict-customer-type", required: true },
  { key: "orderType", label: "订单类型", type: "select", dictId: "dict-order-type", required: true },
  { key: "materialName", label: "物料名称", type: "text", required: true },
  { key: "color", label: "颜色", type: "select", dictId: "dict-color", required: true },
  { key: "thicknessSpec", label: "膜厚规格", type: "number", required: true },
  { key: "quantity", label: "数量", type: "number", required: true },
  { key: "unit", label: "单位", type: "text" },
  { key: "dueDate", label: "交期", type: "date", required: true },
  { key: "priority", label: "优先级", type: "select", dictId: "dict-priority", required: true },
  { key: "techRequirement", label: "工艺要求", type: "textarea" },
  { key: "remark", label: "备注", type: "textarea" },
]

function OrdersPage() {
  const navigate = useNavigate()
  const [data] = useState(ordersMock)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Order | undefined>()
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")

  const filtered = data.filter(item => {
    const matchSearch = !search || Object.values(item as Record<string, unknown>).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
    const matchFilters = Object.entries(filters).every(([key, val]) => {
      if (!val) return true
      return String((item as Record<string, unknown>)[key]).toLowerCase().includes(val.toLowerCase())
    })
    return matchSearch && matchFilters
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">订单管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />批量导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出
          </Button>
          <Button onClick={() => { setEditingItem(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />新增订单
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索订单..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataFilter fields={filterFields} values={filters} onChange={setFilters} />
      <DataTable
        columns={columns}
        data={filtered}
        onView={(item) => navigate({ to: "/production/orders/$id", params: { id: item.id } })}
        onEdit={(item) => { setEditingItem(item); setDialogOpen(true) }}
      />
      <FormDialog
        entityName="订单"
        fields={formFields}
        data={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
