import { useState } from 'react';

interface DateRangePickerProps {
  onClose: () => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DateRangePicker({ onClose }: DateRangePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-popup" onClick={(e) => e.stopPropagation()}>
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>‹</button>
        <span className="calendar-month-year">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button className="calendar-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`calendar-day ${day ? 'calendar-day-valid' : ''} ${day && isToday(day) ? 'calendar-day-today' : ''}`}
            onClick={() => { if (day) onClose(); }}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
}
