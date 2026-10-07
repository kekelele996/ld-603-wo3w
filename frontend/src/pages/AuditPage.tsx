import { useEffect } from "react";
import { useAuditLogStore } from "../stores/AuditLogStore";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate } from "../utils/formatters";

// 审计员视角：只读日志，不提供任何写操作入口
export function AuditPage() {
  const { rows, load } = useAuditLogStore();
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="audit-page">
      <header className="panel">
        <h2>审计日志（只读）</h2>
        <p className="muted">回执报送、整单重试、对账匹配、复核确认/驳回、关单拦截、合格部件写回均留痕。</p>
      </header>
      {rows.length === 0 && <EmptyState title="暂无审计日志" />}
      <table className="detail-table">
        <thead>
          <tr><th>时间</th><th>操作人</th><th>动作</th><th>对象</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatDate(row.created_at)}</td>
              <td>{row.actor}</td>
              <td><code>{row.action}</code></td>
              <td>{row.target_type} #{row.target_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
