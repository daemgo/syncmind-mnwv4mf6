import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ClipboardList, Clock, CheckCircle2, XCircle, Timer } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { reportsMock } from "@/mock/production"
import { getBadgeClassName, getDictLabel } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/production/reports/$id")({
  component: ReportDetail,
})

function formatDateTime(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

function calcDuration(start: string, end: string) {
  if (!start || !end) return null
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms <= 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

const qualityChartConfig: ChartConfig = {
  qualified: { label: "合格数", color: "var(--color-chart-2)" },
  defective: { label: "不合格数", color: "var(--color-chart-4)" },
}

function ReportDetail() {
  const { id } = Route.useParams()
  const item = reportsMock.find(r => r.id === id)

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
        <p className="text-muted-foreground">未找到报工单数据</p>
        <Button variant="outline" asChild>
          <Link to="/production/reports">返回列表</Link>
        </Button>
      </div>
    )
  }

  const total = item.qualifiedQty + item.defectiveQty
  const qualifyRate = total > 0 ? ((item.qualifiedQty / total) * 100).toFixed(1) : "—"
  const duration = calcDuration(item.startTime, item.endTime)
  const isCompleted = item.reportStatus === "completed"

  const pieData = total > 0
    ? [
        { name: "qualified", value: item.qualifiedQty },
        { name: "defective", value: item.defectiveQty },
      ]
    : [{ name: "qualified", value: 1, placeholder: true }]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/production/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-2xl font-bold font-mono">{item.reportNo}</h1>
          <Badge className={cn("rounded-full", getBadgeClassName("dict-report-status", item.reportStatus))}>
            {getDictLabel("dict-report-status", item.reportStatus)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: info cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* 报工信息 */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-blue-500" />
                报工信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">批次编号</dt>
                  <dd className="mt-1 font-mono font-medium">{item.batchNo}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">订单编号</dt>
                  <dd className="mt-1 font-mono font-medium">{item.orderNo}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">工序名称</dt>
                  <dd className="mt-1 font-medium">{item.processName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">生产设备</dt>
                  <dd className="mt-1 font-medium">{item.equipmentName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">操作人员</dt>
                  <dd className="mt-1 font-medium">{item.operatorName}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* 生产时间 */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-violet-500" />
                生产时间
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-8">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">开工时间</p>
                  <p className="text-sm font-medium">{formatDateTime(item.startTime)}</p>
                </div>
                {item.endTime && (
                  <>
                    <div className="flex items-center self-center">
                      <div className="h-px w-8 bg-border" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">完工时间</p>
                      <p className="text-sm font-medium">{formatDateTime(item.endTime)}</p>
                    </div>
                  </>
                )}
                {!item.endTime && (
                  <div className="flex items-center gap-1.5 self-center text-sm text-yellow-600">
                    <Timer className="h-4 w-4" />
                    生产进行中
                  </div>
                )}
              </div>
              {duration && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">生产耗时：</span>
                    <span className="font-semibold">{duration}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: quality stats */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">质量数据</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pie chart */}
              {total > 0 ? (
                <ChartContainer config={qualityChartConfig} className="h-[180px] w-full">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={2}
                    >
                      <Cell fill="var(--color-qualified)" />
                      <Cell fill="var(--color-defective)" />
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  暂无质量数据
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    合格数量
                  </span>
                  <span className="font-semibold text-green-600">{item.qualifiedQty.toLocaleString()} 件</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <XCircle className="h-4 w-4 text-red-500" />
                    不合格数量
                  </span>
                  <span className="font-semibold text-red-600">{item.defectiveQty.toLocaleString()} 件</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">合格率</span>
                  <span className={cn(
                    "text-lg font-bold",
                    typeof qualifyRate === "string" && parseFloat(qualifyRate) >= 98
                      ? "text-green-600"
                      : parseFloat(qualifyRate as string) >= 95
                        ? "text-yellow-600"
                        : "text-red-600"
                  )}>
                    {qualifyRate !== "—" ? `${qualifyRate}%` : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
