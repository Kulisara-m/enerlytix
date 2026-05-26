// ============ DASHBOARD DATA ============

export const dashboardStats = {
  overview: {
    totalEnergy: { value: '159,638', unit: 'kWh', label: 'Total Energy (1 Year)', change: '▲ 8.5% from last year', changeColor: '#00B69B' },
    avgPower: { value: '18.2', unit: 'kW', label: 'Avg. Power', status: 'Stable', statusColor: '#4880FF' },
    powerFactor: { value: '0.96', unit: '', label: 'Power Factor', status: 'Normal', statusColor: '#00B69B' },
    avgVoltage: { value: '232.9', unit: 'V', label: 'Avg. Voltage', status: 'Normal', statusColor: '#00B69B' },
    peakPower: { value: '29.2', unit: 'kW', label: 'Peak Power', status: '08/05/22 21:00', statusColor: '#EF3826' },
  },
  monthly: {
    totalEnergy: { value: '28,900', unit: 'kWh', label: 'Total Energy (1 month)', change: '▲ 3.5% from last month', changeColor: '#00B69B' },
    avgPower: { value: '18.2', unit: 'kW', label: 'Avg. Power', status: 'Stable', statusColor: '#4880FF' },
    powerFactor: { value: '0.96', unit: '', label: 'Power Factor', status: 'Normal', statusColor: '#00B69B' },
    avgVoltage: { value: '232.9', unit: 'V', label: 'Avg. Voltage', status: 'Normal', statusColor: '#00B69B' },
    peakPower: { value: '29.2', unit: 'kW', label: 'Peak Power', status: '08/05/22 21:00', statusColor: '#EF3826' },
  },
  daily: {
    totalEnergy: { value: '980', unit: 'kWh', label: 'Total Energy (1 day)', change: '▲ 4.5% from yesterday', changeColor: '#00B69B' },
    avgPower: { value: '18.2', unit: 'kW', label: 'Avg. Power', status: 'Stable', statusColor: '#4880FF' },
    powerFactor: { value: '0.96', unit: '', label: 'Power Factor', status: 'Normal', statusColor: '#00B69B' },
    avgVoltage: { value: '232.9', unit: 'V', label: 'Avg. Voltage', status: 'Normal', statusColor: '#00B69B' },
    peakPower: { value: '29.2', unit: 'kW', label: 'Peak Power', status: '04/05/22 21:55', statusColor: '#EF3826' },
  },
};

export const energyTrendOverview = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: [35, 30, 38, 32, 88, 45, 40, 50, 30, 42, 48, 45],
};

export const energyTrendMonthly = {
  labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
  data: [20, 18, 22, 15, 25, 30, 28, 35, 20, 88, 40, 38, 35, 30, 45, 42, 40, 38, 50, 48, 45, 55, 50, 48, 42, 55, 50, 48, 45, 42],
};

export const energyTrendDaily = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  data: [15, 12, 10, 18, 88, 45, 35, 40, 50, 55, 48, 42],
};

export const circuitBreakdown = {
  labels: ['Air Conditioner', 'Water Heater', 'Refrigerator', 'Washer/Dryer', 'Other'],
  data: [38, 18, 14, 12, 18],
  colors: ['#4880FF', '#FF8743', '#00B69B', '#2BC5EA', '#A855F7'],
};

// Daily usage pattern heatmap data (hours x days)
export const dailyUsagePattern = {
  // 24 hours of usage intensity (0-4 scale: 0=low, 4=high)
  overview: [
    [1, 1, 0, 0, 0, 1, 2, 3, 3, 2, 2, 3, 3, 2, 2, 3, 4, 4, 3, 3, 2, 2, 1, 1],
  ],
  hourLabels: Array.from({ length: 24 }, (_, i) => String(i)),
};

// ============ ENERGY FORECAST DATA ============

