import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/cost/profit/")({
  component: Placeholder,
})

function Placeholder() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">利润分析</h1>
      <Card className="shadow-sm">
        <CardContent className="py-16 text-center text-muted-foreground">
          该模块尚未生成，请继续对话生成。
        </CardContent>
      </Card>
    </div>
  )
}
