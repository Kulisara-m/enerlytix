import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell
} from "recharts";

/* ── palette ── */
const C = {
  blue: "#3B82F6",
  blueDark: "#2563EB",
  cyan: "#06B6D4",
  orange: "#F97316",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  gray900: "#111827",
  white: "#FFFFFF",
};

/* ── mock data ── */
const monthlyForecast = [
  { month: "Jan", actual: 28, forecast: null },
  { month: "Feb", actual: 32, forecast: null },
  { month: "Mar", actual: 35, forecast: null },
  { month: "Apr", actual: 38, forecast: null },
  { month: "May", actual: 45, forecast: null },
  { month: "Jun", actual: 52, forecast: null },
  { month: "Jul", actual: 60, forecast: 60 },
  { month: "Aug", actual: null, forecast: 68, upper: 78, lower: 58 },
  { month: "Sep", actual: null, forecast: 72, upper: 82, lower: 62 },
  { month: "Oct", actual: null, forecast: 75, upper: 85, lower: 65 },
  { month: "Nov", actual: null, forecast: 70, upper: 80, lower: 60 },
  { month: "Dec", actual: null, forecast: 65, upper: 75, lower: 55 },
];

const forecastBarData = [
  { month: "Jul", forecast: 1980, actual: 1800 },
  { month: "Aug", forecast: 2105, actual: 1900 },
  { month: "Sep", forecast: 1850, actual: 2000 },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: String(i).padStart(2, "0"),
  power: Math.round(20 + Math.random() * 60 + (i > 5 && i < 8 ? 30 : 0)),
}));
hourlyData[6].power = 89;

const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  power: Math.round(30 + Math.random() * 50 + (i === 11 ? 50 : 0)),
}));
dailyData[11].power = 89;

const monthlyData = [
  { month: "Jan", kwh: 68000 }, { month: "Feb", kwh: 65000 },
  { month: "Mar", kwh: 69000 }, { month: "Apr", kwh: 70000 },
  { month: "May", kwh: 63000 }, { month: "Jun", kwh: 67000 },
  { month: "Jul", kwh: 65000 }, { month: "Aug", kwh: 68000 },
  { month: "Sep", kwh: 64000 }, { month: "Oct", kwh: 67000 },
  { month: "Nov", kwh: 68000 }, { month: "Dec", kwh: 59000 },
];

const circuitBreakdown = [
  { name: "Air Conditioner", value: 38, color: "#06B6D4" },
  { name: "Water Heater", value: 18, color: "#F97316" },
  { name: "Refrigerator", value: 14, color: "#3B82F6" },
  { name: "Washer/Dryer", value: 12, color: "#F59E0B" },
  { name: "Other", value: 18, color: "#9CA3AF" },
];

const usagePattern = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(h => ({
  hour: String(h).padStart(2,"0"),
  level: h < 6 ? 0 : h < 8 ? 1 : h < 11 ? 2 : h < 14 ? 3 : h < 16 ? 1 : h < 18 ? 2 : h < 22 ? 3 : 2,
}));

const usageColors = ["#A7F3D0","#6EE7B7","#F59E0B","#EF4444"];

const billingHistoryMonthly = Array.from({length:30},(_,i)=>({
  day: i+1,
  cost: Math.round(50 + Math.random()*50),
}));

const billingHistoryOverview = monthlyData.map(m=>({
  month: m.month,
  cost: Math.round(m.kwh / 10),
}));

const alerts = [
  { date:"04 Aug 2026", time:"2 AM", topic:"Voltage Drop", desc:"แรงดันไฟเฉลี่ยต่ำกว่า 200V เกิน 2 ชั่วโมง", severity:"Warning" },
  { date:"04 Aug 2026", time:"4 AM", topic:"Overload", desc:"Circuit 4 ใช้กระแสไฟเกิน 20A", severity:"Critical" },
];

/* ── shared components ── */
function Logo() {
  return (
    <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5, color: C.gray900 }}>
      <span style={{ color: C.blue }}>Ener</span>lytix
    </div>
  );
}

