import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { AppShell } from "@/components/layout/app-shell"
import type { MenuItem } from "@/components/layout/sidebar"
import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  ScanLine,
  Activity,
  QrCode,
  FlaskConical,
  TrendingUp,
  FileDown,
  HardDrive,
  ClipboardCheck,
  Gauge,
  Receipt,
  BarChart2,
  Building2,
  Download,
  SlidersHorizontal,
} from "lucide-react"
import "@/styles/globals.css"

const menuItems: MenuItem[] = [
  { label: "仪表盘", href: "/", icon: LayoutDashboard },
  { label: "订单管理", href: "/production/orders", icon: ClipboardList, group: "生产管理" },
  { label: "排产计划", href: "/production/scheduling", icon: CalendarClock, group: "生产管理" },
  { label: "报工管理", href: "/production/reports", icon: ScanLine, group: "生产管理" },
  { label: "生产看板", href: "/production/progress", icon: Activity, group: "生产管理" },
  { label: "批次追溯", href: "/quality/batches", icon: QrCode, group: "质量管理" },
  { label: "质检记录", href: "/quality/inspection", icon: FlaskConical, group: "质量管理" },
  { label: "SPC控制图", href: "/quality/spc", icon: TrendingUp, group: "质量管理" },
  { label: "报告导出", href: "/quality/reports", icon: FileDown, group: "质量管理" },
  { label: "设备台账", href: "/equipment/assets", icon: HardDrive, group: "设备管理" },
  { label: "点检记录", href: "/equipment/inspection", icon: ClipboardCheck, group: "设备管理" },
  { label: "OEE分析", href: "/equipment/oee", icon: Gauge, group: "设备管理" },
  { label: "批次成本", href: "/cost/batches", icon: Receipt, group: "成本管理" },
  { label: "利润分析", href: "/cost/profit", icon: BarChart2, group: "成本管理" },
  { label: "订单进度", href: "/portal/progress", icon: Building2, group: "客户门户" },
  { label: "报告下载", href: "/portal/reports", icon: Download, group: "客户门户" },
  { label: "基础配置", href: "/system/settings", icon: SlidersHorizontal, group: "系统管理" },
]

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "国彩真空 ERP" },
      { name: "description", content: "PVD真空镀膜生产管理系统" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif" }}>
        <AppShell title="国彩真空 ERP" items={menuItems}>
          <Outlet />
        </AppShell>
        <Scripts />
        <NavBridgeScript />
      </body>
    </html>
  )
}

function NavBridgeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function() {
  if (window === window.parent) return;
  var notify = function() {
    window.parent.postMessage({ type: 'preview-navigation', pathname: location.pathname, url: location.href }, '*');
  };
  notify();
  var origPush = history.pushState;
  var origReplace = history.replaceState;
  history.pushState = function() { origPush.apply(this, arguments); notify(); };
  history.replaceState = function() { origReplace.apply(this, arguments); notify(); };
  window.addEventListener('popstate', notify);
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'preview-command') {
      if (e.data.command === 'back') history.back();
      if (e.data.command === 'forward') history.forward();
      if (e.data.command === 'navigate') window.location.href = e.data.url;
    }
  });
})();`,
      }}
    />
  )
}
