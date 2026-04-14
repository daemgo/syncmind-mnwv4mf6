import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { AppShell } from "@/components/layout/app-shell"
import type { MenuItem } from "@/components/layout/sidebar"
import {
  LayoutDashboard, Package, ShieldCheck, Cog, Coins, Building2, Settings,
  ShoppingCart, CalendarDays, ClipboardList, BarChart3,
  ScanBarcode, FileSearch, AlertTriangle, FileDown,
  Archive, Wrench, TrendingUp,
  Receipt, PieChart,
  Download, Eye
} from "lucide-react"
import "@/styles/globals.css"

const menuItems: MenuItem[] = [
  {
    label: "生产管理",
    icon: Package,
    children: [
      { label: "订单管理", href: "/production/orders", icon: ShoppingCart },
      { label: "排产计划", href: "/production/scheduling", icon: CalendarDays },
      { label: "报工管理", href: "/production/reports", icon: ClipboardList },
      { label: "生产看板", href: "/production/progress", icon: BarChart3 },
    ],
  },
  {
    label: "质量管理",
    icon: ShieldCheck,
    children: [
      { label: "批次追溯", href: "/quality/batches", icon: ScanBarcode },
      { label: "质检记录", href: "/quality/inspection", icon: FileSearch },
      { label: "SPC控制图", href: "/quality/spc", icon: AlertTriangle },
      { label: "报告导出", href: "/quality/reports", icon: FileDown },
    ],
  },
  {
    label: "设备管理",
    icon: Cog,
    children: [
      { label: "设备台账", href: "/equipment/assets", icon: Archive },
      { label: "点检记录", href: "/equipment/inspection", icon: Wrench },
      { label: "OEE分析", href: "/equipment/oee", icon: TrendingUp },
    ],
  },
  {
    label: "成本管理",
    icon: Coins,
    children: [
      { label: "批次成本", href: "/cost/batches", icon: Receipt },
      { label: "利润分析", href: "/cost/profit", icon: PieChart },
    ],
  },
  {
    label: "客户门户",
    icon: Building2,
    children: [
      { label: "订单进度", href: "/portal/progress", icon: Eye },
      { label: "报告下载", href: "/portal/reports", icon: Download },
    ],
  },
  {
    label: "系统管理",
    icon: Settings,
    children: [
      { label: "基础配置", href: "/system/settings", icon: Settings },
    ],
  },
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
