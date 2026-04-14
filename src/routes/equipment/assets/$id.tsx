import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, HardDrive, TrendingUp, Wrench } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { equipmentMock } from "@/mock/equipment"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/equipment/assets/$id")({
  component: EquipmentDetail,
})

// Deterministic OEE variation pattern over 30 days
const OEE_OFFSETS = [3, -2, 1, -1, 4, -3, 2, 1, -2, 3, -1, 2, -3, 1, 4, -2, 1, -1, 3, -2, 1, 4, -3, 2, -1, 1, -2, 3, 1, -1]

const oeeChartConfig: ChartConfig = {
  oee: { label: "OEE(%)", color: "var(--color-chart-1)" },
}

function EquipmentDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const equipment = equipmentMock.find(e => e.id === id)

  const oeeHistory = useMemo(() => {
    if (!equipment) return []
    return OEE_OFFSETS.map((offset, i) => {
      const date = new Date("2026-04-14")
      date.setDate(date.getDate() - (29 - i))
      const day = `${date.getMonth() + 1}/${date.getDate()}`
      const oee = Math.round(Math.max(50, Math.min(100, equipment.currentOee + offset)) * 10) / 10
      return { day, oee }
    })
  }, [equipment])

  if (!equipment) return <div className="p-6 text-muted-foreground">未找到该设备</div>

  const statusColor = getDictColor("dict-equipment-status", equipment.equipmentStatus)
  const typeColor = getDictColor("dict-equipment-type", equipment.equipmentType)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/equipment/assets"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{equipment.equipmentName}</h1>
            <Badge className={cn("text-sm", getBadgeClassName(statusColor))}>
              {getDictLabel("dict-equipment-status", equipment.equipmentStatus)}
            </Badge>
            <Badge className={cn("text-sm", getBadgeClassName(typeColor))}>
              {getDictLabel("dict-equipment-type", equipment.equipmentType)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {equipment.equipmentNo} · {equipment.model} · {equipment.manufacturer}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/equipment/inspection" })}>
            <Wrench className="mr-2 h-4 w-4" />查看点检记录
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: "/equipment/oee" })}>
            <TrendingUp className="mr-2 h-4 w-4" />OEE分析
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Basic Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4" />设备信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex">
                <dt className="w-24 text-muted-foreground shrink-0">设备编号</dt>
                <dd className="font-mono font-medium text-xs">{equipment.equipmentNo}</dd>
              </div>
              <Separator />
              {[
                { label: "设备名称", value: equipment.equipmentName },
                { label: "型号", value: equipment.model },
                { label: "厂商", value: equipment.manufacturer },
                { label: "采购日期", value: equipment.purchaseDate },
                { label: "最近点检", value: equipment.lastInspectionDate },
                { label: "标准节拍", value: `${equipment.standardCycleTime} min/批` },
                { label: "日计划工时", value: `${equipment.plannedWorkingHours} h` },
                { label: "维护周期", value: `${equipment.maintenanceInterval} 天` },
              ].map(item => (
                <div key={item.label} className="flex">
                  <dt className="w-24 text-muted-foreground shrink-0">{item.label}</dt>
                  <dd className="font-medium">{item.value}</dd>
                </div>
              ))}
              {equipment.remark && (
                <div>
                  <dt className="text-muted-foreground mb-1">备注</dt>
                  <dd className="text-xs text-muted-foreground bg-muted/50 rounded p-2">{equipment.remark}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* OEE Stats + Chart */}
        <div className="space-y-4 lg:col-span-2">
          {/* OEE KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 bg-blue-50 dark:bg-blue-950/30 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">当前 OEE</p>
                <p className={cn(
                  "mt-1 text-2xl font-bold",
                  equipment.currentOee >= 80 ? "text-emerald-700" : equipment.currentOee >= 70 ? "text-amber-700" : "text-red-600"
                )}>
                  {equipment.currentOee}%
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  {equipment.currentOee >= 80 ? "良好" : equipment.currentOee >= 70 ? "一般" : "不足"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">标准节拍</p>
                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">{equipment.standardCycleTime}</p>
                <p className="text-xs text-emerald-600 mt-1">分钟/批</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-amber-50 dark:bg-amber-950/30 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">日计划工时</p>
                <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">{equipment.plannedWorkingHours}</p>
                <p className="text-xs text-amber-600 mt-1">小时/天</p>
              </CardContent>
            </Card>
          </div>

          {/* OEE Trend Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />近30天 OEE 趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={oeeChartConfig} className="h-[220px] w-full">
                <LineChart data={oeeHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {/* Target line at 70% */}
                  <ReferenceLine y={70} stroke="hsl(var(--amber-400, 245 158 11))" strokeDasharray="4 2" />
                  <Line
                    type="monotone"
                    dataKey="oee"
                    stroke="var(--color-oee)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
              <p className="text-xs text-muted-foreground mt-2">目标 OEE: 70%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