function StatCard({ label, value, unit, sub, subColor, subIcon }) {
  const color = subColor === "green" ? C.green : subColor === "red" ? C.red : C.gray400;
  return (
    <div style={{
      background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`,
      padding: "20px 24px", flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 13, color: C.gray400, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: C.gray900 }}>{value}</span>
        <span style={{ fontSize: 13, color: C.gray400 }}>{unit}</span>
      </div>
      {sub && (
        <div style={{ fontSize: 12, color, display: "flex", alignItems: "center", gap: 4 }}>
          {subIcon && <span>{subIcon}</span>}
          {sub}
        </div>
      )}
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 0, background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 8, overflow: "hidden" }}>
      {tabs.map(t => (
        <button key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "8px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: active === t ? C.blue : "transparent",
            color: active === t ? C.white : C.gray600,
            transition: "all .15s",
          }}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Select({ options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "7px 28px 7px 12px", border: `1px solid ${C.gray200}`, borderRadius: 8,
        fontSize: 13, background: C.white, color: C.gray900, cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
      }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`,
      padding: 24, ...style,
    }}>
      {children}
    </div>
  );
}

/* ── DASHBOARD page ── */
function DashboardPage() {
  const [tab, setTab] = useState("Overview");
  const [month, setMonth] = useState("Aug");
  const [day, setDay] = useState("04");
  const [year, setYear] = useState("2020");

  const chartData = tab === "Daily" ? hourlyData.map(h=>({name:h.hour, power:h.power}))
    : tab === "Monthly" ? dailyData.map(d=>({name:String(d.day), power:d.power}))
    : monthlyData.map(m=>({name:m.month, power:Math.round(m.kwh/1000)}));

  const peakIdx = chartData.reduce((mx,d,i)=>d.power>chartData[mx].power?i:mx,0);

  const stats = tab === "Daily"
    ? { total:"980 kWh", label:"Total Energy (1 day)", delta:"8.5% from yesterday" }
    : tab === "Monthly"
    ? { total:"28,900 kWh", label:"Total Energy (1 month)", delta:"8.5% from last month" }
    : { total:"159,638 kWh", label:"Total Energy (1 Year)", delta:"8.5% from last year" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Tabs tabs={["Overview","Monthly","Daily"]} active={tab} onChange={setTab} />
        {tab === "Daily" && <Select options={["04","05","06","07","08"]} value={day} onChange={setDay} />}
        {(tab === "Daily" || tab === "Monthly") && <Select options={["Aug","Jul","Sep","Oct"]} value={month} onChange={setMonth} />}
        <Select options={["2020","2021","2022"]} value={year} onChange={setYear} />
      </div>

      {/* stat cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label={stats.label} value={stats.total.split(" ")[0]} unit={stats.total.split(" ")[1]} sub={`↗ ${stats.delta}`} subColor="green" />
        <StatCard label="Avg. Power" value="18.2" unit="kW" sub="Stable" subColor="green" />
        <StatCard label="Power Factor" value="0.96" sub="Normal" subColor="green" />
        <StatCard label="Avg. Voltage" value="232.9" unit="V" sub="Normal" subColor="green" />
        <StatCard label="Peak Power" value="29.2" unit="kW" sub="06/05/22 21:00" subColor="red" />
      </div>

      {/* energy trend */}
      <Card>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 20 }}>Energy Trend</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} domain={[0,100]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 12 }}
              formatter={(v) => [`${v} kW`, "Power"]}
            />
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <Line type="monotone" dataKey="power" stroke={C.blue} strokeWidth={2} dot={(props) => {
              if (props.index === peakIdx) return (
                <circle key="peak" cx={props.cx} cy={props.cy} r={5} fill={C.blue} />
              );
              if (tab === "Overview") return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill={C.blue} />;
              return <circle key={props.index} r={0} />;
            }}
            activeDot={{ r: 4, fill: C.blue }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* bottom row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Circuit Breakdown */}
        <Card style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 16 }}>Circuit Breakdown</div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <PieChart width={140} height={140}>
              <Pie data={circuitBreakdown} cx={65} cy={65} innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
                {circuitBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {circuitBreakdown.map(e => (
                <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <span style={{ color: C.gray600, minWidth: 100 }}>{e.name}</span>
                  <span style={{ color: C.gray900, fontWeight: 600 }}>{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Daily Usage Pattern */}
        <Card style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 16 }}>Daily Usage Pattern</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 16 }}>
            {usagePattern.map(u => (
              <div key={u.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: usageColors[u.level],
                }} />
                <span style={{ fontSize: 9, color: C.gray400 }}>{u.hour}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.gray600 }}>
            <span>Low</span>
            {usageColors.map((c, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c }} />
            ))}
            <span>High</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── ENERGY FORECAST page ── */
