import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import TabBar from '../components/TabBar';
import StatCard from '../components/StatCard';
import {
  billOverviewStats,
  billingHistoryMonthly,
  billMonthlyStats,
  billingDetails,
  billingNetTotal,
  billingHistoryDaily,
} from '../data/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TABS = ['Overview', 'Monthly', 'Daily'];

export default function BillCalculator() {
  const [activeTab, setActiveTab] = useState('Overview');

  // ---- OVERVIEW ----
  const overviewBarData = {
    labels: billingHistoryMonthly.labels,
    datasets: [
      {
        label: 'Billing (Baht)',
        data: billingHistoryMonthly.data,
        backgroundColor: '#2BC5EA',
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const overviewBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#333', cornerRadius: 8, padding: 10 },
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

  // ---- MONTHLY / DAILY horizontal bar ----
  const horizontalBarData = {
    labels: billingHistoryDaily.labels,
    datasets: [
      {
        label: 'Usage (kWh)',
        data: billingHistoryDaily.data,
        backgroundColor: '#2BC5EA',
        borderRadius: 3,
        barPercentage: 0.7,
      },
    ],
  };

  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#333', cornerRadius: 8, padding: 10 },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11, family: "'Nunito Sans', sans-serif" } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#888', font: { size: 11, family: "'Nunito Sans', sans-serif" } },
      },
    },
  };

  const monthlyStatsArray = [
    billMonthlyStats.month,
    billMonthlyStats.energyCost,
    billMonthlyStats.ftRate,
    billMonthlyStats.netTotal,
  ];

  if (activeTab === 'Overview') {
    const statsArr = [
      billOverviewStats.totalAnnualBill,
      billOverviewStats.highest,
      billOverviewStats.lowest,
      billOverviewStats.averageMonthly,
    ];
    return (
      <div className="page">
        <TopBar title="Bill Calculator" />
        <div className="page-content">
          <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="stat-cards-row">
            {statsArr.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
          <div className="chart-card">
            <h2 className="chart-title">Billing History</h2>
            <div className="chart-container" style={{ height: 320 }}>
              <Bar data={overviewBarData} options={overviewBarOptions} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Monthly / Daily tabs
  return (
    <div className="page">
      <TopBar title="Bill Calculator" />
      <div className="page-content">
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="stat-cards-row">
          {monthlyStatsArray.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>
        <div className="bottom-row">
          {/* Billing Details */}
          <div className="chart-card bottom-card">
            <h2 className="chart-title">Billing Details</h2>
            <div className="billing-details">
              {billingDetails.map((item, i) => (
                <div key={i} className="billing-row">
                  <div className="billing-tier">
                    <span className="billing-tier-name">{item.tier}</span>
                    {item.rate && <span className="billing-rate">{item.rate}</span>}
                  </div>
                  <span className="billing-amount">{item.amount}</span>
                </div>
              ))}
              <div className="billing-row billing-total">
                <span className="billing-net-label">Net Total</span>
                <span className="billing-net-value">{billingNetTotal} Baht</span>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="chart-card bottom-card">
            <h2 className="chart-title">Billing History</h2>
            <div className="chart-container" style={{ height: 400 }}>
              <Bar data={horizontalBarData} options={horizontalBarOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
