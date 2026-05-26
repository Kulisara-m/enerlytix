const state = { page: "dashboard", period: "monthly" };
const pages = { dashboard: "Dashboard", forecast: "Energy Forecast", bill: "Bill Calculator", alert: "Alert" };
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dateState = { day: 4, month: 7, year: 2020 };
const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
const monthShift = offset => (dateState.month + offset + 12) % 12;
const monthLabel = offset => monthNames[monthShift(offset)];
const selectedDate = () => `${String(dateState.day).padStart(2, '0')} ${monthNames[dateState.month]} ${dateState.year}`;
const daySeed = () => (dateState.year * 372 + dateState.month * 31 + dateState.day);
const seededValue = (index, min, max) => {
  const raw = Math.sin((daySeed() + index * 17.17) * 12.9898) * 43758.5453;
  return Math.round(min + (raw - Math.floor(raw)) * (max - min));
};

// Date display
const dateEl = document.getElementById('currentDate');
function updateCurrentDate() {
  if (dateEl) dateEl.textContent = selectedDate();
}

function trendIcon(down) {
  const color = down ? '#ff4d6a' : '#00c48c';
  const arrow = down ? '▼' : '▲';
  return `<span style="color:${color}">${arrow}</span>`;
}

function metric({ title, value, unit, note, percent, down, status }) {
  let footer = '';
  if (status) {
    const cls = status.type === 'peak' ? 'warn' : 'stable';
    footer = `<div class="metric-footer ${cls}">${status.text}</div>`;
  } else if (percent) {
    footer = `<div class="metric-footer ${down ? 'down' : 'up'}">${trendIcon(down)} ${percent} ${note}</div>`;
  }
  return `<article class="metric">
    <div class="metric-label">${title}</div>
    <div class="metric-value"><span>${value}</span>${unit ? `<span class="metric-unit">${unit}</span>` : ''}</div>
    ${footer}
  </article>`;
}

function dateControls() {
  const numDays = daysInMonth(dateState.month, dateState.year);
  const dayPill = makePill('day', String(dateState.day).padStart(2, '0'), Array.from({ length: numDays }, (_, i) => ({ val: i + 1, label: String(i + 1).padStart(2, '0') })));
  const monthPill = makePill('month', monthNames[dateState.month], monthNames.map((m, i) => ({ val: i, label: m })));
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const yearPill = makePill('year', String(dateState.year), years.map(y => ({ val: y, label: String(y) })));
  if (state.period === 'daily') return dayPill + monthPill + yearPill;
  if (state.period === 'monthly') return monthPill + yearPill;
  return yearPill;
}

function makePill(type, display, items) {
  const cur = dateState[type];
  const dropdown = items.map(it => `<div class="dropdown-item${it.val == cur ? ' active' : ''}" data-type="${type}" data-val="${it.val}">${it.label}</div>`).join('');
  return `<span class="select-pill" data-picker="${type}">${display}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg><div class="dropdown">${dropdown}</div></span>`;
}

function calcDerivedMetrics() {
  // Total energy: seeded around base values
  const totalYear = 9000 + seededValue(100, 200, 800);
  const totalMonth = 800 + seededValue(101, 80, 260);
  const totalDay = 60 + seededValue(102, 5, 25);
  const prevYear = 9000 + seededValue(200, 200, 800);
  const prevMonth = 800 + seededValue(201, 80, 260);
  const prevDay = 60 + seededValue(202, 5, 25);
  const pctYear = (((totalYear - prevYear) / prevYear) * 100).toFixed(1) + '%';
  const pctMonth = (((totalMonth - prevMonth) / prevMonth) * 100).toFixed(1) + '%';
  const pctDay = (((totalDay - prevDay) / prevDay) * 100).toFixed(1) + '%';
  const downYear = totalYear < prevYear;
  const downMonth = totalMonth < prevMonth;
  const downDay = totalDay < prevDay;

  // Avg power: 0.7–0.9 kW → Stable
  const avgPower = (0.70 + (seededValue(103, 0, 200) / 1000)).toFixed(2);
  // Power Factor: 0.92–0.96 → Normal
  const pf = (0.92 + (seededValue(104, 0, 40) / 1000)).toFixed(2);
  // Avg Voltage: 220–240 V → Normal
  const voltage = 220 + seededValue(105, 0, 20);

  // Peak power: seeded value for the selected date/period
  const peakPower = (4.5 + seededValue(106, 0, 20) / 10).toFixed(2);
  const peakHour = String(18 + seededValue(107, 0, 5)).padStart(2, '0') + ':00';
  let peakDateStr;
  if (state.period === 'daily') {
    peakDateStr = `${String(dateState.day).padStart(2, '0')}/${String(dateState.month + 1).padStart(2, '0')}/${String(dateState.year).slice(-2)} ${peakHour}`;
  } else if (state.period === 'monthly') {
    const peakDay = 1 + seededValue(108, 0, daysInMonth(dateState.month, dateState.year) - 1);
    peakDateStr = `${String(peakDay).padStart(2, '0')}/${String(dateState.month + 1).padStart(2, '0')}/${String(dateState.year).slice(-2)} ${peakHour}`;
  } else {
    const peakMon = 1 + seededValue(109, 0, 11);
    const peakDay = 1 + seededValue(110, 0, 27);
    peakDateStr = `${String(peakDay).padStart(2, '0')}/${String(peakMon).padStart(2, '0')}/${String(dateState.year).slice(-2)} ${peakHour}`;
  }

  return { totalYear, totalMonth, totalDay, pctYear, pctMonth, pctDay, downYear, downMonth, downDay, avgPower, pf, voltage, peakPower, peakDateStr };
}