function EnergyForecastPage() {
  const [tab, setTab] = useState("Monthly");
  const [month, setMonth] = useState("Aug");
  const [day, setDay] = useState("04");
  const [year, setYear] = useState("2020");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Tabs tabs={["Overview","Monthly","Daily"]} active={tab} onChange={setTab} />
        {tab === "Daily" && <Select options={["04","05","06","07","08"]} value={day} onChange={setDay} />}
        {(tab === "Daily" || tab === "Monthly") && <Select options={["Aug","Jul","Sep","Oct"]} value={month} onChange={setMonth} />}
        <Select options={["2020","2021","2022"]} value={year} onChange={setYear} />
      </div>

      {/* stat cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="August (Forecast)" value="1,980" unit="kWh" sub="↗ 8.5% Up from Jul" subColor="green" />
        <StatCard label="September (Forecast)" value="2,105" unit="kWh" sub="↗ 1.3% Up from Aug" subColor="green" />
        <StatCard label="October (Forecast)" value="1,850" unit="kWh" sub="↘ 4.3% Down from Sep" subColor="red" />
        <StatCard label="August Electricity (Forecast)" value="6,820" unit="Baht" sub="↗ 1.8% Up from Jul" subColor="green" />
      </div>

      {/* line chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900 }}>Actual vs Forecast (kWh)</div>
          <div style={{ background: C.cyan, color: C.white, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
            Accuracy 80%
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyForecast} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} domain={[0,100]} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x="Jul" stroke={C.amber} strokeDasharray="5 5"
              label={{ value: "ปัจจุบัน —", position: "top", fontSize: 11, fill: C.amber }} />
            <Line type="monotone" dataKey="actual" stroke={C.cyan} strokeWidth={2.5} dot={false} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke={C.orange} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" connectNulls={true} />
            <Line type="monotone" dataKey="upper" stroke={C.gray200} strokeWidth={1} dot={false} name="Upper" legendType="none" connectNulls={true} />
            <Line type="monotone" dataKey="lower" stroke={C.gray200} strokeWidth={1} dot={false} name="Lower" legendType="none" connectNulls={true} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* bar chart */}
      <Card>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 20 }}>Actual vs Forecast (kWh)</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={forecastBarData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.gray600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} domain={[0,2500]} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="forecast" fill={C.orange} name="Forecast" radius={[4,4,0,0]} label={{ position: "top", fontSize: 11, fill: C.gray600 }} />
            <Bar dataKey="actual" fill={C.cyan} name="Actual" radius={[4,4,0,0]} label={{ position: "top", fontSize: 11, fill: C.gray600 }} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ── BILL CALCULATOR page ── */
