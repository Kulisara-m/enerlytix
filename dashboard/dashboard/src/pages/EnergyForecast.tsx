import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import { forecastStats, actualVsForecastLine } from '../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

export default function EnergyForecast() {
  const lineData = {
    labels: actualVsForecastLine.labels,
    datasets: [
      {
        label: 'Actual',
        data: actualVsForecastLine.actual,
        borderColor: '#2BC5EA',
        backgroundColor: 'rgba(72, 128, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2BC5EA',
        spanGaps: false,
      },
      {
        label: 'Forecast',
        data: actualVsForecastLine.forecast,
        borderColor: '#FF8743',
        borderDash: [6, 4],
        backgroundColor: 'rgba(239, 56, 38, 0.05)',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#FF8743',
        spanGaps: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { family: "'Nunito Sans', sans-serif", size: 13 },
        },
      },
      tooltip: {
        backgroundColor: '#333',
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#888', font: { size: 12, family: "'Nunito Sans', sans-serif" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 12, family: "'Nunito Sans', sans-serif" } },
      },
    },
  };

  const barData = {
    labels: ['Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Actual',
        data: [1980, 1800, 2000],
        backgroundColor: '#2BC5EA',
        borderRadius: 4,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
      {
        label: 'Forecast',
        data: [1900, 2105, 1850],
        backgroundColor: '#FF8743',
        borderRadius: 4,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { family: "'Nunito Sans', sans-serif", size: 13 },
        },
      },
      tooltip: {
        backgroundColor: '#333',
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#888', font: { size: 12, family: "'Nunito Sans', sans-serif" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#888',
          font: { size: 12, family: "'Nunito Sans', sans-serif" },
          callback: (value: number | string) => Number(value).toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="page">
      <TopBar title="Energy Forecast" />
      <div className="page-content">
        {/* Stats */}
        <div className="stat-cards-row">
          {forecastStats.map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              unit={s.unit}
              change={s.change}
              changeColor={s.changeColor}
            />
          ))}
        </div>

        {/* Actual vs Forecast Line Chart */}
        <div className="chart-card">
          <div className="chart-header-row">
            <h2 className="chart-title">Actual vs Forecast (kWh)</h2>
            <div className="accuracy-badge">Accuracy 80%</div>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Actual vs Forecast Bar Chart */}
        <div className="chart-card">
          <h2 className="chart-title">Actual vs Forecast (kWh)</h2>
          <div className="chart-container" style={{ height: 280 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