function setMetrics() {
  const m = calcDerivedMetrics();
  const dash = {
    overview: [
      { title: "Total Energy (1 Year)", value: m.totalYear.toLocaleString(), unit: "kWh", note: "from last year", percent: m.pctYear, down: m.downYear },
      { title: "Avg. Power", value: m.avgPower, unit: "kW", status: { text: "Stable" } },
      { title: "Power Factor", value: m.pf, unit: "", status: { text: "Normal" } },
      { title: "Avg. Voltage", value: String(m.voltage), unit: "V", status: { text: "Normal" } },
      { title: "Peak Power", value: m.peakPower, unit: "kW", status: { text: m.peakDateStr, type: "peak" } }
    ],
    monthly: [
      { title: "Total Energy (1 Month)", value: m.totalMonth.toLocaleString(), unit: "kWh", note: "from last month", percent: m.pctMonth, down: m.downMonth },
      { title: "Avg. Power", value: m.avgPower, unit: "kW", status: { text: "Stable" } },
      { title: "Power Factor", value: m.pf, unit: "", status: { text: "Normal" } },
      { title: "Avg. Voltage", value: String(m.voltage), unit: "V", status: { text: "Normal" } },
      { title: "Peak Power", value: m.peakPower, unit: "kW", status: { text: m.peakDateStr, type: "peak" } }
    ],
    daily: [
      { title: "Total Energy (1 Day)", value: m.totalDay.toLocaleString(), unit: "kWh", note: "from yesterday", percent: m.pctDay, down: m.downDay },
      { title: "Avg. Power", value: m.avgPower, unit: "kW", status: { text: "Stable" } },
      { title: "Power Factor", value: m.pf, unit: "", status: { text: "Normal" } },
      { title: "Avg. Voltage", value: String(m.voltage), unit: "V", status: { text: "Normal" } },
      { title: "Peak Power", value: m.peakPower, unit: "kW", status: { text: m.peakDateStr, type: "peak" } }
    ]
  };

  // Forecast metrics — percentages computed from seeded values
  const fc0 = 1900 + seededValue(1, 40, 260);
  const fc1 = 1980 + seededValue(2, 60, 290);
  const fc2 = 1800 + seededValue(3, 30, 220);
  const fcElec = 6200 + seededValue(4, 80, 740);
  const fcPrev0 = 1900 + seededValue(21, 40, 260);
  const fcPrev1 = 1980 + seededValue(22, 60, 290);
  const fcPrev2 = 1800 + seededValue(23, 30, 220);
  const fcPrevElec = 6200 + seededValue(24, 80, 740);
  const fcPct0 = Math.abs(((fc0 - fcPrev0) / fcPrev0) * 100).toFixed(1) + '%';
  const fcPct1 = Math.abs(((fc1 - fcPrev1) / fcPrev1) * 100).toFixed(1) + '%';
  const fcPct2 = Math.abs(((fc2 - fcPrev2) / fcPrev2) * 100).toFixed(1) + '%';
  const fcPct3 = Math.abs(((fcElec - fcPrevElec) / fcPrevElec) * 100).toFixed(1) + '%';

  const forecast = [
    { title: `${monthLabel(0)} (Forecast)`, value: fc0.toLocaleString(), unit: "kWh", note: `from ${monthLabel(-1)}`, percent: fcPct0, down: fc0 < fcPrev0 },
    { title: `${monthLabel(1)} (Forecast)`, value: fc1.toLocaleString(), unit: "kWh", note: `from ${monthLabel(0)}`, percent: fcPct1, down: fc1 < fcPrev1 },
    { title: `${monthLabel(2)} (Forecast)`, value: fc2.toLocaleString(), unit: "kWh", note: `from ${monthLabel(1)}`, percent: fcPct2, down: fc2 < fcPrev2 },
    { title: `${monthLabel(0)} Electricity`, value: fcElec.toLocaleString(), unit: "฿", note: `from ${monthLabel(-1)}`, percent: fcPct3, down: fcElec < fcPrevElec }
  ];

  // Bill metrics — amounts change with seeded values
  const billTotal = 95000 + seededValue(30, 1000, 8000);
  const prevBillTotal = 95000 + seededValue(130, 1000, 8000);
  const billPct = Math.abs(((billTotal - prevBillTotal) / prevBillTotal) * 100).toFixed(1) + '%';
  const monthUsage = 1700 + seededValue(5, 50, 260);
  const prevMonthUsage = 1700 + seededValue(55, 50, 260);
  const monthPct = Math.abs(((monthUsage - prevMonthUsage) / prevMonthUsage) * 100).toFixed(1) + '%';
  const energyCost = 4800 + seededValue(31, 200, 900);
  const ftRate = 350 + seededValue(32, 10, 60);
  const netTotal = Math.round((energyCost + ftRate) * 1.07);

  const bill = state.period === 'overview' ? [
    { title: "Total", value: billTotal.toLocaleString(), unit: "฿", note: "from last year", percent: billPct, down: billTotal < prevBillTotal },
    { title: "Highest Month", value: (6800 + seededValue(33, 100, 400)).toLocaleString(), unit: "฿", status: { text: "+ VAT 7%" } },
    { title: "Lowest Month", value: (1200 + seededValue(34, 50, 300)).toLocaleString(), unit: "฿", status: { text: "+ VAT 7%" } },
    { title: "Monthly Average", value: Math.round(billTotal / 12).toLocaleString(), unit: "฿", status: { text: "+ VAT 7%" } }
  ] : [
    { title: `${monthLabel(0)} Usage`, value: monthUsage.toLocaleString(), unit: "kWh", note: `from ${monthLabel(-1)}`, percent: monthPct, down: monthUsage < prevMonthUsage },
    { title: "Energy Cost", value: energyCost.toLocaleString(), unit: "฿", status: { text: "Before FT & VAT" } },
    { title: "FT Rate", value: `+${ftRate}`, unit: "฿", status: { text: "Fuel Tariff" } },
    { title: "Net Total", value: netTotal.toLocaleString(), unit: "฿", status: { text: "+ VAT 7%" } }
  ];

  document.querySelector('#dashboardMetrics').innerHTML = dash[state.period].map(d => metric(d)).join('');
  document.querySelector('#forecastMetrics').innerHTML = forecast.map(d => metric(d)).join('');
  document.querySelector('#billMetrics').innerHTML = bill.map(d => metric(d)).join('');
}

