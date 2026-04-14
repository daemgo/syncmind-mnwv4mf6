import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Download, Search } from "lucide-react"
import { DataTable, type ColumnConfig } from "@/components/biz/data-table"
import { DataFilter, type FilterField } from "@/components/biz/data-filter"
import { FormDialog, type FormField } from "@/components/biz/form-dialog"
import { equipmentMock } from "@/mock/equipment"
import type { Equipment } from "@/types/equipment"
import { getDictLabel } from "@/lib/dict"

export const Route = createFileRoute("/equipment/assets/")({
  component: EquipmentPage,
})

const columns: ColumnConfig<Equipment>[] = [
  { key: "equipmentNo", label: "设备编号", type: "mono" },
  { key: "equipmentName", label: "设备名称" },
  {
    key: "equipmentType", label: "类型", type: "badge", dictId: "dict-equipment-type",
    render: (val) => getDictLabel("dict-equipment-type", val as string),
  },
  { key: "model", label: "型号" },
  { key: "manufacturer", label: "厂商" },
  { key: "purchaseDate", label: "采购日期", type: "date" },
  {
    key: "equipmentStatus", label: "状态", type: "badge", dictId: "dict-equipment-status",
    render: (val) => getDictLabel("dict-equipment-status", val as string),
  },
  { key: "lastInspectionDate", label: "最近点检", type: "date" },
  {
    key: "currentOee", label: "OEE(%)", align: "right",
    render: (val) => `${val}%`,
  },
]

const filterFields: FilterField[] = [
  { key: "equipmentName", label: "设备名称", type: "text" },
  { key: "equipmentType", label: "设备类型", type: "select", dictId: "dict-equipment-type" },
  { key: "equipmentStatus", label: "运行状态", type: "select", dictId: "dict-equipment-status" },
]

const formFields: FormField[] = [
  { key: "equipmentName", label: "设备名称", type: "text", required: true },
  { key: "equipmentType", label: "设备类型", type: "select", dictId: "dict-equipment-type", required: true },
  { key: "model", label: "型号", type: "text" },
  { key: "manufacturer", label: "厂商", type: "text" },
  { key: "purchaseDate", label: "采购日期", type: "date" },
  { key: "standardCycleTime", label: "标准节拍(min)", type: "number" },
  { key: "plannedWorkingHours", label: "日计划工时(h)", type: "number" },
  { key: "maintenanceInterval", label: "维护周期(天)", type: "number" },
  { key: "remark", label: "备注", type: "textarea" },
]

function EquipmentPage() {
  const navigate = useNavigate()
  const [data] = useState(equipmentMock)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Equipment | undefined>()
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
        <h1 className="text-2xl font-bold">设备台账</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出
          </Button>
          <Button onClick={() => { setEditingItem(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />新增设备
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索设备..."
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
        onView={(item) => navigate({ to: "/equipment/assets/$id", params: { id: item.id } })}
        onEdit={(item) => { setEditingItem(item); setDialogOpen(true) }}
      />
      <FormDialog
        entityName="设备"
        fields={formFields}
        data={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
