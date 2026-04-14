import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Package,
  RefreshCw,
  Timer,
  TrendingUp,
  User,
  Wrench,
  Zap,
} from "lucide-react"
import { batchesMock, ordersMock } from "@/mock/production"
import { equipmentMock } from "@/mock/equipment"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/production/progress/")({
  component: KanbanPage,
})

const TODAY = new Date("2026-04-14T00:00:00")

// ─── Helpers ─────────────────────────────────────────────────────────────────

function elapsed(startStr: string): string {
  const start = new Date(startStr)
  const ms = TODAY.getTime() - start.getTime()
  if (ms < 0) return "-"
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatTime(str: string): string {
  if (!str) return "-"
  return str.replace("T", " ").slice(0, 16).replace(/-/g, "/")
}

const equipmentStatusIcon: Record<string, React.ReactNode> = {
  running: <Zap className="h-4 w-4 text-green-500" />,
  idle: <Clock className="h-4 w-4 text-gray-400" />,
  maintenance: <Wrench className="h-4 w-4 text-amber-500" />,
  fault: <AlertCircle className="h-4 w-4 text-red-500" />,
  offline: <Activity className="h-4 w-4 text-gray-300" />,
}

const batchStatusColor: Record<string, string> = {
  pending: "bg-slate-100 border-slate-200 text-slate-700",
  scheduled: "bg-blue-50 border-blue-200 text-blue-800",
  "in-production": "bg-amber-50 border-amber-200 text-amber-900",
  completed: "bg-green-50 border-green-200 text-green-800",
  rejected: "bg-red-50 border-red-200 text-red-800",
  delivered: "bg-emerald-50 border-emerald-200 text-emerald-800",
}

const columnDef = [
  { status: "pending", label: "待排产", icon: Package, iconClass: "text-slate-500" },
  { status: "scheduled", label: "已排产", icon: Clock, iconClass: "text-blue-500" },
  { status: "in-production", label: "生产中", icon: Activity, iconClass: "text-amber-500" },
  { status: "completed", label: "已完工", icon: CheckCircle2, iconClass: "text-green-500" },
] as const

// ─── Equipment monitor card ──────────────────────────────────────────────────

interface EquipmentCardProps {
  equipment: (typeof equipmentMock)[0]
}

function EquipmentCard({ equipment: eq }: EquipmentCardProps) {
  const activeBatch = batchesMock.find(
    (b) => b.equipmentId === eq.id && b.batchStatus === "in-production",
  )
  const lastBatch = batchesMock
    .filter((b) => b.equipmentId === eq.id && b.batchStatus === "completed")
    .at(-1)

  const isRunning = eq.equipmentStatus === "running"
  const isMaintenance = eq.equipmentStatus === "maintenance"
  const isFault = eq.equipmentStatus === "fault"

  return (
    <Card
      className={cn(
        "shadow-sm border-l-4 transition-colors",
        isRunning && activeBatch ? "border-l-amber-400" :
        isRunning ? "border-l-green-400" :
        isMaintenance ? "border-l-amber-300" :
        isFault ? "border-l-red-400" : "border-l-gray-200",
      )}
    >
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold leading-tight truncate">
              {eq.equipmentName}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{eq.model}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {equipmentStatusIcon[eq.equipmentStatus]}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-4.5 px-1.5",
                getBadgeClassName(getDictColor("dict-equipment-status", eq.equipmentStatus)),
              )}
            >
              {getDictLabel("dict-equipment-status", eq.equipmentStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* OEE bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">OEE</span>
            <span className="text-xs font-medium tabular-nums">{eq.currentOee}%</span>
          </div>
          <Progress
            value={eq.currentOee}
            className={cn(
              "h-1.5",
              eq.currentOee >= 80 ? "[&>div]:bg-green-500" :
              eq.currentOee >= 60 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500",
            )}
          />
        </div>

        <Separator />

        {/* Active batch */}
        {activeBatch ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-700">正在生产</span>
            </div>
            <p className="text-sm font-medium leading-tight">{activeBatch.materialName}</p>
            <p className="text-xs text-muted-foreground">{activeBatch.customerName}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {activeBatch.quantity.toLocaleString()} 件
              </span>
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                已用 {elapsed(activeBatch.startTime)}
              </span>
            </div>
            {activeBatch.operatorName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {activeBatch.operatorName}
              </div>
            )}
          </div>
        ) : isMaintenance ? (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <Wrench className="h-3.5 w-3.5" />
            <span>保养维护中</span>
          </div>
        ) : isFault ? (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>设备故障</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">空闲待机</p>
            {lastBatch && (
              <p className="text-xs text-muted-foreground">
                上批：{lastBatch.materialName}（{formatTime(lastBatch.endTime).slice(5, 16)}完工）
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Batch kanban card ────────────────────────────────────────────────────────

interface BatchCardProps {
  batch: (typeof batchesMock)[0]
}

function BatchCard({ batch }: BatchCardProps) {
  const order = ordersMock.find((o) => o.id === batch.orderId)

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2 text-sm",
        batchStatusColor[batch.batchStatus] ?? batchStatusColor.pending,
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-mono text-[11px] font-medium leading-tight break-all">
          {batch.batchNo.replace("BATCH-", "")}
        </span>
        {order?.priority === "urgent" && (
          <Badge variant="outline" className="text-[10px] h-4 px-1 border-red-300 text-red-700 shrink-0">
            紧急
          </Badge>
        )}
      </div>

      <div>
        <p className="font-medium leading-tight">{batch.materialName}</p>
        <p className="text-xs opacity-70">{batch.customerName}</p>
      </div>

      <div className="flex items-center justify-between text-xs opacity-70">
        <span>{batch.quantity.toLocaleString()} 件</span>
        <span>{getDictLabel("dict-color", batch.color)}</span>
      </div>

      {batch.batchStatus === "in-production" && (
        <div className="text-xs opacity-80">
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 shrink-0" />
            <span className="truncate">{batch.equipmentName}</span>
          </span>
          <span className="flex items-center gap-1 mt-0.5">
            <Timer className="h-3 w-3 shrink-0" />
            已用 {elapsed(batch.startTime)}
          </span>
        </div>
      )}

      {batch.batchStatus === "completed" && batch.qualifyRate > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-70">良率</span>
          <span className={cn("font-semibold", batch.qualifyRate >= 98 ? "text-green-700" : "text-amber-700")}>
            {batch.qualifyRate.toFixed(1)}%
          </span>
        </div>
      )}

      {batch.batchStatus === "scheduled" && batch.equipmentName && (
        <div className="text-xs opacity-70 flex items-center gap-1">
          <Cpu className="h-3 w-3 shrink-0" />
          <span className="truncate">{batch.equipmentName}</span>
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

function KanbanPage() {
  const [lastRefresh] = useState(() => new Date("2026-04-14T08:45:00"))

  // KPIs
  const inProductionBatches = batchesMock.filter((b) => b.batchStatus === "in-production")
  const completedToday = batchesMock.filter(
    (b) => b.batchStatus === "completed" && b.endTime?.startsWith("2026-04-14"),
  )
  const runningEquipment = equipmentMock.filter((e) => e.equipmentStatus === "running")
  const qualityRates = batchesMock
    .filter((b) => b.qualifyRate > 0)
    .map((b) => b.qualifyRate)
  const avgQualityRate =
    qualityRates.length > 0
      ? qualityRates.reduce((s, r) => s + r, 0) / qualityRates.length
      : 0

  const totalInProductionQty = inProductionBatches.reduce((s, b) => s + b.quantity, 0)

  // Production equipment only (exclude auxiliary)
  const productionEquipment = equipmentMock.filter((e) => e.equipmentType !== "auxiliary")

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">生产看板</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            最近更新：{lastRefresh.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">在制批次</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{inProductionBatches.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  共 {totalInProductionQty.toLocaleString()} 件在途
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日完工</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{completedToday.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">批次数</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">设备稼动</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{runningEquipment.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  共 {productionEquipment.length} 台主机
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <Cpu className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">综合良率</p>
                <p
                  className={cn(
                    "text-3xl font-bold mt-1 tabular-nums",
                    avgQualityRate >= 98 ? "text-green-600" : avgQualityRate >= 95 ? "text-amber-600" : "text-red-600",
                  )}
                >
                  {avgQualityRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">基于已完工批次</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment monitor */}
      <div>
        <h2 className="text-base font-semibold mb-3">设备实时状态</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productionEquipment.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} />
          ))}
        </div>
      </div>

      {/* Batch kanban */}
      <div>
        <h2 className="text-base font-semibold mb-3">批次看板</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnDef.map(({ status, label, icon: Icon, iconClass }) => {
            const colBatches = batchesMock.filter((b) => b.batchStatus === status)
            return (
              <div key={status} className="flex flex-col gap-2">
                {/* Column header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-4 w-4", iconClass)} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs px-1.5 justify-center">
                    {colBatches.length}
                  </Badge>
                </div>

                {/* Cards */}
                <ScrollArea className="max-h-[480px]">
                  <div className="space-y-2 pr-1">
                    {colBatches.length === 0 ? (
                      <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                        暂无批次
                      </div>
                    ) : (
                      colBatches.map((batch) => (
                        <BatchCard key={batch.id} batch={batch} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active orders progress */}
      <div>
        <h2 className="text-base font-semibold mb-3">在制订单进度</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ordersMock
            .filter((o) => o.orderStatus === "in-production" || o.orderStatus === "scheduled")
            .map((order) => {
              const isOverdue =
                new Date(order.dueDate) < TODAY &&
                order.orderStatus !== "completed" &&
                order.orderStatus !== "delivered"

              return (
                <Card key={order.id} className="shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">{order.orderNo}</span>
                          {order.orderType === "urgent" && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-red-300 text-red-700">
                              加急
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm mt-0.5 leading-tight">{order.materialName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getBadgeClassName(getDictColor("dict-order-status", order.orderStatus)),
                          )}
                        >
                          {getDictLabel("dict-order-status", order.orderStatus)}
                        </Badge>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isOverdue ? "text-red-600 font-medium" : "text-muted-foreground",
                          )}
                        >
                          {isOverdue ? "⚠ 已超期" : `交期 ${order.dueDate}`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>生产进度</span>
                        <span className="font-medium tabular-nums text-foreground">{order.progress}%</span>
                      </div>
                      <Progress
                        value={order.progress}
                        className={cn(
                          "h-2",
                          order.progress >= 80 ? "[&>div]:bg-green-500" :
                          order.progress >= 40 ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-500",
                        )}
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{order.quantity.toLocaleString()} {order.unit}</span>
                        <span>
                          {getDictLabel("dict-priority", order.priority)} 优先级
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>
    </div>
  )
}