function BillCalculatorPage() {
  const [tab, setTab] = useState("Overview");
  const [month, setMonth] = useState("Aug");
  const [day, setDay] = useState("04");
  const [year, setYear] = useState("2020");

  const billingDetails = [
    { range: "0-150 kWh", rate: "3.2484 Baht/kWh", amount: "487.26" },
    { range: "151-400 kWh", rate: "4.2218 Baht/kWh", amount: "1,055.45" },
    { range: ">400 kWh", rate: "4.4217 Baht/kWh", amount: "4,071.31" },
    { range: "Service Fee", rate: null, amount: "38.22" },
    { range: "FT Rate", rate: null, amount: "380.37" },
    { range: "VAT 7%", rate: null, amount: "407.59" },
  ];

  const histData = tab === "Overview" ? billingHistoryOverview : billingHistoryMonthly.map(d => ({ month: String(d.day), cost: d.cost }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Tabs tabs={["Overview","Monthly","Daily"]} active={tab} onChange={setTab} />
        {tab === "Daily" && <Select options={["04","05","06","07","08"]} value={day} onChange={setDay} />}
        {(tab === "Daily" || tab === "Monthly") && <Select options={["Aug","Jul","Sep","Oct"]} value={month} onChange={setMonth} />}
        <Select options={["2020","2021","2022"]} value={year} onChange={setYear} />
      </div>

      {/* stat cards */}
      {tab === "Overview" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard label="Total Annual Bill" value="100,320" unit="Baht" sub="↗ 8.5% Up from last year" subColor="green" />
          <StatCard label="Highest" value="5,614" unit="Baht" sub="+ VAT 7%" subColor={null} />
          <StatCard label="Lowest" value="1,390" unit="Baht" sub="+ VAT 7%" subColor={null} />
          <StatCard label="Average Monthly Bill" value="6,240" unit="Baht" sub="+ VAT 7%" subColor={null} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard label="August" value="1,842" unit="kWh" sub="↗ 8.5% Up from Jul" subColor="green" />
          <StatCard label="Energy Cost" value="5,614" unit="Baht" sub="Before FT & VAT" subColor={null} />
          <StatCard label="FT Rate" value="+380" unit="Baht" sub={null} />
          <StatCard label="Net Total" value="6,240" unit="Baht" sub="+ VAT 7%" subColor={null} />
        </div>
      )}

      {tab === "Overview" ? (
        /* overview: just billing history chart */
        <Card>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 20 }}>Billing History</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={billingHistoryOverview} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 12 }} formatter={v=>[`${v.toLocaleString()} Baht`,"Cost"]} />
              <Bar dataKey="cost" fill={C.cyan} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        /* monthly/daily: 2-col layout */
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* billing details */}
          <Card style={{ flex: 1.2, minWidth: 280 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 16 }}>Billing Details</div>
            {billingDetails.map((row, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0",
                borderTop: i > 0 ? `1px solid ${C.gray100}` : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: row.range === "VAT 7%" || row.range === "Service Fee" || row.range === "FT Rate" ? 400 : 600, color: C.gray900 }}>{row.range}</div>
                  {row.rate && <div style={{ fontSize: 11, color: C.gray400, marginTop: 2 }}>{row.rate}</div>}
                </div>
                <div style={{ fontSize: 13, color: C.gray600 }}>{row.amount} Baht</div>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between", paddingTop: 12,
              borderTop: `1px solid ${C.gray200}`, marginTop: 4,
            }}>
              <span style={{ fontWeight: 600, color: C.blue, fontSize: 14 }}>Net Total</span>
              <span style={{ fontWeight: 700, color: C.blue, fontSize: 14 }}>6,240 Baht</span>
            </div>
          </Card>

          {/* billing history */}
          <Card style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, marginBottom: 16 }}>Billing History</div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={billingHistoryMonthly} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }} barSize={6}>
                <XAxis type="number" tick={{ fontSize: 10, fill: C.gray400 }} axisLine={false} tickLine={false} domain={[0,100]} />
                <YAxis type="category" dataKey="day" tick={{ fontSize: 10, fill: C.gray400 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="cost" fill={C.cyan} radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── ALERT page ── */
function AlertPage() {
  const [tab, setTab] = useState("Overview");
  const [month, setMonth] = useState("Aug");
  const [day, setDay] = useState("04");
  const [year, setYear] = useState("2020");

  const severityStyle = (s) => ({
    padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
    background: s === "Critical" ? "#FEE2E2" : "#FEF3C7",
    color: s === "Critical" ? "#DC2626" : "#D97706",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Tabs tabs={["Overview","Monthly","Daily"]} active={tab} onChange={setTab} />
        {tab === "Daily" && <Select options={["04","05","06","07","08"]} value={day} onChange={setDay} />}
        {(tab === "Daily" || tab === "Monthly") && <Select options={["Aug","Jul","Sep","Oct"]} value={month} onChange={setMonth} />}
        <Select options={["2020","2021","2022"]} value={year} onChange={setYear} />
      </div>

      {/* alert table */}
      <Card style={{ padding: 0 }}>
        {/* header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 3fr 1.2fr",
          padding: "12px 24px", borderBottom: `1px solid ${C.gray200}`,
        }}>
          {["DATE","TIME","TOPIC","DESCRIPTION","SEVERITY"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.gray400, letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>
        {/* rows */}
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 3fr 1.2fr",
            padding: "16px 24px", borderBottom: i < alerts.length - 1 ? `1px solid ${C.gray100}` : "none",
            alignItems: "center",
          }}>
            <div style={{ fontSize: 13, color: C.gray900 }}>{a.date}</div>
            <div style={{ fontSize: 13, color: C.gray900 }}>{a.time}</div>
            <div style={{ fontSize: 13, color: C.gray900 }}>{a.topic}</div>
            <div style={{ fontSize: 13, color: C.gray600 }}>{a.desc}</div>
            <div><span style={severityStyle(a.severity)}>{a.severity}</span></div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: C.gray400, fontSize: 13 }}>No alerts found</div>
        )}
      </Card>
    </div>
  );
}

