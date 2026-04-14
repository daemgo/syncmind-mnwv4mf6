import { createFileRoute, Link } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Package, Clock, CalendarCheck, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { ordersMock, batchesMock, reportsMock } from "@/mock/production"
import { equipmentMock } from "@/mock/equipment"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

// === Mock dashboard data ===

const orderStatusData = [
  { name: "待排产", value: ordersMock.filter(o => o.orderStatus === "pending").length, color: "var(--color-chart-1)" },
  { name: "已排产", value: ordersMock.filter(o => o.orderStatus === "scheduled").length, color: "var(--color-chart-2)" },
  { name: "生产中", value: ordersMock.filter(o => o.orderStatus === "in-production").length, color: "var(--color-chart-3)" },
  { name: "已完成", value: ordersMock.filter(o => o.orderStatus === "completed").length, color: "var(--color-chart-4)" },
  { name: "已交付", value: ordersMock.filter(o => o.orderStatus === "delivered").length, color: "var(--color-chart-5)" },
]

const weeklyReportData = [
  { day: "周一", 报工批次: 4 },
  { day: "周二", 报工批次: 6 },
  { day: "周三", 报工批次: 5 },
  { day: "周四", 报工批次: 7 },
  { day: "周五", 报工批次: 8 },
  { day: "周六", 报工批次: 3 },
  { day: "周日", 报工批次: 2 },
]

const chartConfig: ChartConfig = {
  报工批次: { label: "报工批次", color: "var(--color-chart-1)" },
  订单数: { label: "订单数", color: "var(--color-chart-2)" },
}

const today = "2026-04-14"
const urgencyOrders = ordersMock
  .filter(o => o.orderStatus !== "completed" && o.orderStatus !== "delivered" && o.orderStatus !== "cancelled")
  .map(o => {
    const due = new Date(o.dueDate)
    const now = new Date(today)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { ...o, remainingDays: diff }
  })
  .filter(o => o.remainingDays <= 7)
  .sort((a, b) => a.remainingDays - b.remainingDays)

function DashboardPage() {
  const todayReports = reportsMock.filter(r => r.reportStatus === "completed")
  const inProduction = ordersMock.filter(o => o.orderStatus === "in-production").length
  const pendingOrders = ordersMock.filter(o => o.orderStatus === "pending").length
  const todayDeliveries = ordersMock.filter(o => o.dueDate === today).length
  const avgOee = Math.round(equipmentMock.reduce((s, e) => s + e.currentOee, 0) / equipmentMock.length)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">生产看板</h1>
          <p className="text-sm text-muted-foreground mt-1">实时监控生产状态，{today} 数据</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />刷新
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日报工批次</p>
                <p className="text-3xl font-bold mt-1">{todayReports.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">生产中订单</p>
                <p className="text-3xl font-bold mt-1">{inProduction}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待排产订单</p>
                <p className="text-3xl font-bold mt-1">{pendingOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日交付</p>
                <p className="text-3xl font-bold mt-1">{todayDeliveries}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">近7日报工批次趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={weeklyReportData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="报工批次" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">订单状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[260px] w-full">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, i) => (
                    <Cell key={i} fill={`var(--color-chart-${i + 1})`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Warning + OEE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Warning Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">交付预警</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/production/orders">全部订单</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {urgencyOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">暂无紧急订单</p>
            ) : (
              <div className="space-y-3">
                {urgencyOrders.map(order => (
                  <Link
                    key={order.id}
                    to="/production/orders/$id"
                    params={{ id: order.id }}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{order.orderNo}</span>
                        <Badge className={cn("text-xs", getBadgeClassName(getDictColor("dict-priority", order.priority)))}>
                          {getDictLabel("dict-priority", order.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{order.customerName} · {order.materialName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-sm font-semibold",
                        order.remainingDays <= 3 ? "text-red-600" : "text-amber-600"
                      )}>
                        剩余 {order.remainingDays} 天
                      </p>
                      <p className="text-xs text-muted-foreground">交期 {order.dueDate}</p>
                    </div>
                    <Progress value={order.progress} className="w-20 shrink-0" />
                    <Badge className={cn("shrink-0", getBadgeClassName(getDictColor("dict-order-status", order.orderStatus)))}>
                      {getDictLabel("dict-order-status", order.orderStatus)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* OEE Overview */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">设备OEE概览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipmentMock.slice(0, 4).map(eq => (
              <div key={eq.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{eq.equipmentName}</span>
                  <span className={cn(
                    "font-semibold",
                    eq.currentOee >= 80 ? "text-emerald-600" : eq.currentOee >= 70 ? "text-amber-600" : "text-red-600"
                  )}>
                    {eq.currentOee}%
                  </span>
                </div>
                <Progress
                  value={eq.currentOee}
                  className="h-2"
                />
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">综合平均OEE</span>
                <span className={cn(
                  "text-lg font-bold",
                  avgOee >= 80 ? "text-emerald-600" : avgOee >= 70 ? "text-amber-600" : "text-red-600"
                )}>
                  {avgOee}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">最近报工记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {reportsMock.slice(0, 5).map(report => {
              const isCompleted = report.reportStatus === "completed"
              return (
                <div key={report.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    isCompleted ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{report.reportNo}</span>
                      <Badge className={cn("text-xs", isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                        {isCompleted ? "已完工" : "进行中"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.batchNo} · {report.equipmentName} · {report.operatorName}
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-emerald-600">+{report.qualifiedQty}</p>
                      {report.defectiveQty > 0 && (
                        <p className="text-xs text-red-500">-{report.defectiveQty}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
