import TopBar from '../components/TopBar';
import { alertData } from '../data/mockData';

export default function Alert() {
  return (
    <div className="page">
      <TopBar title="Alert" />
      <div className="page-content">
        <div className="chart-card">
          <table className="alert-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME</th>
                <th>TOPIC</th>
                <th>DESCRIPTION</th>
                <th>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {alertData.map((alert, i) => (
                <tr key={i}>
                  <td>{alert.date}</td>
                  <td>{alert.time}</td>
                  <td>{alert.topic}</td>
                  <td>{alert.description}</td>
                  <td>
                    <span
                      className="severity-badge"
                      style={{
                        color: alert.severityColor,
                        backgroundColor: `${alert.severityColor}20`,
                      }}
                    >
                      {alert.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
