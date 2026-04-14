import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ScanBarcode, Download, Search, FileSearch } from "lucide-react"
import { DataTable, type ColumnConfig } from "@/components/biz/data-table"
import { DataFilter, type FilterField } from "@/components/biz/data-filter"
import { FormDialog, type FormField } from "@/components/biz/form-dialog"
import { batchesMock } from "@/mock/production"
import type { Batch } from "@/types/production"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/quality/batches/")({
  component: BatchesPage,
})

const columns: ColumnConfig<Batch>[] = [
  { key: "batchNo", label: "批次编号", type: "mono" },
  { key: "batchBarcode", label: "批次条码", type: "mono" },
  { key: "orderNo", label: "订单编号", type: "link" },
  { key: "customerName", label: "客户" },
  { key: "materialName", label: "物料" },
  {
    key: "color", label: "颜色", type: "badge",
    dictId: "dict-color",
    render: (val) => getDictLabel("dict-color", val as string)
  },
  { key: "thicknessSpec", label: "膜厚规格", type: "number", suffix: "μm" },
  { key: "actualThickness", label: "实际膜厚", type: "number", suffix: "μm" },
  {
    key: "qualifyRate", label: "良品率", type: "percent",
    render: (val) => `${(val as number).toFixed(1)}%`
  },
  { key: "equipmentName", label: "设备" },
  { key: "startTime", label: "开工时间", type: "datetime" },
  {
    key: "batchStatus", label: "批次状态", type: "badge", dictId: "dict-batch-status",
    render: (val) => getDictLabel("dict-batch-status", val as string)
  },
]

const filterFields: FilterField[] = [
  { key: "customerName", label: "客户", type: "text" },
  { key: "batchNo", label: "批次编号", type: "text" },
  { key: "batchBarcode", label: "批次条码", type: "text" },
  { key: "batchStatus", label: "批次状态", type: "select", dictId: "dict-batch-status" },
  { key: "color", label: "颜色", type: "select", dictId: "dict-color" },
]

const formFields: FormField[] = [
  { key: "orderId", label: "关联订单", type: "select", required: true },
  { key: "equipmentId", label: "设备", type: "select", required: true },
  { key: "quantity", label: "数量", type: "number", required: true },
]

function BatchesPage() {
  const navigate = useNavigate()
  const [data] = useState(batchesMock)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Batch | undefined>()
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
        <h1 className="text-2xl font-bold">批次追溯</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ScanBarcode className="mr-2 h-4 w-4" />扫码查询
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出追溯报告
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索批次..."
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
        onView={(item) => navigate({ to: "/quality/batches/$id", params: { id: item.id } })}
      />
    </div>
  )
}