/* ── ROOT APP ── */
export default function App() {
  const [page, setPage] = useState("Dashboard");

  const pages = {
    Dashboard: { component: <DashboardPage />, nav: "Dashboard" },
    "Energy Forecast": { component: <EnergyForecastPage />, nav: "Analysis" },
    "Bill Calculator": { component: <BillCalculatorPage />, nav: "Analysis" },
    Alert: { component: <AlertPage />, nav: "Analysis" },
  };

  const analysisPages = ["Energy Forecast", "Bill Calculator", "Alert"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.gray50, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* sidebar */}
      <div style={{
        width: 200, background: C.white, borderRight: `1px solid ${C.gray200}`,
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "0 20px 24px" }}>
          <Logo />
        </div>
        {/* nav item */}
        {[
          { label: "Dashboard", section: null },
          { label: "ANALYSIS", section: true },
          { label: "Energy Forecast", section: false },
          { label: "Bill Calculator", section: false },
          { label: "Alert", section: false },
        ].map((item, i) => {
          if (item.section === true) return (
            <div key={i} style={{ padding: "16px 20px 6px", fontSize: 10, fontWeight: 700, color: C.gray400, letterSpacing: 1 }}>
              ANALYSIS
            </div>
          );
          const isActive = page === item.label;
          return (
            <button key={item.label}
              onClick={() => setPage(item.label)}
              style={{
                display: "flex", alignItems: "center", padding: "10px 20px",
                background: isActive ? C.blue : "transparent",
                color: isActive ? C.white : C.gray600,
                border: "none", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                textAlign: "left", width: "100%", borderRadius: isActive ? "0 8px 8px 0" : 0,
                transition: "all .15s", marginRight: isActive ? 12 : 0,
                position: "relative",
              }}>
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: 3, background: C.blue, borderRadius: "0 3px 3px 0",
                }} />
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* main content */}
      <div style={{ flex: 1, padding: "32px 32px 48px", overflowY: "auto", maxWidth: "calc(100vw - 200px)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.gray900, margin: "0 0 24px" }}>{page}</h1>
        {pages[page].component}
      </div>
    </div>
  );
}
