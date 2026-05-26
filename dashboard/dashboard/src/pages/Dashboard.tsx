import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import TabBar from '../components/TabBar';
import StatCard from '../components/StatCard';
import {
  dashboardStats,
  energyTrendOverview,
  energyTrendMonthly,
  energyTrendDaily,
  circuitBreakdown,
  dailyUsagePattern,
} from '../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

const TABS = ['Overview', 'Monthly', 'Daily'];

const HEATMAP_COLORS = ['#E8F5E9', '#A5D6A7', '#FDD835', '#FF7043', '#D32F2F'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  const getStats = () => {
    if (activeTab === 'Monthly') return dashboardStats.monthly;
    if (activeTab === 'Daily') return dashboardStats.daily;
    return dashboardStats.overview;
  };

  const getTrendData = () => {
    if (activeTab === 'Monthly') return energyTrendMonthly;
    if (activeTab === 'Daily') return energyTrendDaily;
    return energyTrendOverview;
  };

  const stats = getStats();
  const trendData = getTrendData();
  const statsArray = Object.values(stats);

  const lineChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Energy (kWh)',
        data: trendData.data,
        borderColor: '#4880FF',
        backgroundColor: 'rgba(72, 128, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#4880FF',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#4880FF',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#4880FF',
        titleColor: '#fff',
        bodyColor: '#fff',
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

  const doughnutData = {
    labels: circuitBreakdown.labels,
    datasets: [
      {
        data: circuitBreakdown.data,
        backgroundColor: circuitBreakdown.colors,
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const heatmapData = dailyUsagePattern.overview;
  const heatmapHours = dailyUsagePattern.hourLabels;

  return (
    <div className="page">
      <TopBar title="Dashboard" />
      <div className="page-content">
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Stat Cards */}
        <div className="stat-cards-row">
          {statsArray.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Energy Trend */}
        <div className="chart-card">
          <h2 className="chart-title">Energy Trend</h2>
          <div className="chart-container" style={{ height: 280 }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Bottom Row: Circuit Breakdown + Daily Usage Pattern */}
        <div className="bottom-row">
          <div className="chart-card bottom-card">
            <h2 className="chart-title">Circuit Breakdown</h2>
            <div className="circuit-content">
              <div className="doughnut-wrapper">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="circuit-legend">
                {circuitBreakdown.labels.map((label, i) => (
                  <div key={label} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: circuitBreakdown.colors[i] }}
                    />
                    <span className="legend-label">{label}</span>
                    <span className="legend-value">{circuitBreakdown.data[i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card bottom-card">
            <h2 className="chart-title">Daily Usage Pattern</h2>
            <div className="heatmap-container">
              <div className="heatmap-hours">
                {heatmapHours.map((h) => (
                  <span key={h} className="heatmap-hour-label">{h}</span>
                ))}
              </div>
              <div className="heatmap-grid">
                {heatmapData.map((row, ri) => (
                  <div key={ri} className="heatmap-row">
                    {row.map((val, ci) => (
                      <div
                        key={ci}
                        className="heatmap-cell"
                        style={{ backgroundColor: HEATMAP_COLORS[val] }}
                        title={`Hour ${ci}: Level ${val}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Low</span>
                {HEATMAP_COLORS.map((c, i) => (
                  <div key={i} className="heatmap-legend-cell" style={{ backgroundColor: c }} />
                ))}
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