export const forecastStats = [
  { label: 'August (Forecast)', value: '1,980', unit: 'kWh', change: '▲ 8.5% Up from Jul', changeColor: '#00B69B', icon: 'up' },
  { label: 'September (Forecast)', value: '2,105', unit: 'kWh', change: '▲ 1.3% Up from Aug', changeColor: '#00B69B', icon: 'up' },
  { label: 'October (Forecast)', value: '1,850', unit: 'kWh', change: '▼ 4.3% Down from Sep', changeColor: '#EF3826', icon: 'down' },
  { label: 'August Electricity (Forecast)', value: '6,820', unit: 'Baht', change: '▲ 1.8% Up from Jul', changeColor: '#00B69B', icon: 'up' },
];

export const actualVsForecastLine = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  actual: [40, 42, 45, 48, 50, 55, 60, null, null, null, null, null],
  forecast: [null, null, null, null, null, null, 60, 65, 70, 68, 72, 75],
};

export const actualVsForecastBar = {
  labels: ['Jul', 'Aug', 'Sep'],
  actual: [1980, 1800, null],
  forecast: [null, 2105, 1900],
  forecastFull: [null, 2105, 1850],
  actualValues: [1980, 1800, 2000],
};

// ============ BILL CALCULATOR DATA ============

export const billOverviewStats = {
  totalAnnualBill: { value: '100,320', unit: 'Baht', label: 'Total Annual Bill', change: '▲ 8.5% Up from last year', changeColor: '#00B69B' },
  highest: { value: '5,614', unit: 'Baht', label: 'Highest', sub: '+ VAT 7%' },
  lowest: { value: '1,390', unit: 'Baht', label: 'Lowest', sub: '+ VAT 7%' },
  averageMonthly: { value: '6,240', unit: 'Baht', label: 'Average Monthly Bill', sub: '+ VAT 7%' },
};

export const billingHistoryMonthly = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: [62000, 65000, 68000, 70000, 58000, 55000, 60000, 62000, 58000, 55000, 50000, 45000],
};

export const billMonthlyStats = {
  month: { value: '1,842', unit: 'kWh', label: 'August', change: '▲ 8.5% Up from Jul', changeColor: '#00B69B' },
  energyCost: { value: '5,614', unit: 'Baht', label: 'Energy Cost', sub: 'Before FT & VAT' },
  ftRate: { value: '+380', unit: 'Baht', label: 'FT Rate' },
  netTotal: { value: '6,240', unit: 'Baht', label: 'Net Total', sub: '+ VAT 7%' },
};

export const billingDetails = [
  { tier: '0-150 kWh', rate: '3.2484 Baht/kWh', amount: '487.26 Baht' },
  { tier: '151-400 kWh', rate: '4.2218 Baht/kWh', amount: '1,055.45 Baht' },
  { tier: '>400 kWh', rate: '4.4217 Baht/kWh', amount: '4,071.31 Baht' },
  { tier: 'Service Fee', rate: '', amount: '38.22 Baht' },
  { tier: 'FT Rate', rate: '', amount: '380.37 Baht' },
  { tier: 'VAT 7%', rate: '', amount: '407.59 Baht' },
];

export const billingNetTotal = '6,240';

export const billingHistoryDaily = {
  labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
  data: [85, 75, 70, 80, 90, 65, 60, 55, 78, 82, 88, 72, 68, 95, 88, 70, 65, 60, 55, 50, 75, 80, 85, 92, 78, 72, 68, 62, 58, 55],
};

// ============ ALERT DATA ============

export const alertData = [
  {
    date: '04 Sep 2026',
    time: '2 AM',
    topic: 'Voltage Drop',
    description: 'แรงดันไฟเฉลี่ยต่ำกว่า 200V เกิน 2 ชั่วโมง',
    severity: 'Warning',
    severityColor: '#FFA756',
  },
  {
    date: '04 Sep 2026',
    time: '4 AM',
    topic: 'Overload',
    description: 'Circuit 4 ใช้กระแสไฟเกิน 20A',
    severity: 'Critical',
    severityColor: '#EF3826',
  },
];
