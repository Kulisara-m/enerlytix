import { useState, useRef, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions" ref={pickerRef}>
        <button
          className="date-range-btn"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <span>Select Date Range</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1.415 0L6 4.585L10.585 0L12 1.415L6 7.415L0 1.415L1.415 0Z" fill="#202224" />
          </svg>
        </button>
        {showDatePicker && (
          <div className="date-picker-dropdown">
            <DateRangePicker onClose={() => setShowDatePicker(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
