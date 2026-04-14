import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarDays, Layers, AlertCircle, Activity, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { ordersMock, batchesMock } from "@/mock/production"
import { equipmentMock } from "@/mock/equipment"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/production/scheduling/")({
  component: SchedulingPage,
})

const TODAY = new Date("2026-04-14T00:00:00")

// Batch bar colors by status
const batchBarStyle: Record<string, string> = {
  pending: "bg-gray-200 text-gray-600 border-gray-300",
  scheduled: "bg-blue-100 text-blue-700 border-blue-300",
  "in-production": "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
}

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"]

// ─── Gantt chart ────────────────────────────────────────────────────────────

interface GanttProps {
  weekStart: Date
}

function GanttChart({ weekStart }: GanttProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  // Only show main production equipment
  const equipments = equipmentMock.filter((e) => e.equipmentType !== "auxiliary")

  // Convert start/end time strings to [leftPct, widthPct] within the 7-day window
  function calcPosition(startTimeStr: string, endTimeStr: string) {
    // Normalise to UTC midnight of each date for day-level placement
    const startDate = new Date(startTimeStr.split("T")[0] + "T00:00:00")
    const endDateRaw = endTimeStr ? new Date(endTimeStr.split("T")[0] + "T00:00:00") : null
    // If no end, show as 1-day bar
    const endDate = endDateRaw ?? new Date(startDate.getTime() + 24 * 3600 * 1000)
    // Treat end-date as end-of-day (+1 day)
    const endDisplay = new Date(endDate.getTime() + 24 * 3600 * 1000)

    const totalMs = 7 * 24 * 3600 * 1000
    const weekStartMs = weekStart.getTime()

    const startMs = startDate.getTime() - weekStartMs
    const endMs = endDisplay.getTime() - weekStartMs

    if (endMs <= 0 || startMs >= totalMs) return null // outside window

    const left = Math.max(0, startMs / totalMs) * 100
    const right = Math.min(1, endMs / totalMs) * 100
    const width = right - left

    return { left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%` }
  }

  // Today indicator position
  const todayMs = TODAY.getTime() - weekStart.getTime()
  const todayPct = (todayMs / (7 * 24 * 3600 * 1000)) * 100
  const showToday = todayPct >= 0 && todayPct <= 100

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Day header */}
        <div className="flex border-b mb-1">
          <div className="w-44 shrink-0" />
          <div className="flex-1 grid grid-cols-7">
            {days.map((d, i) => {
              const isToday = d.toDateString() === TODAY.toDateString()
              return (
                <div
                  key={i}
                  className={cn(
                    "text-center py-1.5",
                    isToday ? "text-primary font-semibold" : "text-muted-foreground",
                  )}
                >
                  <div className="text-xs">{d.getMonth() + 1}/{d.getDate()}</div>
                  <div className="text-[11px]">周{WEEKDAY_LABELS[d.getDay()]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Equipment rows */}
        <TooltipProvider delayDuration={200}>
          {equipments.map((eq) => {
            const batches = batchesMock.filter((b) => b.equipmentId === eq.id)

            return (
              <div key={eq.id} className="flex items-center min-h-[56px] border-b last:border-0 py-2 gap-2">
                {/* Equipment label */}
                <div className="w-44 shrink-0 pr-3">
                  <div className="text-sm font-medium leading-tight truncate">{eq.equipmentName}</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 text-[10px] h-4 px-1.5",
                      getBadgeClassName(getDictColor("dict-equipment-status", eq.equipmentStatus)),
                    )}
                  >
                    {getDictLabel("dict-equipment-status", eq.equipmentStatus)}
                  </Badge>
                </div>

                {/* Timeline area */}
                <div className="flex-1 relative h-10 rounded bg-muted/30">
                  {/* Day grid lines */}
                  {days.map((_, i) =>
                    i > 0 ? (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-border/40"
                        style={{ left: `${((i / 7) * 100).toFixed(2)}%` }}
                      />
                    ) : null,
                  )}

                  {/* Today marker */}
                  {showToday && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-primary/60 z-10"
                      style={{ left: `${todayPct.toFixed(2)}%` }}
                    />
                  )}

                  {/* Batch bars */}
                  {batches.map((batch) => {
                    const pos = calcPosition(batch.startTime, batch.endTime)
                    if (!pos) return null
                    return (
                      <Tooltip key={batch.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute top-1 bottom-1 rounded border text-[11px] flex items-center px-1.5 overflow-hidden cursor-default transition-opacity hover:opacity-80",
                              batchBarStyle[batch.batchStatus] ?? batchBarStyle.pending,
                            )}
                            style={{ left: pos.left, width: pos.width }}
                          >
                            <span className="truncate">{batch.materialName}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs space-y-0.5 max-w-52">
                          <p className="font-medium">{batch.batchNo}</p>
                          <p>{batch.customerName} · {batch.materialName}</p>
                          <p>
                            <Badge
                              variant="outline"
                              className={cn("text-[10px] h-4 px-1", getBadgeClassName(getDictColor("dict-batch-status", batch.batchStatus)))}
                            >
                              {getDictLabel("dict-batch-status", batch.batchStatus)}
                            </Badge>
                          </p>
                          <p className="text-muted-foreground">
                            {batch.startTime.split("T")[0]}
                            {batch.endTime ? ` → ${batch.endTime.split("T")[0]}` : " (进行中)"}
                          </p>
                          {batch.operatorName && <p>操作员：{batch.operatorName}</p>}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-3 pl-44">
          {(
            [
              { status: "in-production", label: "生产中" },
              { status: "completed", label: "已完工" },
              { status: "scheduled", label: "已排产" },
              { status: "delivered", label: "已出货" },
            ] as const
          ).map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn("h-3 w-3 rounded border", batchBarStyle[status])} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

function SchedulingPage() {
  // Default: show Apr 8–14 so all mock batches are visible
  const [weekStart, setWeekStart] = useState(() => new Date("2026-04-08T00:00:00"))
  const [statusFilter, setStatusFilter] = useState("all")

  function prevWeek() {
    setWeekStart((d) => {
      const n = new Date(d)
      n.setDate(n.getDate() - 7)
      return n
    })
  }
  function nextWeek() {
    setWeekStart((d) => {
      const n = new Date(d)
      n.setDate(n.getDate() + 7)
      return n
    })
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekLabel = `${formatDate(weekStart)} — ${formatDate(weekEnd)}`

  // KPI
  const pendingOrders = ordersMock.filter((o) => o.orderStatus === "pending")
  const inProductionBatches = batchesMock.filter((b) => b.batchStatus === "in-production")
  const overdueOrders = ordersMock.filter(
    (o) =>
      new Date(o.dueDate) < TODAY &&
      o.orderStatus !== "completed" &&
      o.orderStatus !== "delivered" &&
      o.orderStatus !== "cancelled",
  )
  const runningEquipment = equipmentMock.filter((e) => e.equipmentStatus === "running")

  const filteredOrders = ordersMock.filter((o) => {
    if (statusFilter === "all") return true
    return o.orderStatus === statusFilter
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">排产计划</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新增排产
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待排产订单</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{pendingOrders.length}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
                <CalendarDays className="h-4.5 w-4.5 text-slate-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">进行中批次</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{inProductionBatches.length}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                <Layers className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">超期未完成</p>
                <p className={cn("text-3xl font-bold mt-1 tabular-nums", overdueOrders.length > 0 && "text-red-600")}>
                  {overdueOrders.length}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">设备运行中</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{runningEquipment.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">共 {equipmentMock.length} 台</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">设备排产甘特图</CardTitle>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-40 text-center select-none">{weekLabel}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <GanttChart weekStart={weekStart} />
        </CardContent>
      </Card>

      {/* Order scheduling list */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">订单排产列表</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待排产</SelectItem>
                <SelectItem value="scheduled">已排产</SelectItem>
                <SelectItem value="in-production">生产中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="delivered">已交付</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单编号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>物料 / 颜色</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>交期</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-36">进度</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-20 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const isOverdue =
                      new Date(order.dueDate) < TODAY &&
                      order.orderStatus !== "completed" &&
                      order.orderStatus !== "delivered" &&
                      order.orderStatus !== "cancelled"

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-mono text-xs">{order.orderNo}</span>
                        </TableCell>
                        <TableCell className="text-sm">{order.customerName}</TableCell>
                        <TableCell>
                          <div className="text-sm leading-tight">{order.materialName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {getDictLabel("dict-color", order.color)} · {order.thicknessSpec}μm
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {order.quantity.toLocaleString()} {order.unit}
                        </TableCell>
                        <TableCell>
                          <div className={cn("text-sm", isOverdue && "text-red-600 font-medium")}>
                            {order.dueDate}
                          </div>
                          {isOverdue && (
                            <div className="text-[11px] text-red-500 mt-0.5">已超期</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getBadgeClassName(getDictColor("dict-priority", order.priority)),
                            )}
                          >
                            {getDictLabel("dict-priority", order.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getBadgeClassName(getDictColor("dict-order-status", order.orderStatus)),
                            )}
                          >
                            {getDictLabel("dict-order-status", order.orderStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={order.progress} className="h-1.5 flex-1" />
                            <span className="text-xs tabular-nums text-muted-foreground w-7 text-right">
                              {order.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.orderStatus === "pending" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2.5">
                              排产
                            </Button>
                          )}
                          {order.orderStatus === "scheduled" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2.5">
                              调整
                            </Button>
                          )}
                          {(order.orderStatus === "in-production" ||
                            order.orderStatus === "completed" ||
                            order.orderStatus === "delivered") && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2.5">
                              详情
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
