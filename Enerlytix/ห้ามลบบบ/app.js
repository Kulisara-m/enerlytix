const state = { page: "dashboard", period: "monthly" };
const pages = { dashboard: "Dashboard", realtime: "Real-Time", forecast: "Energy Forecast", bill: "Bill Calculator", alert: "Alert" };
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

const dateEl = document.getElementById('currentDate');
function updateCurrentDate() {
  if (dateEl) dateEl.textContent = state.page === 'realtime' ? new Date().toLocaleTimeString() : selectedDate();
}

function trendIcon(down) {
  const color = down ? '#ff4d6a' : '#00c48c';
  const arrow = down ? '▼' : '▲';
  return `<span style="color:${color}">${arrow}</span>`;
}

function getStatusInfo(type, value) {
  // type: 'power' | 'pf' | 'voltage'
  if (type === 'power') {
    const v = parseFloat(value);
    if (v < 0.7) return { text: 'Low Load', cls: 'down' };
    if (v > 0.9) return { text: 'High Load', cls: 'warn' };
    return { text: 'Stable', cls: 'stable' };
  }
  if (type === 'pf') {
    const v = parseFloat(value);
    if (v < 0.92) return { text: 'Low PF', cls: 'warn' };
    return { text: 'Normal', cls: 'stable' };
  }
  if (type === 'voltage') {
    const v = parseInt(value);
    if (v < 220) return { text: 'Under-Voltage', cls: 'down' };
    if (v > 240) return { text: 'Over-Voltage', cls: 'warn' };
    return { text: 'Normal', cls: 'stable' };
  }
  return { text: '', cls: 'stable' };
}

function metric({ title, value, unit, note, percent, down, status, statusCls }) {
  let footer = '';
  if (status) {
    const cls = statusCls || (status.type === 'peak' ? 'warn' : 'stable');
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

  const avgPower = (0.70 + (seededValue(103, 0, 200) / 1000)).toFixed(2);
  const pf = (0.92 + (seededValue(104, 0, 40) / 1000)).toFixed(2);
  const voltage = 220 + seededValue(105, 0, 20);
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
  const pwrStatus = getStatusInfo('power', m.avgPower);
  const pfStatus = getStatusInfo('pf', m.pf);
  const vStatus = getStatusInfo('voltage', m.voltage);

  const dash = {
    overview: [
      { title: "Total Energy (1 Year)", value: m.totalYear.toLocaleString(), unit: "kWh", note: "from last year", percent: m.pctYear, down: m.downYear },
      { title: "Avg. Power", value: m.avgPower, unit: "kW", status: { text: pwrStatus.text }, statusCls: pwrStatus.cls },
      { title: "Power Factor", value: m.pf, unit: "", status: { text: pfStatus.text }, statusCls: pfStatus.cls },
      { title: "Avg. Voltage", value: String(m.voltage), unit: "V", status: { text: vStatus.text }, statusCls: vStatus.cls },
      { title: "Peak Power", value: m.peakPower, unit: "kW", status: { text: m.peakDateStr, type: "peak" } }
    ],
    monthly: [
      { title: "Total Energy (1 Month)", value: m.totalMonth.toLocaleString(), unit: "kWh", note: "from last month", percent: m.pctMonth, down: m.downMonth },
      { title: "Avg. Power", value: m.avgPower, unit: "kW", status: { text: pwrStatus.text }, statusCls: pwrStatus.cls },
      { title: "Power Factor", value: m.pf, unit: "", status: { text: pfStatus.text }, statusCls: pfStatus.cls },
      { title: "Avg. Voltage", value: String(m.voltage), unit: "V", status: { text: vStatus.text }, statusCls: vStatus.cls },
      { title: "Peak Power", value: m.peakPower, unit: "kW", status: { text: m.peakDateStr, type: "peak" } }
    ],
    daily: [
      { title: "Total Energy (1 Day)", value: m.totalDay.toLocaleString(), unit: "kWh", note: "from yesterday", percent: m.pctDay, down: m.downDay },
      { title: "Avg. Power", value: m.avgPower, unit: "kW", status: { text: pwrStatus.text }, statusCls: pwrStatus.cls },
      { title: "Power Factor", value: m.pf, unit: "", status: { text: pfStatus.text }, statusCls: pfStatus.cls },
      { title: "Avg. Voltage", value: String(m.voltage), unit: "V", status: { text: vStatus.text }, statusCls: vStatus.cls },
      { title: "Peak Power", value: m.peakPower, unit: "kW", status: { text: m.peakDateStr, type: "peak" } }
    ]
  };

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
  const w = 1200, h = height, left = 72, right = 20, top = 20, bottom = 40;
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
    return `<line x1="${left}" x2="${w - right}" y1="${y}" y2="${y}" stroke="${C.gridLine}" stroke-width="1.2"/>
            <text x="${left - 10}" y="${y + 4}" text-anchor="end" fill="${C.text}" font-size="12" font-family="Space Mono">${label}</text>`;
  }).join('');
  const xStep = values.length > 20 ? Math.ceil(values.length / 12) : 1;
  const gridX = labels.map((lab, i) => {
    if (i % xStep !== 0 && i !== labels.length - 1) return '';
    const x = left + (cw * i) / (labels.length - 1);
    return `<text x="${x}" y="${top + ch + 24}" text-anchor="middle" fill="${C.text}" font-size="12">${lab}</text>`;
  }).join('');
  const uid = `lc${Math.random().toString(36).slice(2, 6)}`;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
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

