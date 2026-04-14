import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Download, TrendingUp } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { equipmentMock } from "@/mock/equipment"
import { getDictLabel, getDictColor, getBadgeClassName } from "@/lib/dict"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/equipment/oee/")({
  component: OEEDashboard,
})

// Mock OEE trend data (30 days)
const oeeTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 3, 14 - 29 + i)
  const day = date.getDate()
  return {
    date: `${day}日`,
    "磁控溅射镀膜机-01": 78 + Math.random() * 8,
    "多弧离子镀膜机-02": 72 + Math.random() * 10,
    "磁控溅射镀膜机-03": 68 + Math.random() * 12,
  }
})

const chartConfig: ChartConfig = {
  "磁控溅射镀膜机-01": { label: "磁控溅射-01", color: "var(--color-chart-1)" },
  "多弧离子镀膜机-02": { label: "多弧离子-02", color: "var(--color-chart-2)" },
  "磁控溅射镀膜机-03": { label: "磁控溅射-03", color: "var(--color-chart-3)" },
}

function OEEDashboard() {
  const activeEquipment = equipmentMock.filter(e => e.equipmentStatus === "running")
  const avgOee = Math.round(activeEquipment.reduce((s, e) => s + e.currentOee, 0) / (activeEquipment.length || 1))
  const avgAvailability = Math.round(avgOee * 1.08)
  const avgPerformance = Math.round(avgOee * 1.05)
  const avgQuality = Math.round(avgOee * 0.95)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">OEE分析</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出OEE报告
          </Button>
        </div>
      </div>

      {/* OEE Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均OEE</p>
                <p className={cn(
                  "text-3xl font-bold mt-1",
                  avgOee >= 80 ? "text-emerald-600" : avgOee >= 70 ? "text-amber-600" : "text-red-600"
                )}>
                  {avgOee}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Progress value={avgOee} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">可用率</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{avgAvailability}%</p>
            <p className="text-xs text-muted-foreground mt-1">计划时间 - 停机时间</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">性能率</p>
            <p className="text-2xl font-bold mt-1 text-violet-600">{avgPerformance}%</p>
            <p className="text-xs text-muted-foreground mt-1">实际产量 × 标准节拍</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">质量率</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{avgQuality}%</p>
            <p className="text-xs text-muted-foreground mt-1">良品数 / 实际产量</p>
          </CardContent>
        </Card>
      </div>

      {/* OEE Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">近30天OEE趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={oeeTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={4} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[60, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="磁控溅射镀膜机-01"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="多弧离子镀膜机-02"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="磁控溅射镀膜机-03"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Equipment OEE Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">设备OEE明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipmentMock.map(eq => {
              const isGood = eq.currentOee >= 80
              const isWarning = eq.currentOee >= 70 && eq.currentOee < 80
              return (
                <div key={eq.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{eq.equipmentName}</span>
                      <Badge className={cn("text-xs", getBadgeClassName(getDictColor("dict-equipment-status", eq.equipmentStatus)))}>
                        {getDictLabel("dict-equipment-status", eq.equipmentStatus)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {eq.equipmentNo} · {eq.manufacturer} · {eq.model}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">OEE</p>
                      <p className={cn(
                        "font-bold",
                        isGood ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600"
                      )}>
                        {eq.currentOee}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">可用率</p>
                      <p className="font-semibold text-sm">{Math.round(eq.currentOee * 1.08)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">质量率</p>
                      <p className="font-semibold text-sm">{Math.round(eq.currentOee * 0.95)}%</p>
                    </div>
                  </div>

                  <div className="w-24 shrink-0">
                    <Progress
                      value={eq.currentOee}
                      className={cn("h-2",
                        eq.currentOee >= 80 ? "[&>div]:bg-emerald-500" :
                        eq.currentOee >= 70 ? "[&>div]:bg-amber-500" :
                        "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* OEE Formula */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">OEE 计算公式</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p><span className="font-medium text-foreground">OEE</span> = 可用率 × 性能率 × 质量率</p>
          <p><span className="font-medium text-foreground">可用率</span> = (计划时间 - 停机时间) / 计划时间</p>
          <p><span className="font-medium text-foreground">性能率</span> = (实际产量 × 标准节拍) / 运行时间</p>
          <p><span className="font-medium text-foreground">质量率</span> = 良品数 / 实际产量</p>
        </CardContent>
      </Card>
    </div>
  )
}
