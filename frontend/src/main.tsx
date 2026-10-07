import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import { StatusBadge } from "./components/common/StatusBadge";
import { StatCard } from "./components/common/StatCard";
import { RoleSwitcher } from "./components/common/RoleSwitcher";
import { HazardsPage } from "./pages/HazardsPage";
import { ReconciliationPage } from "./pages/ReconciliationPage";
import { DevicesPage } from "./pages/DevicesPage";
import { AuditPage } from "./pages/AuditPage";
import "./styles.css";

function DashboardPage() {
  const entities = Object.entries(mockData);
  const total = useMemo(() => entities.reduce((sum, [, rows]) => sum + rows.length, 0), [entities]);
  const queue = mockData.maintenanceReceipt.filter((row) => (row.status as string) === "PENDING_REVIEW").length;
  const failed = mockData.maintenanceReceipt.filter((row) => (row.status as string) === "SUBMIT_FAILED").length;
  const openTickets = mockData.hazardTicket.filter((row) => !row.closed_at).length;
  return (
    <main className="page">
      <section className="metrics">
        <StatCard label="待对账回执" value={queue} />
        <StatCard label="报送失败" value={failed} />
        <StatCard label="未关闭整改单" value={openTickets} />
        <StatCard label="本地记录" value={total} />
      </section>
      <section className="panel wide">
        <h2>业务数据</h2>
        <p className="muted">纸质回执已改为按整改单号线上报送，部件/照片自动对账，配不上进对账队列，确认前不关单。</p>
        <div className="table">
          {entities.map(([key, rows]) => (
            <article key={key} className="row">
              <strong>{key}</strong><span>{rows.length} 条</span>
              <StatusBadge value={Object.values(rows[0] ?? {})[1] as string ?? "READY"} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlaceholderPage({ name }: { name: string }) {
  return <section className="panel"><h2>{name}</h2><p className="muted">该模块沿用原有脚手架内容。</p></section>;
}

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");
  const current = routes.find((route) => route.route === active) ?? routes[0];

  const page = (() => {
    switch (active) {
      case "/dashboard": return <DashboardPage />;
      case "/devices": return <DevicesPage />;
      case "/tasks": return <PlaceholderPage name="巡检任务" />;
      case "/hazards": return <HazardsPage />;
      case "/reconciliation": return <ReconciliationPage />;
      case "/reports": return <PlaceholderPage name="合规报表" />;
      case "/audit": return <AuditPage />;
      default: return <DashboardPage />;
    }
  })();

  return (
    <div className="shell">
      <aside>
        <div className="brand">消防设施巡检维保平台</div>
        <nav>
          {routes.map((route) => (
            <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>
              {route.name}
            </button>
          ))}
        </nav>
        <RoleSwitcher />
      </aside>
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">fire-inspect</p>
            <h1>{current?.name ?? "工作台"}</h1>
          </div>
          <StatusBadge value="LOCAL_DATA" />
        </section>
        {page}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