// ─── SVG helpers ───
const C = {
  teal: '#2d7ff9', orange: '#ff7a45', blue: '#4f8fff',
  line: '#dde0eb', text: '#8a90a0', white: '#fff',
  bg: '#ffffff', gridLine: 'rgba(0,0,0,0.05)'
};

// Auto-scale: compute a nice max and ticks from data
function niceScale(dataMax, tickCount = 6) {
  if (dataMax <= 0) return { max: 10, ticks: [0, 2, 4, 6, 8, 10] };
  const rawStep = dataMax / (tickCount - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceSteps = [1, 2, 2.5, 5, 10];
  const step = niceSteps.map(s => s * mag).find(s => s >= rawStep) || niceSteps[niceSteps.length - 1] * mag;
  const niceMax = Math.ceil(dataMax / step) * step;
  const ticks = Array.from({ length: Math.round(niceMax / step) + 1 }, (_, i) => parseFloat((i * step).toFixed(6)));
  return { max: niceMax, ticks };
}

function lineChart({ values, labels, max, color = C.teal, fill = false, height = 300, yTicks, autoScale = false }) {
  // Auto-scale if requested or if max not provided
  let useMax = max, useTicks = yTicks;
  if (autoScale || max == null) {
    const dataMax = Math.max(...values);
    const scaled = niceScale(dataMax * 1.1);
    useMax = scaled.max;
    useTicks = scaled.ticks;
  }
  if (!useTicks) {
    const { ticks } = niceScale(useMax);
    useTicks = ticks;
  }

  const w = Math.min(window.innerWidth - 320, 1200), h = height, left = 72, right = 20, top = 20, bottom = 40;
  const cw = w - left - right, ch = h - top - bottom;
  const pts = values.map((v, i) => [left + (cw * i) / (values.length - 1), top + ch - (v / useMax) * ch]);
  const curvePath = points => points.map((p, i) => {
    if (i === 0) return `M${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    const prev = points[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `C${cx.toFixed(1)},${prev[1].toFixed(1)} ${cx.toFixed(1)},${p[1].toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  }).join(' ');
  const d = curvePath(pts);
  const area = `${d} L${pts[pts.length - 1][0]},${top + ch} L${pts[0][0]},${top + ch} Z`;
  const gridY = useTicks.map(t => {
    const y = top + ch - (t / useMax) * ch;
    const label = t >= 1000 ? (t / 1000).toFixed(t % 1000 === 0 ? 0 : 1) + 'k' : t % 1 !== 0 ? t.toFixed(1) : String(t);
    return `<line x1="${left}" x2="${w - right}" y1="${y}" y2="${y}" stroke="${C.gridLine}"/>
            <text x="${left - 10}" y="${y + 4}" text-anchor="end" fill="${C.text}" font-size="12" font-family="Space Mono">${label}</text>`;
  }).join('');
  // Thin x-labels for daily (24 pts) & monthly (30 pts) — skip crowded ones
  const xStep = values.length > 20 ? Math.ceil(values.length / 12) : 1;
  const gridX = labels.map((lab, i) => {
    if (i % xStep !== 0 && i !== labels.length - 1) return '';
    const x = left + (cw * i) / (labels.length - 1);
    return `<text x="${x}" y="${top + ch + 24}" text-anchor="middle" fill="${C.text}" font-size="12">${lab}</text>`;
  }).join('');
  const uid = `lc${Math.random().toString(36).slice(2, 6)}`;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">

    <defs>
      <linearGradient id="${uid}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${color}" stop-opacity=".3"/>
        <stop offset="1" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
      <filter id="${uid}glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="transparent"/>
    ${gridY}${gridX}
    <line x1="${left}" x2="${w - right}" y1="${top + ch}" y2="${top + ch}" stroke="${C.line}"/>
    ${fill ? `<path d="${area}" fill="url(#${uid})"/>` : ''}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#${uid}glow)"/>
    ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="${C.bg}" stroke-width="2"><title>${labels[i]}: ${values[i]}</title></circle>`).join('')}
  </svg>`;
}

function forecastLineChart() {
  const w = Math.min(window.innerWidth - 320, 1200), h = 300, left = 64, right = 30, top = 16, bottom = 40, max = 100;
  const actual = [30, 33, 36, 38, 44, 50, 60];
  const forecast = [60, 66, 72, 78, 70, 60];
  const bandHi = [60, 68, 74, 83, 74, 66];
  const bandLo = [60, 64, 68, 72, 62, 52];
  const cw = w - left - right, ch = h - top - bottom;
  const x = i => left + (cw * i) / 11;
  const y = v => top + ch - (v / max) * ch;
  const apt = actual.map((v, i) => [x(i), y(v)]);
  const fpt = forecast.map((v, i) => [x(i + 6), y(v)]);
  const hiPt = bandHi.map((v, i) => [x(i + 6), y(v)]);
  const loPt = bandLo.map((v, i) => [x(i + 6), y(v)]).reverse();
  const d = pts => pts.map((p, i) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }).join(' ');
  const band = `${d(hiPt)} ${loPt.map(p => `L${p[0]},${p[1]}`).join(' ')} Z`;
  const gridY = [20, 40, 60, 80, 100].map(t => `<text x="${left - 10}" y="${y(t) + 4}" text-anchor="end" fill="${C.text}" font-size="12" font-family="Space Mono">${t}</text>`).join('');
  const forecastMonths = Array.from({ length: 12 }, (_, i) => monthNames[(dateState.month + i) % 12]);
  const xLab = forecastMonths.map((lab, i) => `<text x="${x(i)}" y="${top + ch + 28}" text-anchor="middle" fill="${C.text}" font-size="12">${lab}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="bandFill" x1="0" x2="1"><stop stop-color="${C.orange}" stop-opacity=".15"/><stop offset="1" stop-color="${C.orange}" stop-opacity=".05"/></linearGradient>
      <filter id="cGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${gridY}${xLab}
    <path d="${band}" fill="url(#bandFill)"/>
    <path d="${d(apt)}" fill="none" stroke="${C.teal}" stroke-width="2.5" stroke-linecap="round" filter="url(#cGlow)"/>
    <path d="${d(fpt)}" fill="none" stroke="${C.orange}" stroke-width="2.5" stroke-dasharray="8 5" stroke-linecap="round"/>
    <line x1="${x(6)}" x2="${x(6)}" y1="${top + 16}" y2="${top + ch - 10}" stroke="#ffb830" stroke-width="1.5" stroke-dasharray="5 4" opacity=".7"/>
    <text x="${x(6) + 6}" y="${top + 30}" fill="#ffb830" font-size="12" font-weight="700" font-family="Space Mono">NOW</text>
  </svg>`;
}

function groupedBars() {
  const w = Math.min(window.innerWidth - 320, 1100), h = 260, left = 100, right = 20, top = 24, bottom = 42, max = 2500;
  // Months starting from selected month going forward
  const labels = [monthLabel(0), monthLabel(1), monthLabel(2)];
  const forecast = [1880 + seededValue(9, 40, 180), 1980 + seededValue(10, 60, 210), 1850 + seededValue(11, 30, 180)];
  const actual = [1760 + seededValue(12, 30, 160), 1860 + seededValue(13, 40, 190), 1900 + seededValue(14, 30, 160)];
  const cw = w - left - right, ch = h - top - bottom;
  const grid = [0, 500, 1000, 1500, 2000, 2500].map(v => {
    const y = top + ch - (v / max) * ch;
    return `<line x1="${left}" x2="${w - right}" y1="${y}" y2="${y}" stroke="${C.gridLine}"/>
            <text x="${left - 10}" y="${y + 5}" text-anchor="end" fill="${C.text}" font-size="12" font-family="Space Mono">${v.toLocaleString()}</text>`;
  }).join('');
  const bars = labels.map((lab, i) => {
    const gx = left + (cw / 3) * i + 24, bw = 120, gap = 10;
    const fy = top + ch - (forecast[i] / max) * ch, ay = top + ch - (actual[i] / max) * ch;
    return `<g>
      <text x="${gx + bw / 2}" y="${fy - 7}" text-anchor="middle" fill="${C.text}" font-size="12" font-family="Space Mono">${forecast[i].toLocaleString()}</text>
      <text x="${gx + bw + gap + bw / 2}" y="${ay - 7}" text-anchor="middle" fill="${C.text}" font-size="12" font-family="Space Mono">${actual[i].toLocaleString()}</text>
      <rect x="${gx}" y="${fy}" width="${bw}" height="${top + ch - fy}" rx="10" fill="${C.orange}" opacity=".85" data-value="${forecast[i]} kWh (Forecast)"/>
      <rect x="${gx + bw + gap}" y="${ay}" width="${bw}" height="${top + ch - ay}" rx="10" fill="${C.teal}" opacity=".85" data-value="${actual[i]} kWh (Actual)"/>
      <text x="${gx + bw + gap / 2}" y="${top + ch + 28}" text-anchor="middle" fill="${C.text}" font-size="14" font-weight="600">${lab}</text>
    </g>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">${grid}${bars}</svg>`;
}

function horizontalBars() {
  const isDaily = state.period === 'daily';
  const rowCount = isDaily ? daysInMonth(dateState.month, dateState.year) : 12;
  const labels = isDaily
    ? Array.from({ length: rowCount }, (_, i) => String(i + 1).padStart(2, '0'))
    : monthNames;
  const bills = Array.from({ length: rowCount }, (_, i) => {
    const base = isDaily ? 120 + (i % 7) * 18 : [4820, 5310, 4590, 5640, 6120, 7240, 6890, 6240, 5760, 6430, 5980, 5120][i];
    return base + seededValue(i + 40, isDaily ? 10 : -260, isDaily ? 90 : 320);
  });
  const activeMonth = isDaily ? dateState.day - 1 : dateState.month;
  const maxVal = Math.max(...bills);
  const avg = Math.round(bills.reduce((a, b) => a + b, 0) / bills.length);

  // Sparkline trend path
  const sw = 120, sh = 28, spad = 6;
  const spts = bills.map((v, i) => {
    const x = spad + (sw - spad * 2) * i / (bills.length - 1);
    const y = spad + (sh - spad * 2) * (1 - (v - Math.min(...bills)) / (maxVal - Math.min(...bills)));
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const rows = bills.map((v, i) => {
    const pct = v / maxVal;
    const isActive = i === activeMonth;
    const isHigh = v === maxVal;
    const barColor = isActive ? C.teal : isHigh ? '#f87171' : '#93c5fd';
    const barAlpha = isActive ? '1' : isHigh ? '0.85' : '0.6';
    const textColor = isActive ? C.teal : isHigh ? '#dc2626' : 'var(--sub)';
    const bgColor = isActive ? 'rgba(59,130,246,0.04)' : 'transparent';
    const pctOfAvg = Math.round((v / avg - 1) * 100);
    const trend = pctOfAvg >= 0 ? `+${pctOfAvg}%` : `${pctOfAvg}%`;
    const trendColor = pctOfAvg > 10 ? '#dc2626' : pctOfAvg < -5 ? '#16a34a' : 'var(--muted)';

    return `
      <div style="display:grid;grid-template-columns:38px 1fr 80px 70px;align-items:center;gap:10px;
                  padding:7px 20px 7px 16px;background:${bgColor};
                  border-left:3px solid ${isActive ? C.teal : 'transparent'};
                  transition:background .15s;"
           onmouseover="this.style.background='rgba(59,130,246,0.04)'"
           onmouseout="this.style.background='${bgColor}'">
        <span style="font-family:var(--mono);font-size:11px;font-weight:700;color:${textColor};text-align:right;">${labels[i]}</span>
        <div style="position:relative;height:10px;background:var(--line2);border-radius:99px;overflow:hidden;">
          <div style="position:absolute;left:0;top:0;height:100%;width:${(pct * 100).toFixed(1)}%;
                      background:${barColor};opacity:${barAlpha};border-radius:99px;
                      transition:width .4s cubic-bezier(.4,0,.2,1);"></div>
        </div>
        <span style="font-family:var(--mono);font-size:12px;font-weight:700;color:${textColor};text-align:right;white-space:nowrap;">${v.toLocaleString()} ฿</span>
        <span style="font-size:11px;font-weight:700;color:${trendColor};text-align:right;">${trend}</span>
      </div>`;
  }).join('');

  // avg line marker for SVG sparkline
  const avgY = spad + (sh - spad * 2) * (1 - (avg - Math.min(...bills)) / (maxVal - Math.min(...bills)));

  const header = `
    <div style="display:grid;grid-template-columns:38px 1fr 80px 70px;align-items:center;gap:10px;
                padding:6px 20px 10px 16px;border-bottom:1px solid var(--line2);margin-bottom:4px;">
      <span></span>
      <div style="display:flex;align-items:center;gap:8px;">
        <svg viewBox="0 0 ${sw} ${sh}" style="width:${sw}px;height:${sh}px;flex-shrink:0;">
          <line x1="${spad}" x2="${sw - spad}" y1="${avgY.toFixed(1)}" y2="${avgY.toFixed(1)}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 2"/>
          <path d="${spts}" fill="none" stroke="${C.teal}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="${spad + (sw - spad * 2) * activeMonth / (bills.length - 1)}" cy="${(spad + (sh - spad * 2) * (1 - (bills[activeMonth] - Math.min(...bills)) / (maxVal - Math.min(...bills)))).toFixed(1)}" r="3" fill="${C.teal}" stroke="#fff" stroke-width="1.5"/>
        </svg>
        <span style="font-size:10px;color:var(--muted);font-weight:600;">${isDaily ? monthNames[dateState.month] : '12-month'} trend</span>
      </div>
      <span style="font-family:var(--mono);font-size:10px;color:var(--muted);text-align:right;">Amount</span>
      <span style="font-size:10px;color:var(--muted);text-align:right;">vs avg</span>
    </div>`;

  const footer = `
    <div style="padding:10px 20px 14px 16px;border-top:1px solid var(--line2);display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
      <span style="font-size:11px;color:var(--muted);font-weight:600;">Monthly avg</span>
      <span style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--ink);">${avg.toLocaleString()} ฿</span>
    </div>`;

  document.getElementById('dailyBillBars').innerHTML = header + rows + footer;
  return '';
}

function yearlyBars() {
  const values = [71000, 69000, 70500, 71500, 65500, 70000, 68000, 72000, 69000, 71000, 70500, 59000]
    .map((v, i) => v + seededValue(i + 60, -2200, 2600));
  return verticalBars({ values, labels: monthNames, max: 80000, ticks: [0, 20000, 40000, 60000, 80000], color: C.teal, height: 300 });
}

function verticalBars({ values, labels, max, ticks, color, height = 300 }) {
  const w = Math.min(window.innerWidth - 320, 1100), h = height, left = 80, right = 24, top = 18, bottom = 42, cw = w - left - right, ch = h - top - bottom;
  const bw = Math.min(56, cw / values.length * .7);
  const grid = ticks.map(v => {
    const y = top + ch - (v / max) * ch;
    return `<line x1="${left}" x2="${w - right}" y1="${y}" y2="${y}" stroke="${C.gridLine}"/>
            <text x="${left - 10}" y="${y + 5}" text-anchor="end" fill="${C.text}" font-size="12" font-family="Space Mono">${v.toLocaleString()}</text>`;
  }).join('');
  const bars = values.map((v, i) => {
    const x = left + (cw / values.length) * i + (cw / values.length - bw) / 2, y = top + ch - (v / max) * ch;
    return `<rect x="${x}" y="${y}" width="${bw}" height="${top + ch - y}" rx="6" fill="${color}" opacity=".8" data-value="${labels[i]}: ${v.toLocaleString()}"/>
            <text x="${x + bw / 2}" y="${top + ch + 24}" text-anchor="middle" fill="${C.text}" font-size="12">${labels[i]}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${grid}${bars}</svg>`;
}

function renderBillingDetails() {
  const billingRows = document.getElementById('billingDetailsRows');
  const usageRows = document.getElementById('billingUsageRows');
  if (!billingRows || !usageRows) return;

  const energyCost = 4800 + seededValue(31, 200, 900);
  const ftRate = 350 + seededValue(32, 10, 60);
  const vat = Math.round((energyCost + ftRate) * 0.07);
  const netTotal = energyCost + ftRate + vat;
  const totalKwh = 1700 + seededValue(5, 50, 260);
  const avgDaily = (totalKwh / daysInMonth(dateState.month, dateState.year)).toFixed(1);

  // Split kWh into tiers
  const t1 = Math.min(totalKwh, 150);
  const t2 = Math.min(Math.max(totalKwh - 150, 0), 250);
  const t3 = Math.max(totalKwh - 400, 0);
  const c1 = (t1 * 3.2484).toFixed(2);
  const c2 = (t2 * 4.2218).toFixed(2);
  const c3 = (t3 * 4.4217).toFixed(2);
  const svcFee = (38 + seededValue(35, 0, 3)).toFixed(2);

  const peakDay = 1 + Math.abs(seededValue(108, 0, daysInMonth(dateState.month, dateState.year) * 7)) % daysInMonth(dateState.month, dateState.year);
  const peakHour = String(18 + Math.abs(seededValue(107, 0, 5))).padStart(2, '0') + ':00';
  const pf = (0.92 + (seededValue(104, 0, 40) / 1000)).toFixed(2);
  const voltage = 220 + seededValue(105, 0, 20);

  billingRows.innerHTML = `
    <div class="bill-row"><span>0–150 kWh<small>3.2484 Baht/kWh</small></span><span class="bill-amount">${parseFloat(c1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span></div>
    <div class="bill-row"><span>151–400 kWh<small>4.2218 Baht/kWh</small></span><span class="bill-amount">${parseFloat(c2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span></div>
    <div class="bill-row"><span>&gt;400 kWh<small>4.4217 Baht/kWh</small></span><span class="bill-amount">${parseFloat(c3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span></div>
    <div class="bill-row"><span>Service Fee</span><span class="bill-amount">${svcFee} ฿</span></div>
    <div class="bill-row"><span>FT Rate</span><span class="bill-amount">${ftRate.toFixed(2)} ฿</span></div>
    <div class="bill-row"><span>VAT 7%</span><span class="bill-amount">${vat.toLocaleString()} ฿</span></div>
    <div class="bill-row total"><span>Net Total</span><span class="bill-amount">${netTotal.toLocaleString()} ฿</span></div>`;

  usageRows.innerHTML = `
    <div class="bill-row"><span>Energy (kWh)</span><span class="bill-amount">${totalKwh.toLocaleString()} kWh</span></div>
    <div class="bill-row"><span>Avg. Daily Usage</span><span class="bill-amount">${avgDaily} kWh</span></div>
    <div class="bill-row"><span>Peak Day</span><span class="bill-amount">${String(peakDay).padStart(2, '0')} ${monthNames[dateState.month]}</span></div>
    <div class="bill-row"><span>Peak Hour</span><span class="bill-amount">${peakHour}</span></div>
    <div class="bill-row"><span>Power Factor</span><span class="bill-amount">${pf}</span></div>
    <div class="bill-row"><span>Avg. Voltage</span><span class="bill-amount">${voltage} V</span></div>
    <div class="bill-row" style="min-height:54px;"></div>`;
}

function updateForecastAccuracy() {
  const badge = document.getElementById('forecastAccuracy');
  if (!badge) return;
  // Accuracy between 75–95% seeded
  const accuracy = 75 + Math.abs(seededValue(400, 0, 20));
  badge.textContent = `Accuracy ${accuracy}%`;
}

const chartState = { scaleMode: 'auto' }; // 'auto' | 'fixed'

function renderCharts() {
  const dashValues = (state.period === 'daily'
    ? [4.4, 4.9, 6.9, 9.9, 9.4, 5.8, 3, 6.8, 6.7, 1.8, 5.8, 3.5, 3, 5.1, 8, 7, 9, 2, 6, 4, 5.1, 7, 9, 7]
    : state.period === 'overview'
      ? [780, 820, 780, 785, 760, 815, 825, 780, 770, 900, 780, 760]
      : [14, 65, 57, 70, 89, 26, 33, 62, 61, 72, 66, 31, 39, 35, 38, 27, 90, 92, 60, 45, 56, 78, 69, 72, 54, 39, 57, 61, 68, 78])
    .map((v, i) => Math.max(1, Math.round((v + seededValue(i, -4, 5)) * 10) / 10));
  const dashLabels = state.period === 'daily'
    ? Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
    : state.period === 'overview'
      ? monthNames
      : Array.from({ length: 30 }, (_, i) => String(i + 1));

  // Fixed scale baselines per period
  const fixedMax = state.period === 'overview' ? 1000 : state.period === 'daily' ? 15 : 120;
  const autoScale = chartState.scaleMode === 'auto';

  document.querySelector('#dashboardTrend').innerHTML = lineChart({
    values: dashValues, labels: dashLabels,
    max: autoScale ? null : fixedMax,
    fill: true, height: 300, autoScale
  });

  // Update scale toggle button state
  const scaleBtn = document.getElementById('scaleModeBtn');
  if (scaleBtn) {
    scaleBtn.textContent = autoScale ? '⇅ Auto Scale' : '⇅ Fixed Scale';
    scaleBtn.style.background = autoScale ? 'rgba(29,111,232,.1)' : 'rgba(255,122,69,.1)';
    scaleBtn.style.color = autoScale ? '#1d6fe8' : '#ff7a45';
    scaleBtn.style.borderColor = autoScale ? 'rgba(29,111,232,.25)' : 'rgba(255,122,69,.25)';
  }

  document.querySelector('#forecastLine').innerHTML = forecastLineChart();
  document.querySelector('#forecastBars').innerHTML = groupedBars();
  horizontalBars();
}

function renderHeat() {
  const colors = ['#d6e8ff', '#8ec5ff', '#5ca4f5', '#ffb830', '#ff4d6a'];
  const heat = Array.from({ length: 24 }, (_, hour) => {
    const base = hour < 6 ? 0.7 : hour < 11 ? 2.2 : hour < 17 ? 3.4 : hour < 22 ? 4.2 : 2.4;
    const value = Math.max(0.4, Math.min(5.8, base + seededValue(hour + 20, -9, 9) / 10));
    const level = Math.min(4, Math.max(0, Math.floor(value / 1.2)));
    return { value, color: colors[level] };
  });
  document.querySelector('#usageStrip').innerHTML = heat.map((h, hour) => `<span class="usage-cell" style="--heat:${h.color}" data-value="${String(hour).padStart(2, '0')}:00 avg ${h.value.toFixed(1)} kWh"></span>`).join('');
  document.querySelector('#usageHours').innerHTML = Array.from({ length: 24 }, (_, i) => `<span>${String(i).padStart(2, '0')}</span>`).join('');
}

function renderAlerts() {
  // Alert DB — seeded selection based on date so it changes per date/period
  const alertDB = [
    { time: '02:14', topic: 'Voltage Drop', description: 'Average voltage dropped below 200V during off-peak hours', severity: '<span class="pill warning">⚠ Warning</span>' },
    { time: '04:00', topic: 'Overload', description: 'Air conditioner current exceeded the normal operating range', severity: '<span class="pill critical">✕ Critical</span>' },
    { time: '07:32', topic: 'High Consumption', description: 'Energy consumption is 25% above the expected baseline', severity: '<span class="pill warning">⚠ Warning</span>' },
    { time: '10:55', topic: 'Power Surge', description: 'Sudden voltage spike detected on circuit 2', severity: '<span class="pill critical">✕ Critical</span>' },
    { time: '13:20', topic: 'Power Factor Low', description: 'Power factor fell below 0.85 — check reactive load', severity: '<span class="pill warning">⚠ Warning</span>' },
    { time: '15:45', topic: 'Phase Imbalance', description: 'Significant imbalance detected between phases A and B', severity: '<span class="pill critical">✕ Critical</span>' },
    { time: '19:10', topic: 'Peak Hour Alert', description: 'Entering peak billing period — consider load shifting', severity: '<span class="pill warning">⚠ Warning</span>' },
    { time: '21:00', topic: 'Overcurrent', description: 'Main circuit breaker rated current exceeded by 12%', severity: '<span class="pill critical">✕ Critical</span>' },
    { time: '00:30', topic: 'Harmonic Distortion', description: 'THD exceeds 8% threshold on the main distribution board', severity: '<span class="pill warning">⚠ Warning</span>' },
    { time: '06:15', topic: 'Temperature High', description: 'Panel temperature sensor reading above 45°C threshold', severity: '<span class="pill critical">✕ Critical</span>' },
  ];

  let rows = [];
  if (state.period === 'daily') {
    // Show 2-3 alerts for the selected day
    const count = 2 + (seededValue(300, 0, 10) > 6 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const idx = Math.abs(seededValue(301 + i, 0, alertDB.length * 7)) % alertDB.length;
      const alert = alertDB[idx];
      rows.push({ date: selectedDate(), time: alert.time, topic: alert.topic, description: alert.description, severity: alert.severity });
    }
  } else if (state.period === 'monthly') {
    // Show alerts spread across different days of the selected month
    const count = 3 + (seededValue(310, 0, 10) > 5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const day = 1 + Math.abs(seededValue(311 + i * 3, 0, daysInMonth(dateState.month, dateState.year) * 7)) % daysInMonth(dateState.month, dateState.year);
      const dateStr = `${String(day).padStart(2, '0')} ${monthNames[dateState.month]} ${dateState.year}`;
      const idx = Math.abs(seededValue(312 + i * 7, 0, alertDB.length * 7)) % alertDB.length;
      const alert = alertDB[idx];
      rows.push({ date: dateStr, time: alert.time, topic: alert.topic, description: alert.description, severity: alert.severity });
    }
    rows.sort((a, b) => parseInt(a.date) - parseInt(b.date));
  } else {
    // Overview: alerts from different months
    const count = 4 + (seededValue(320, 0, 10) > 5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const mon = Math.abs(seededValue(321 + i * 3, 0, 12 * 7)) % 12;
      const day = 1 + Math.abs(seededValue(322 + i * 5, 0, 28 * 7)) % 28;
      const dateStr = `${String(day).padStart(2, '0')} ${monthNames[mon]} ${dateState.year}`;
      const idx = Math.abs(seededValue(323 + i * 7, 0, alertDB.length * 7)) % alertDB.length;
      const alert = alertDB[idx];
      rows.push({ date: dateStr, time: alert.time, topic: alert.topic, description: alert.description, severity: alert.severity });
    }
  }

  document.querySelector('#alertRows').innerHTML = rows.map(row => `
    <tr>
      <td>${row.date}</td>
      <td>${row.time}</td>
      <td>${row.topic}</td>
      <td>${row.description}</td>
      <td>${row.severity}</td>
    </tr>`).join('');
}

function renderAppliances() {
  const list = document.querySelector('.appliance-list');
  const donut = document.querySelector('.donut');
  if (!list || !donut) return;
  const items = [
    ['Air Conditioner', '#2d7ff9', 34 + seededValue(70, -2, 5)],
    ['Water Heater', '#ff7a45', 17 + seededValue(71, -2, 4)],
    ['Refrigerator', '#4f8fff', 13 + seededValue(72, -1, 3)],
    ['Washer/Dryer', '#ffb830', 11 + seededValue(73, -1, 3)]
  ];
  const used = items.reduce((sum, item) => sum + item[2], 0);
  items.push(['Other', '#c5c9d6', Math.max(8, 100 - used)]);
  let cursor = 0;
  const gradient = items.map(item => {
    const start = cursor;
    cursor += item[2];
    return `${item[1]} ${start}% ${cursor}%`;
  }).join(', ');
  donut.style.background = `conic-gradient(${gradient})`;
  donut.dataset.value = items.map(item => `${item[0]} ${item[2]}%`).join(' | ');
  list.innerHTML = items.map(item => `
    <div class="appliance-row" data-value="${item[0]}: ${item[2]}%">
      <span class="dot" style="background:${item[1]}"></span>
      <span>${item[0]}</span><strong>${item[2]}%</strong>
    </div>`).join('');
}

function updateVisibility() {
  for (const key of Object.keys(pages)) {
    document.querySelector(`#${key}Page`).classList.toggle('hidden', state.page !== key);
  }
  document.querySelector('#pageTitle').textContent = pages[state.page];
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === state.page));
  document.querySelectorAll('.segment button').forEach(b => b.classList.toggle('active', b.dataset.period === state.period));
  document.querySelector('#dateControls').innerHTML = dateControls();
  document.querySelector('#billOverview').classList.toggle('hidden', state.page === 'bill' && state.period === 'overview');
  document.querySelector('#billYear').classList.toggle('hidden', state.page !== 'bill');
  // Spacing: if billOverview is visible, billYear needs top margin; if hidden (overview period), no margin needed
  const billOverviewHidden = state.page === 'bill' && state.period === 'overview';
  document.querySelector('#billYear').style.marginTop = billOverviewHidden ? '0' : '16px';
  const billHistoryBadge = document.querySelector('#billHistoryBadge');
  if (billHistoryBadge) billHistoryBadge.textContent = dateState.year;
  updateCurrentDate();
  setMetrics();
  renderCharts();
  renderHeat();
  renderAppliances();
  renderAlerts();
  renderBillingDetails();
  updateForecastAccuracy();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => { state.page = btn.dataset.page; updateVisibility(); });
});

document.querySelectorAll('.segment button').forEach(btn => {
  btn.addEventListener('click', () => { state.period = btn.dataset.period; updateVisibility(); });
});

document.addEventListener('click', e => {
  const pill = e.target.closest('.select-pill');
  document.querySelectorAll('.select-pill.open').forEach(p => { if (p !== pill) p.classList.remove('open'); });
  if (pill) { pill.classList.toggle('open'); e.stopPropagation(); }
  const item = e.target.closest('.dropdown-item');
  if (item) {
    const type = item.dataset.type;
    const val = parseInt(item.dataset.val);
    dateState[type] = val;
    if (type === 'month' || type === 'year') {
      const maxDay = daysInMonth(dateState.month, dateState.year);
      if (dateState.day > maxDay) dateState.day = maxDay;
    }
    document.querySelectorAll('.select-pill.open').forEach(p => p.classList.remove('open'));
    updateVisibility();
  }
});

const tooltip = document.getElementById('chartTooltip');
document.addEventListener('mouseover', e => {
  const circle = e.target.closest('circle');
  const rect = e.target.closest('rect[rx]');
  const heatCell = e.target.closest('.usage-cell');
  const appliance = e.target.closest('.appliance-row, .donut');
  if (circle?.querySelector('title')) {
    tooltip.textContent = circle.querySelector('title').textContent;
    tooltip.style.display = 'block';
  } else if (rect?.dataset.value) {
    tooltip.textContent = rect.dataset.value;
    tooltip.style.display = 'block';
  } else if (heatCell?.dataset.value) {
    tooltip.textContent = heatCell.dataset.value;
    tooltip.style.display = 'block';
  } else if (appliance?.dataset.value) {
    tooltip.textContent = appliance.dataset.value;
    tooltip.style.display = 'block';
  }
});

document.addEventListener('mousemove', e => {
  if (tooltip.style.display === 'block') {
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY - 34) + 'px';
  }
});

document.addEventListener('mouseout', e => {
  if (e.target.closest('circle') || e.target.closest('rect[rx]') || e.target.closest('.usage-cell') || e.target.closest('.appliance-row, .donut')) tooltip.style.display = 'none';
});

updateVisibility();
