import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Download, Search } from "lucide-react"
import { DataTable, type ColumnConfig } from "@/components/biz/data-table"
import { DataFilter, type FilterField } from "@/components/biz/data-filter"
import { FormDialog, type FormField } from "@/components/biz/form-dialog"
import { reportsMock } from "@/mock/production"
import type { Report } from "@/types/production"

export const Route = createFileRoute("/production/reports/")({
  component: ReportsPage,
})

const columns: ColumnConfig<Report>[] = [
  { key: "reportNo", label: "报工单号", type: "mono" },
  { key: "batchNo", label: "批次编号", type: "mono" },
  { key: "orderNo", label: "订单编号", type: "mono" },
  { key: "processName", label: "工序名称" },
  { key: "equipmentName", label: "设备名称" },
  { key: "operatorName", label: "操作人员" },
  { key: "startTime", label: "开工时间", type: "datetime" },
  { key: "qualifiedQty", label: "合格数", type: "number", align: "right" },
  { key: "defectiveQty", label: "不合格数", type: "number", align: "right" },
  { key: "reportStatus", label: "状态", type: "badge", dictId: "dict-report-status" },
]

const filterFields: FilterField[] = [
  { key: "operatorName", label: "操作人员", type: "text" },
  { key: "processName", label: "工序名称", type: "text" },
  { key: "reportStatus", label: "状态", type: "select", dictId: "dict-report-status" },
]

const formFields: FormField[] = [
  { key: "batchNo", label: "批次编号", type: "text", required: true },
  { key: "orderNo", label: "订单编号", type: "text", required: true },
  { key: "processName", label: "工序名称", type: "text", required: true },
  { key: "equipmentName", label: "设备名称", type: "text", required: true },
  { key: "operatorName", label: "操作人员", type: "text", required: true },
  { key: "startTime", label: "开工时间", type: "date", required: true },
  { key: "qualifiedQty", label: "合格数量", type: "number" },
  { key: "defectiveQty", label: "不合格数量", type: "number" },
  { key: "reportStatus", label: "状态", type: "select", dictId: "dict-report-status", required: true },
]

function ReportsPage() {
  const navigate = useNavigate()
  const [data] = useState(reportsMock)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Report | undefined>()
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
        <h1 className="text-2xl font-bold">报工管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出
          </Button>
          <Button onClick={() => { setEditingItem(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />新增报工
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索报工单..."
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
        onView={(item) => navigate({ to: "/production/reports/$id", params: { id: item.id } })}
        onEdit={(item) => { setEditingItem(item); setDialogOpen(true) }}
      />
      <FormDialog
        entityName="报工单"
        fields={formFields}
        data={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
