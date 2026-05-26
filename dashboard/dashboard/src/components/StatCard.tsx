interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  change?: string;
  changeColor?: string;
  sub?: string;
  status?: string;
  statusColor?: string;
}

export default function StatCard({ label, value, unit, change, changeColor, sub, status, statusColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <div className="stat-value-row">
        <span className="stat-value">{value}</span>
        <span className="stat-unit">{unit}</span>
      </div>
      {change && (
        <p className="stat-change" style={{ color: changeColor || '#00B69B' }}>
          {change}
        </p>
      )}
      {status && (
        <p className="stat-status" style={{ color: statusColor || '#4880FF' }}>
          {status}
        </p>
      )}
      {sub && (
        <p className="stat-sub">{sub}</p>
      )}
    </div>
  );
}
