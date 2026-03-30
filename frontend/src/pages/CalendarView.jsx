import React, { useState } from 'react';
import styles from './CalendarView.module.css';

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildCalendarDays(year, month) {
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CalendarView() {
  const today  = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());

  const cells = buildCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Calendar View</h2>

        <div className={styles.calendarWrap}>
          {/* Month navigator */}
          <div className={styles.nav}>
            <button
              className={styles.navBtn}
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className={styles.monthLabel}>
              {MONTHS[month]} {year}
            </span>
            <button
              className={styles.navBtn}
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className={styles.grid} role="grid" aria-label={`${MONTHS[month]} ${year}`}>
            {DAYS.map((d) => (
              <div key={d} className={styles.dayName} role="columnheader" aria-label={d}>
                {d}
              </div>
            ))}

            {/* Day cells */}
            {cells.map((day, idx) => (
              <div
                key={idx}
                role={day ? 'gridcell' : 'presentation'}
                aria-label={day ? `${day} ${MONTHS[month]} ${year}` : undefined}
                aria-selected={day === selected}
                className={`
                  ${styles.cell}
                  ${!day           ? styles.empty    : ''}
                  ${isToday(day)   ? styles.today    : ''}
                  ${day === selected && !isToday(day) ? styles.selected : ''}
                `}
                onClick={() => day && setSelected(day)}
                tabIndex={day ? 0 : -1}
                onKeyDown={(e) => e.key === 'Enter' && day && setSelected(day)}
              >
                {day || ''}
              </div>
            ))}
          </div>
        </div>

        {/* Selected day detail */}
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailIcon}>📅</span>
            <span className={styles.detailDate}>
              {selected} {MONTHS[month]} {year}
            </span>
          </div>
          <p className={styles.detailMsg}>
            No reminders scheduled for this day.
          </p>
        </div>
      </div>
    </div>
  );
}
