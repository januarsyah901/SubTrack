
import React, { useMemo } from 'react';
import { Subscription, DayData, BillingCycle } from '../types';
import { MONTH_NAMES, DAY_NAMES } from '../constants';

interface CalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
  subscriptions: Subscription[];
}

const Calendar: React.FC<CalendarProps> = ({ 
  currentDate, 
  onDateClick, 
  selectedDate, 
  subscriptions 
}) => {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Day of week for first day (0=Sun, 1=Mon, ...) -> Convert to 0=Mon
    let startingDay = firstDay.getDay() - 1;
    if (startingDay === -1) startingDay = 6; // Sunday is 6

    // Last day of current month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const days: DayData[] = [];

    // Prev month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        subscriptions: subscriptions.filter(s => s.billing_date === d.getDate())
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        subscriptions: subscriptions.filter(s => s.billing_date === i)
      });
    }

    // Next month days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        subscriptions: subscriptions.filter(s => s.billing_date === i)
      });
    }

    return days;
  }, [currentDate, subscriptions]);

  const isSelected = (date: Date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex-1 select-none">
      <div className="grid grid-cols-7 gap-2">
        {DAY_NAMES.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-500 pb-2">
            {day}
          </div>
        ))}

        {calendarDays.map((day, idx) => (
          <div
            key={idx}
            onClick={() => onDateClick(day.date)}
            className={`
              relative aspect-square rounded-xl flex flex-col items-center justify-start p-1.5 cursor-pointer transition-all duration-200
              ${day.isCurrentMonth ? 'bg-[#2c2c2e] hover:bg-[#3a3a3c]' : 'date-cell-inactive text-gray-600'}
              ${isSelected(day.date) ? 'ring-2 ring-orange-500 bg-[#3a2a22]' : ''}
              ${isToday(day.date) ? 'ring-1 ring-gray-400' : ''}
            `}
          >
            <span className={`text-xs ${isSelected(day.date) ? 'text-orange-500 font-bold' : ''}`}>
              {day.date.getDate()}
            </span>
            
            {/* Subscription Indicators */}
            <div className="flex flex-col items-center mt-1 w-full gap-1">
              {day.subscriptions.slice(0, 1).map(sub => (
                <div key={sub.id} className="relative flex flex-col items-center">
                  <span 
                    className={`absolute -top-6 -right-3 w-1.5 h-1.5 rounded-full ${sub.cycle === BillingCycle.YEARLY ? 'bg-yellow-400' : 'bg-purple-500'}`}
                  />
                  <i className={`${sub.icon} text-lg`} style={{ color: sub.color }}></i>
                </div>
              ))}
              {day.subscriptions.length > 1 && (
                <div className="text-[8px] font-bold text-gray-400">+{day.subscriptions.length - 1} more</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