// ─── UPDATED FORECAST LINE CHART with real grid ───
function forecastLineChart() {
  const w = 1200, left = 72, right = 30, top = 20, bottom = 42;
  const h = 300;
  const cw = w - left - right, ch = h - top - bottom;
  const numPts = 12;

  // Actual data: Jan to dateState.month (inclusive)
  const splitAt = dateState.month; // 0-indexed month
  const actual = Array.from({ length: splitAt + 1 }, (_, i) => {
    const base = 600 + 300 * Math.sin((i / 12) * Math.PI * 2 + 1);
    return Math.max(10, Math.round((base + seededValue(i + 400, -60, 60)) * 10) / 10);
  });
  // Forecast data: from dateState.month to Dec
  const forecast = Array.from({ length: 12 - splitAt }, (_, i) => {
    const mi = i + splitAt;
    const base = 620 + 280 * Math.sin((mi / 12) * Math.PI * 2 + 1);
    return Math.max(10, Math.round((base + seededValue(mi + 430, -50, 50)) * 10) / 10);
  });
  const bandHi = forecast.map(v => Math.round(v * 1.12 * 10) / 10);
  const bandLo = forecast.map(v => Math.round(v * 0.88 * 10) / 10);

  const allValues = [...actual, ...forecast, ...bandHi];
  const dataMax = Math.max(...allValues);
  const { max, ticks } = niceScale(dataMax * 1.1);

  const xOf = i => left + (cw * i) / (numPts - 1);
  const yOf = v => top + ch - (v / max) * ch;

  const apt = actual.map((v, i) => [xOf(i), yOf(v)]);
  const fpt = forecast.map((v, i) => [xOf(i + splitAt), yOf(v)]);
  const hiPt = bandHi.map((v, i) => [xOf(i + splitAt), yOf(v)]);
  const loPt = bandLo.map((v, i) => [xOf(i + splitAt), yOf(v)]).reverse();

  const curve = pts => pts.map((p, i) => {
    if (i === 0) return `M${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `C${cx.toFixed(1)},${prev[1].toFixed(1)} ${cx.toFixed(1)},${p[1].toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  }).join(' ');

  const band = hiPt.length > 1 ? `${curve(hiPt)} ${loPt.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z` : '';

  const gridLines = ticks.map(t => {
    const y = yOf(t);
    const label = t >= 1000 ? (t / 1000).toFixed(t % 1000 === 0 ? 0 : 1) + 'k' : t % 1 !== 0 ? t.toFixed(1) : String(t);
    return `<line x1="${left}" x2="${w - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(0,0,0,0.06)" stroke-width="1.2"/>
            <text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="${C.text}" font-size="12" font-family="Space Mono">${label}</text>`;
  }).join('');

  const xLabels = monthNames.map((lab, i) => {
    return `<text x="${xOf(i).toFixed(1)}" y="${top + ch + 28}" text-anchor="middle" fill="${C.text}" font-size="12">${lab}</text>`;
  }).join('');

  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="bandFillG" x1="0" x2="1"><stop stop-color="${C.orange}" stop-opacity=".18"/><stop offset="1" stop-color="${C.orange}" stop-opacity=".06"/></linearGradient>
      <filter id="cGlow2"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${gridLines}${xLabels}
    <line x1="${left}" x2="${w - right}" y1="${top + ch}" y2="${top + ch}" stroke="${C.line}"/>
    ${band ? `<path d="${band}" fill="url(#bandFillG)"/>` : ''}
    <path d="${curve(apt)}" fill="none" stroke="${C.teal}" stroke-width="2.5" stroke-linecap="round" filter="url(#cGlow2)"/>
    ${apt.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${C.teal}" stroke="${C.bg}" stroke-width="1.8"><title>${monthNames[i]}: ${actual[i]}</title></circle>`).join('')}
    ${fpt.length > 1 ? `<path d="${curve(fpt)}" fill="none" stroke="${C.orange}" stroke-width="2.5" stroke-dasharray="8 5" stroke-linecap="round"/>` : ''}
    ${fpt.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${C.orange}" stroke="${C.bg}" stroke-width="1.8"><title>${monthNames[i + splitAt]}: ${forecast[i]} (Forecast)</title></circle>`).join('')}
    <line x1="${xOf(splitAt).toFixed(1)}" x2="${xOf(splitAt).toFixed(1)}" y1="${top + 16}" y2="${top + ch - 10}" stroke="#ffb830" stroke-width="1.5" stroke-dasharray="5 4" opacity=".7"/>
    <text x="${(xOf(splitAt) + 6).toFixed(1)}" y="${top + 30}" fill="#ffb830" font-size="12" font-weight="700" font-family="Space Mono">NOW</text>
  </svg>`;
}

function groupedBars() {
  const w = 1100, h = 260, left = 100, right = 20, top = 24, bottom = 42, max = 2500;
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
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${grid}${bars}</svg>`;
}

// ─── BILLING HISTORY — updated for month/day logic ───
function horizontalBars() {
  const isDaily = state.period === 'daily';
  const isOverview = state.period === 'overview';

  let rowCount, labels, bills, activeIdx, trendLabel;

  if (isDaily) {
    // Day view: hourly breakdown of selected day
    rowCount = 24;
    labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');
    bills = Array.from({ length: 24 }, (_, i) => {
      const base = i < 6 ? 2 : i < 9 ? 18 : i < 12 ? 28 : i < 14 ? 22 : i < 18 ? 30 : i < 22 ? 38 : 10;
      return Math.round((base + seededValue(i + 500, -5, 8)));
    });
    activeIdx = new Date().getHours();
    trendLabel = `${String(dateState.day).padStart(2, '0')} ${monthNames[dateState.month]} ${dateState.year} — hourly`;
  } else if (isOverview) {
    // Overview (year): 12 months of selected year
    rowCount = 12;
    labels = monthNames;
    bills = Array.from({ length: 12 }, (_, i) => {
      const base = [4820, 5310, 4590, 5640, 6120, 7240, 6890, 6240, 5760, 6430, 5980, 5120][i];
      return base + seededValue(i + 40, -260, 320);
    });
    activeIdx = dateState.month;
    trendLabel = `${dateState.year} — 12-month trend`;
  } else {
    // Monthly view: days of selected month
    rowCount = daysInMonth(dateState.month, dateState.year);
    labels = Array.from({ length: rowCount }, (_, i) => String(i + 1).padStart(2, '0'));
    bills = Array.from({ length: rowCount }, (_, i) => {
      const base = 120 + (i % 7) * 18;
      return base + seededValue(i + 40, 10, 90);
    });
    activeIdx = dateState.day - 1;
    trendLabel = `${monthNames[dateState.month]} ${dateState.year} — daily trend`;
  }

  const maxVal = Math.max(...bills);
  const avg = Math.round(bills.reduce((a, b) => a + b, 0) / bills.length);
  const unit = isDaily ? '฿/hr' : '฿';

  const sw = 120, sh = 28, spad = 6;
  const spts = bills.map((v, i) => {
    const x = spad + (sw - spad * 2) * i / (bills.length - 1);
    const y = spad + (sh - spad * 2) * (1 - (v - Math.min(...bills)) / (maxVal - Math.min(...bills)));
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const rows = bills.map((v, i) => {
    const pct = v / maxVal;
    const isActive = i === activeIdx;
    const isHigh = v === maxVal;
    const barColor = isActive ? C.teal : isHigh ? '#f87171' : '#93c5fd';
    const barAlpha = isActive ? '1' : isHigh ? '0.85' : '0.6';
    const textColor = isActive ? C.teal : isHigh ? '#dc2626' : 'var(--sub)';
    const bgColor = isActive ? 'rgba(59,130,246,0.04)' : 'transparent';
    const pctOfAvg = Math.round((v / avg - 1) * 100);
    const trend = pctOfAvg >= 0 ? `+${pctOfAvg}%` : `${pctOfAvg}%`;
    const trendColor = pctOfAvg > 10 ? '#dc2626' : pctOfAvg < -5 ? '#16a34a' : 'var(--muted)';
    return `
      <div style="display:grid;grid-template-columns:52px 1fr 80px 60px;align-items:center;gap:10px;
                  padding:6px 20px 6px 16px;background:${bgColor};
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
        <span style="font-family:var(--mono);font-size:12px;font-weight:700;color:${textColor};text-align:right;white-space:nowrap;">${v.toLocaleString()} ${unit}</span>
        <span style="font-size:11px;font-weight:700;color:${trendColor};text-align:right;">${trend}</span>
      </div>`;
  }).join('');

  const avgY = spad + (sh - spad * 2) * (1 - (avg - Math.min(...bills)) / (maxVal - Math.min(...bills)));
  const activeCx = spad + (sw - spad * 2) * Math.min(activeIdx, bills.length - 1) / Math.max(bills.length - 1, 1);
  const activeCy = spad + (sh - spad * 2) * (1 - (bills[Math.min(activeIdx, bills.length - 1)] - Math.min(...bills)) / (maxVal - Math.min(...bills)));

  const header = `
    <div style="display:grid;grid-template-columns:52px 1fr 80px 60px;align-items:center;gap:10px;
                padding:6px 20px 10px 16px;border-bottom:1px solid var(--line2);margin-bottom:4px;">
      <span></span>
      <div style="display:flex;align-items:center;gap:8px;">
        <svg viewBox="0 0 ${sw} ${sh}" style="width:${sw}px;height:${sh}px;flex-shrink:0;">
          <line x1="${spad}" x2="${sw - spad}" y1="${avgY.toFixed(1)}" y2="${avgY.toFixed(1)}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 2"/>
          <path d="${spts}" fill="none" stroke="${C.teal}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="${activeCx.toFixed(1)}" cy="${activeCy.toFixed(1)}" r="3" fill="${C.teal}" stroke="#fff" stroke-width="1.5"/>
        </svg>
        <span style="font-size:10px;color:var(--muted);font-weight:600;">${trendLabel}</span>
      </div>
      <span style="font-family:var(--mono);font-size:10px;color:var(--muted);text-align:right;">Amount</span>
      <span style="font-size:10px;color:var(--muted);text-align:right;">vs avg</span>
    </div>`;

  const footer = `
    <div style="padding:10px 20px 14px 16px;border-top:1px solid var(--line2);display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
      <span style="font-size:11px;color:var(--muted);font-weight:600;">Average</span>
      <span style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--ink);">${avg.toLocaleString()} ${unit}</span>
    </div>`;

  document.getElementById('dailyBillBars').innerHTML = header + rows + footer;
}

function yearlyBars() {
  const values = [71000, 69000, 70500, 71500, 65500, 70000, 68000, 72000, 69000, 71000, 70500, 59000]
    .map((v, i) => v + seededValue(i + 60, -2200, 2600));
  return verticalBars({ values, labels: monthNames, max: 80000, ticks: [0, 20000, 40000, 60000, 80000], color: C.teal, height: 300 });
}

function verticalBars({ values, labels, max, ticks, color, height = 300 }) {
  const w = 1100, h = height, left = 80, right = 24, top = 18, bottom = 42, cw = w - left - right, ch = h - top - bottom;
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
  const accuracy = 75 + Math.abs(seededValue(400, 0, 20));
  badge.textContent = `Accuracy ${accuracy}%`;
}

const chartState = { scaleMode: 'auto' };

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

  const fixedMax = state.period === 'overview' ? 1000 : state.period === 'daily' ? 15 : 120;
  const autoScale = chartState.scaleMode === 'auto';

  document.querySelector('#dashboardTrend').innerHTML = lineChart({
    values: dashValues, labels: dashLabels,
    max: autoScale ? null : fixedMax,
    fill: true, height: 300, autoScale
  });

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

// ─── PIE CHART (Canvas) ───
let pieTooltip = null;
let pieHoverIdx = -1;
const pieItems = () => {
  const items = [
    ['Air Conditioner', '#00c48c', 34 + seededValue(70, -2, 5)],
    ['Water Heater', '#ff7a45', 17 + seededValue(71, -2, 4)],
    ['Refrigerator', '#4f8fff', 13 + seededValue(72, -1, 3)],
    ['Washer/Dryer', '#ffb830', 11 + seededValue(73, -1, 3)]
  ];
  const used = items.reduce((sum, item) => sum + item[2], 0);
  items.push(['Other', '#c5c9d6', Math.max(8, 100 - used)]);
  return items;
};

function drawPieChart(hoverIdx = -1) {
  const canvas = document.getElementById('pieChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const items = pieItems();
  const total = items.reduce((s, it) => s + it[2], 0);
  const cx = canvas.width / 2, cy = canvas.height / 2, outerR = 62, innerR = 40;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let startAngle = -Math.PI / 2;
  items.forEach((item, i) => {
    const slice = (item[2] / total) * Math.PI * 2;
    const isHover = i === hoverIdx;
    const pull = isHover ? 6 : 0;
    const midAngle = startAngle + slice / 2;
    const ox = Math.cos(midAngle) * pull, oy = Math.sin(midAngle) * pull;

    ctx.beginPath();
    ctx.moveTo(cx + ox, cy + oy);
    ctx.arc(cx + ox, cy + oy, outerR + (isHover ? 6 : 0), startAngle, startAngle + slice);
    ctx.arc(cx + ox, cy + oy, innerR, startAngle + slice, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item[1];
    ctx.globalAlpha = isHover ? 1 : 0.88;
    ctx.fill();
    if (isHover) {
      ctx.shadowColor = item[1];
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    startAngle += slice;
  });
}

function renderAppliances() {
  const list = document.querySelector('.appliance-list');
  if (!list) return;
  const items = pieItems();
  list.innerHTML = items.map((item, idx) => `
    <div class="appliance-row" data-pie-idx="${idx}" data-value="${item[0]}: ${item[2]}%">
      <span class="dot" style="background:${item[1]}"></span>
      <span>${item[0]}</span><strong>${item[2]}%</strong>
    </div>`).join('');
  drawPieChart(-1);

  const canvas = document.getElementById('pieChart');
  if (!canvas) return;

  // Pie → List linking
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const dx = mx - cx, dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 40 || dist > 70) {
      if (pieHoverIdx !== -1) { pieHoverIdx = -1; drawPieChart(-1); highlightRow(-1); }
      document.getElementById('chartTooltip').style.display = 'none';
      return;
    }
    let angle = Math.atan2(dy, dx) - (-Math.PI / 2);
    if (angle < 0) angle += Math.PI * 2;
    const total = items.reduce((s, it) => s + it[2], 0);
    let start = 0, found = -1;
    items.forEach((item, i) => {
      const slice = (item[2] / total) * Math.PI * 2;
      if (angle >= start && angle < start + slice) found = i;
      start += slice;
    });
    if (found !== pieHoverIdx) {
      pieHoverIdx = found;
      drawPieChart(found);
      highlightRow(found);
      if (found !== -1) {
        const tooltip = document.getElementById('chartTooltip');
        tooltip.textContent = `${items[found][0]}: ${items[found][2]}%`;
        tooltip.style.display = 'block';
      }
    }
  };
  canvas.onmouseleave = () => {
    pieHoverIdx = -1;
    drawPieChart(-1);
    highlightRow(-1);
    document.getElementById('chartTooltip').style.display = 'none';
  };

  // List → Pie linking
  document.querySelectorAll('.appliance-row[data-pie-idx]').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const idx = parseInt(row.dataset.pieIdx);
      pieHoverIdx = idx;
      drawPieChart(idx);
      highlightRow(idx);
    });
    row.addEventListener('mouseleave', () => {
      pieHoverIdx = -1;
      drawPieChart(-1);
      highlightRow(-1);
    });
  });

  function highlightRow(idx) {
    document.querySelectorAll('.appliance-row[data-pie-idx]').forEach(r => {
      const i = parseInt(r.dataset.pieIdx);
      r.style.opacity = idx === -1 ? '1' : (i === idx ? '1' : '0.4');
      r.style.transform = i === idx ? 'translateX(4px)' : '';
      r.style.transition = 'opacity .2s, transform .2s';
    });
  }
}

// ─── HEAT MAP (SVG with hover) ───
function renderHeat() {
  const colors = ['#d6e8ff', '#8ec5ff', '#5ca4f5', '#ffb830', '#ff4d6a'];
  const heat = Array.from({ length: 24 }, (_, hour) => {
    const base = hour < 6 ? 0.7 : hour < 11 ? 2.2 : hour < 17 ? 3.4 : hour < 22 ? 4.2 : 2.4;
    const value = Math.max(0.4, Math.min(5.8, base + seededValue(hour + 20, -9, 9) / 10));
    const level = Math.min(4, Math.max(0, Math.floor(value / 1.2)));
    return { value, color: colors[level], level };
  });

  const container = document.getElementById('heatMapCanvas');
  if (!container) return;

  let html = '<div class="heatmap-row">';
  heat.forEach((h, i) => {
    const label = String(i).padStart(2, '0');
    html += `<div class="hm-square-wrap" data-hm-value="${label}:00 — avg ${h.value.toFixed(1)} kWh">
      <div class="hm-square" style="background:${h.color};"></div>
      <span class="hm-label">${label}</span>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;

  // Hover events
  container.querySelectorAll('.hm-square-wrap').forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
      const tooltip = document.getElementById('chartTooltip');
      tooltip.textContent = cell.dataset.hmValue;
      tooltip.style.display = 'block';
      cell.querySelector('.hm-square').classList.add('hm-hover');
    });
    cell.addEventListener('mouseleave', () => {
      document.getElementById('chartTooltip').style.display = 'none';
      cell.querySelector('.hm-square').classList.remove('hm-hover');
    });
  });
}

// ─── ALERTS ───
function renderAlerts() {
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
    const count = 2 + (seededValue(300, 0, 10) > 6 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const idx = Math.abs(seededValue(301 + i, 0, alertDB.length * 7)) % alertDB.length;
      const alert = alertDB[idx];
      rows.push({ date: selectedDate(), time: alert.time, topic: alert.topic, description: alert.description, severity: alert.severity });
    }
  } else if (state.period === 'monthly') {
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
      <td>${row.date}</td><td>${row.time}</td><td>${row.topic}</td><td>${row.description}</td><td>${row.severity}</td>
    </tr>`).join('');
}

// ─── REAL-TIME PAGE ───
const rtState = {
  power: [], voltage: [], current: [], pf: [],
  ticker: null, t: 0, appliance: 'total'
};

const rtProfiles = {
  total: { pBase: 0.72, pAmp: 0.18, vBase: 230, vAmp: 5, pfBase: 0.94, pfAmp: 0.04, label: 'Total House' },
  ac: { pBase: 1.20, pAmp: 0.30, vBase: 230, vAmp: 4, pfBase: 0.90, pfAmp: 0.05, label: 'Air Conditioner' },
  heater: { pBase: 2.50, pAmp: 0.15, vBase: 228, vAmp: 6, pfBase: 0.98, pfAmp: 0.01, label: 'Water Heater' },
  fridge: { pBase: 0.15, pAmp: 0.08, vBase: 230, vAmp: 3, pfBase: 0.65, pfAmp: 0.10, label: 'Refrigerator' },
  washer: { pBase: 0.50, pAmp: 0.40, vBase: 229, vAmp: 5, pfBase: 0.88, pfAmp: 0.06, label: 'Washer/Dryer' }
};

const RT_LEN = 60;

function rtSeed() {
  return Date.now() / 1000;
}

function rtNextValues() {
  const t = rtState.t++;
  const p = rtProfiles[rtState.appliance] || rtProfiles.total;
  const power = parseFloat((p.pBase + p.pAmp * Math.sin(t / 8) + (Math.random() - 0.5) * 0.1).toFixed(3));
  const voltage = parseFloat((p.vBase + p.vAmp * Math.sin(t / 12) + (Math.random() - 0.5) * 3).toFixed(1));
  const pf = parseFloat(Math.min(1.00, Math.max(0.60, p.pfBase + Math.sin(t / 10) * p.pfAmp + (Math.random() - 0.5) * 0.02)).toFixed(3));
  const current = parseFloat((power * 1000 / (voltage * pf)).toFixed(3));
  return { power, voltage, current, pf };
}

function pushRt(series, value) {
  series.push(value);
  if (series.length > RT_LEN) series.shift();
}

function drawRtCanvas(canvasId, data, color, minVal, maxVal, unit) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (data.length < 2) return;

  // Auto scale: compute min/max from data with 10% padding
  if (minVal === null || maxVal === null) {
    const dataMin = Math.min(...data);
    const dataMax = Math.max(...data);
    const spread = dataMax - dataMin || Math.abs(dataMax) * 0.1 || 1;
    minVal = dataMin - spread * 0.15;
    maxVal = dataMax + spread * 0.15;
  }

  const pad = { l: 0, r: 0, t: 8, b: 8 };
  const range = maxVal - minVal || 1;
  const xOf = i => pad.l + (w - pad.l - pad.r) * i / (RT_LEN - 1);
  const yOf = v => pad.t + (h - pad.t - pad.b) * (1 - (v - minVal) / range);

  // Grid lines
  const ticks = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= ticks; i++) {
    const v = minVal + (range * i / ticks);
    const y = yOf(v);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Area fill
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, color + '44');
  gradient.addColorStop(1, color + '00');
  ctx.beginPath();
  data.forEach((v, i) => {
    const offset = RT_LEN - data.length;
    const x = xOf(i + offset), y = yOf(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(xOf(RT_LEN - 1), h);
  ctx.lineTo(xOf(RT_LEN - data.length), h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * window.devicePixelRatio;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  data.forEach((v, i) => {
    const offset = RT_LEN - data.length;
    const x = xOf(i + offset), y = yOf(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Latest dot
  const last = data[data.length - 1];
  const lx = xOf(RT_LEN - 1), ly = yOf(last);
  ctx.beginPath();
  ctx.arc(lx, ly, 4 * window.devicePixelRatio, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2 * window.devicePixelRatio;
  ctx.stroke();
}

function updateRtMetrics() {
  const pw = rtState.power;
  const vt = rtState.voltage;
  const cu = rtState.current;
  const pf = rtState.pf;
  if (!pw.length) return;

  const last = v => v[v.length - 1];
  const avgArr = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const pwrVal = last(pw).toFixed(2);
  const pfVal = last(pf).toFixed(3);
  const vtVal = last(vt).toFixed(1);
  const cuVal = last(cu).toFixed(2);

  const pwrS = getStatusInfo('power', pwrVal);
  const pfS = getStatusInfo('pf', pfVal);
  const vtS = getStatusInfo('voltage', vtVal);

  document.getElementById('realtimeMetrics').innerHTML = [
    metric({ title: "Live Power", value: pwrVal, unit: "kW", status: { text: pwrS.text }, statusCls: pwrS.cls }),
    metric({ title: "Live Voltage", value: vtVal, unit: "V", status: { text: vtS.text }, statusCls: vtS.cls }),
    metric({ title: "Live Current", value: cuVal, unit: "A", status: { text: "Running" }, statusCls: 'stable' }),
    metric({ title: "Power Factor", value: pfVal, unit: "", status: { text: pfS.text }, statusCls: pfS.cls }),
  ].join('');

  document.getElementById('rtPowerBadge').textContent = `${pwrVal} kW`;
  document.getElementById('rtVoltageBadge').textContent = `${vtVal} V`;
  document.getElementById('rtCurrentBadge').textContent = `${cuVal} A`;
  document.getElementById('rtPFBadge').textContent = pfVal;
}

function updateRtCharts() {
  drawRtCanvas('rtPowerChart', rtState.power, '#2d7ff9', null, null, 'kW');
  drawRtCanvas('rtVoltageChart', rtState.voltage, '#00c48c', null, null, 'V');
  drawRtCanvas('rtCurrentChart', rtState.current, '#ff7a45', null, null, 'A');
  drawRtCanvas('rtPFChart', rtState.pf, '#9b8fff', null, null, '');
}

function startRealtime() {
  if (rtState.ticker) return;
  // Pre-fill with some data
  for (let i = 0; i < 30; i++) {
    const v = rtNextValues();
    pushRt(rtState.power, v.power);
    pushRt(rtState.voltage, v.voltage);
    pushRt(rtState.current, v.current);
    pushRt(rtState.pf, v.pf);
  }
  updateRtMetrics();
  updateRtCharts();
  rtState.ticker = setInterval(() => {
    if (state.page !== 'realtime') return;
    const v = rtNextValues();
    pushRt(rtState.power, v.power);
    pushRt(rtState.voltage, v.voltage);
    pushRt(rtState.current, v.current);
    pushRt(rtState.pf, v.pf);
    updateRtMetrics();
    updateRtCharts();
    updateCurrentDate();
  }, 2000);
}

function stopRealtime() {
  if (rtState.ticker) { clearInterval(rtState.ticker); rtState.ticker = null; }
}

function updateVisibility() {
  for (const key of Object.keys(pages)) {
    document.querySelector(`#${key}Page`).classList.toggle('hidden', state.page !== key);
  }
  document.querySelector('#pageTitle').textContent = pages[state.page];
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === state.page));

  const isRealtime = state.page === 'realtime';
  document.getElementById('mainControls').classList.toggle('hidden', isRealtime);

  if (isRealtime) {
    startRealtime();
    updateCurrentDate();
    return;
  }
  stopRealtime();

  document.querySelectorAll('.segment button').forEach(b => b.classList.toggle('active', b.dataset.period === state.period));
  document.querySelector('#dateControls').innerHTML = dateControls();
  document.querySelector('#billOverview').classList.toggle('hidden', state.page === 'bill' && state.period === 'overview');
  document.querySelector('#billYear').classList.toggle('hidden', state.page !== 'bill');
  document.querySelector('#billYear').style.marginTop = (state.page === 'bill' && state.period === 'overview') ? '0' : '16px';
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
  // RT appliance dropdown
  const rtItem = e.target.closest('[data-rt-app]');
  if (rtItem) {
    const app = rtItem.dataset.rtApp;
    rtState.appliance = app;
    rtState.power = []; rtState.voltage = []; rtState.current = []; rtState.pf = []; rtState.t = 0;
    document.getElementById('rtSelectedApplianceLabel').textContent = rtProfiles[app]?.label || 'Total House';
    document.querySelectorAll('#rtApplianceDropdownMenu .dropdown-item').forEach(d => d.classList.toggle('active', d.dataset.rtApp === app));
    document.querySelectorAll('.select-pill.open').forEach(p => p.classList.remove('open'));
    stopRealtime(); startRealtime();
    return;
  }

  const pill = e.target.closest('.select-pill');
  document.querySelectorAll('.select-pill.open').forEach(p => { if (p !== pill) p.classList.remove('open'); });
  if (pill) { pill.classList.toggle('open'); e.stopPropagation(); }
  const item = e.target.closest('.dropdown-item');
  if (item && item.dataset.type) {
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
  if (circle?.querySelector('title')) {
    tooltip.textContent = circle.querySelector('title').textContent;
    tooltip.style.display = 'block';
  } else if (rect?.dataset.value) {
    tooltip.textContent = rect.dataset.value;
    tooltip.style.display = 'block';
  }
});

document.addEventListener('mousemove', e => {
  if (tooltip.style.display === 'block') {
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let tx = e.clientX + 14, ty = e.clientY - 34;
    if (tx + tw > window.innerWidth - 8) tx = e.clientX - tw - 14;
    if (ty < 4) ty = e.clientY + 16;
    if (ty + th > window.innerHeight - 4) ty = window.innerHeight - th - 4;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  }
});

document.addEventListener('mouseout', e => {
  if (e.target.closest('circle') || e.target.closest('rect[rx]')) tooltip.style.display = 'none';
});

updateVisibility();
