import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileDown, Printer, CheckCircle, Package, Settings, User, Clock } from "lucide-react"
import { batchesMock } from "@/mock/production"
import { inspectionsMock } from "@/mock/quality"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/quality/batches/$id")({
  component: BatchDetail,
})

function BatchDetail() {
  const { id } = Route.useParams()
  const batch = batchesMock.find(b => b.id === id)
  const inspection = inspectionsMock.find(i => i.batchId === id)

  if (!batch) return (
    <div className="p-6">
      <p className="text-muted-foreground">未找到该批次</p>
    </div>
  )

  const statusColor = getDictColor("dict-batch-status", batch.batchStatus)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/quality/batches"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">{batch.batchNo}</h1>
            <Badge className={cn("text-sm", getBadgeClassName(statusColor))}>
              {getDictLabel("dict-batch-status", batch.batchStatus)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            条码：{batch.batchBarcode} · {batch.customerName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />打印追溯标签
          </Button>
          <Button>
            <FileDown className="mr-2 h-4 w-4" />导出追溯报告
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">批次信息</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {[
                { label: "批次编号", value: batch.batchNo },
                { label: "批次条码", value: batch.batchBarcode, mono: true },
                { label: "关联订单", value: batch.orderNo },
                { label: "客户名称", value: batch.customerName },
                { label: "物料名称", value: batch.materialName },
                { label: "颜色", value: getDictLabel("dict-color", batch.color) },
                { label: "膜厚规格", value: `${batch.thicknessSpec} μm` },
                { label: "实际膜厚", value: `${batch.actualThickness} μm` },
                { label: "良品率", value: `${batch.qualifyRate.toFixed(1)}%` },
                { label: "设备", value: batch.equipmentName },
                { label: "操作员", value: batch.operatorName },
                { label: "开工时间", value: batch.startTime ? new Date(batch.startTime).toLocaleString("zh-CN") : "-" },
                { label: "完工时间", value: batch.endTime ? new Date(batch.endTime).toLocaleString("zh-CN") : "-" },
              ].map(item => (
                <div key={item.label} className="flex">
                  <dt className="w-28 text-muted-foreground shrink-0">{item.label}</dt>
                  <dd className={cn("font-medium", (item as { mono?: boolean }).mono && "font-mono")}>{item.value || "-"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Quality Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">质量数据</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{batch.quantity}</p>
                <p className="text-sm text-muted-foreground mt-1">批次数量</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{batch.qualifiedQty}</p>
                <p className="text-sm text-muted-foreground mt-1">良品数</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{batch.defectiveQty}</p>
                <p className="text-sm text-muted-foreground mt-1">不良数</p>
              </div>
            </div>

            {inspection && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">质检记录</p>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-20 text-muted-foreground">检验编号</dt>
                    <dd className="font-mono">{inspection.inspectionNo}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-20 text-muted-foreground">测量值</dt>
                    <dd>{inspection.measureValue1} / {inspection.measureValue2} / {inspection.measureValue3} μm</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-20 text-muted-foreground">平均值</dt>
                    <dd>{inspection.avgValue} μm</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-20 text-muted-foreground">偏差</dt>
                    <dd className={inspection.deviation >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {inspection.deviation >= 0 ? "+" : ""}{inspection.deviation}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-20 text-muted-foreground">结论</dt>
                    <dd>
                      <Badge className={cn("text-xs", getBadgeClassName(getDictColor("dict-inspection-conclusion", inspection.conclusion)))}>
                        {getDictLabel("dict-inspection-conclusion", inspection.conclusion)}
                      </Badge>
                    </dd>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Traceability Timeline */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">追溯链路</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-border">
            {[
              {
                icon: Package,
                title: "来料接收",
                desc: "来料批次 · 供应商来料检验合格",
                time: "2026-04-09 08:00",
                color: "text-blue-600 bg-blue-50 dark:bg-blue-950"
              },
              {
                icon: Settings,
                title: "工艺参数",
                desc: `${batch.equipmentName} · 磁控溅射工艺`,
                time: batch.startTime ? new Date(batch.startTime).toLocaleString("zh-CN") : "-",
                color: "text-violet-600 bg-violet-50 dark:bg-violet-950"
              },
              {
                icon: User,
                title: "生产报工",
                desc: `良品 ${batch.qualifiedQty} · 不良 ${batch.defectiveQty} · ${batch.operatorName}`,
                time: batch.endTime ? new Date(batch.endTime).toLocaleString("zh-CN") : "-",
                color: batch.batchStatus === "completed" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" : "text-amber-600 bg-amber-50 dark:bg-amber-950"
              },
              {
                icon: CheckCircle,
                title: "质检记录",
                desc: inspection ? `膜厚 ${inspection.avgValue}μm · 结论：${getDictLabel("dict-inspection-conclusion", inspection.conclusion)}` : "等待质检",
                time: inspection ? new Date(inspection.inspectionTime).toLocaleString("zh-CN") : "-",
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className={cn(
                  "absolute -left-[22px] h-6 w-6 rounded-full border-2 border-background flex items-center justify-center",
                  step.color.split(" ")[0], step.color.split(" ")[1]
                )} style={{ backgroundColor: "var(--tw-ring-offset-background)" }}>
                  <step.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{step.time || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
