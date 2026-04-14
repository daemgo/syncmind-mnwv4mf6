import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Package, User, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { ordersMock, batchesMock } from "@/mock/production"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/production/orders/$id")({
  component: OrderDetail,
})

function OrderDetail() {
  const { id } = Route.useParams()
  const order = ordersMock.find(o => o.id === id)
  const batches = batchesMock.filter(b => b.orderId === id)

  if (!order) return (
    <div className="p-6">
      <p className="text-muted-foreground">未找到该订单</p>
    </div>
  )

  const statusColor = getDictColor("dict-order-status", order.orderStatus)
  const priorityColor = getDictColor("dict-priority", order.priority)

  const due = new Date(order.dueDate)
  const now = new Date("2026-04-14")
  const remainingDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/production/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">{order.orderNo}</h1>
            <Badge className={cn("text-sm", getBadgeClassName(statusColor))}>
              {getDictLabel("dict-order-status", order.orderStatus)}
            </Badge>
            <Badge className={cn("text-sm", getBadgeClassName(priorityColor))}>
              {getDictLabel("dict-priority", order.priority)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            创建于 {new Date(order.createdAt).toLocaleDateString("zh-CN")} · {order.customerName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">重新排产</Button>
          <Button variant="destructive">取消订单</Button>
        </div>
      </div>

      {/* Progress + Urgency Alert */}
      {order.orderStatus !== "completed" && order.orderStatus !== "cancelled" && (
        <div className={cn(
          "p-4 rounded-xl border",
          remainingDays <= 3 ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900" :
          remainingDays <= 7 ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900" :
          "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "h-5 w-5",
                remainingDays <= 3 ? "text-red-600" : remainingDays <= 7 ? "text-amber-600" : "text-blue-600"
              )} />
              <div>
                <p className={cn(
                  "font-semibold",
                  remainingDays <= 3 ? "text-red-700 dark:text-red-300" :
                  remainingDays <= 7 ? "text-amber-700 dark:text-amber-300" :
                  "text-blue-700 dark:text-blue-300"
                )}>
                  剩余 {remainingDays} 天 · 交期 {order.dueDate}
                </p>
                <p className="text-sm text-muted-foreground">
                  距交期不足 {remainingDays} 天，请关注生产进度
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{order.progress}%</span>
              <p className="text-sm text-muted-foreground">完成进度</p>
            </div>
          </div>
          <Progress value={order.progress} className="mt-3" />
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="batches">批次列表</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Info Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">订单信息</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: "订单编号", value: order.orderNo, mono: true },
                    { label: "客户名称", value: order.customerName },
                    { label: "订单类型", value: getDictLabel("dict-order-type", order.orderType) },
                    { label: "物料名称", value: order.materialName },
                    { label: "颜色", value: getDictLabel("dict-color", order.color) },
                    { label: "膜厚规格", value: `${order.thicknessSpec} μm` },
                    { label: "数量", value: `${order.quantity} ${order.unit}` },
                    { label: "交期", value: order.dueDate },
                    { label: "优先级", value: getDictLabel("dict-priority", order.priority) },
                  ].map(item => (
                    <div key={item.label} className="flex">
                      <dt className="w-24 text-muted-foreground shrink-0">{item.label}</dt>
                      <dd className={cn("font-medium", (item as { mono?: boolean }).mono && "font-mono")}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* Tech + Remark Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">工艺与备注</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">工艺要求</p>
                  <p className="font-medium bg-muted/50 rounded p-2 min-h-[40px]">
                    {order.techRequirement || "无"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1">备注</p>
                  <p className="font-medium bg-muted/50 rounded p-2 min-h-[40px]">
                    {order.remark || "无"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batches">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">批次列表 ({batches.length})</CardTitle>
              <Button size="sm">新增批次</Button>
            </CardHeader>
            <CardContent>
              {batches.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">暂无批次数据</p>
              ) : (
                <div className="space-y-3">
                  {batches.map(batch => (
                    <div key={batch.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{batch.batchNo}</span>
                          <Badge className={cn("text-xs", getBadgeClassName(getDictColor("dict-batch-status", batch.batchStatus)))}>
                            {getDictLabel("dict-batch-status", batch.batchStatus)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {batch.equipmentName} · {batch.operatorName} · 开工 {batch.startTime ? new Date(batch.startTime).toLocaleString("zh-CN") : "-"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{batch.qualifiedQty}/{batch.quantity}</p>
                        <p className="text-xs text-muted-foreground">良品数/总量</p>
                      </div>
                      <Link
                        to="/quality/batches/$id"
                        params={{ id: batch.id }}
                        className="shrink-0"
                      >
                        <Button variant="ghost" size="sm">追溯</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
