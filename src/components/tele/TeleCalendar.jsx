import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import { teleLeads } from '../../data/mockData'

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  // Fill empty cells before first day
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function TeleCalendar() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const cells = getMonthDays(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  })

  // Get appointments for selected day
  const appointments = teleLeads
    .filter((lead) => {
      if (!lead.appointmentAt) return false
      const d = new Date(lead.appointmentAt)
      return (
        d.getDate() === selectedDay &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
    })
    .sort((a, b) => new Date(a.appointmentAt) - new Date(b.appointmentAt))

  // Count appointments per day
  const getAppointmentsForDay = (day) => {
    if (!day) return []
    return teleLeads.filter((lead) => {
      if (!lead.appointmentAt) return false
      const d = new Date(lead.appointmentAt)
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
  }

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {/* Calendar Grid */}
      <div className="md:col-span-2 lg:col-span-2 card p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="btn-secondary px-3 py-1.5">
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-base font-semibold text-slate-800 capitalize">{monthName}</h3>
          <button onClick={nextMonth} className="btn-secondary px-3 py-1.5">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            const dayAppts = day ? getAppointmentsForDay(day) : []
            const isSelected = day === selectedDay
            return (
              <button
                key={idx}
                disabled={!day}
                onClick={() => day && setSelectedDay(day)}
                className={`
                  relative flex flex-col items-center justify-start pt-1.5 pb-1 px-0.5 rounded-lg transition-all
                  ${!day ? 'cursor-default min-h-[56px] md:min-h-[72px]' : 'cursor-pointer hover:bg-slate-50 min-h-[56px] md:min-h-[72px]'}
                  ${isSelected ? 'bg-primary-50 ring-2 ring-primary-400' : ''}
                  ${isToday(day) && !isSelected ? 'bg-blue-50' : ''}
                `}
              >
                {day && (
                  <>
                    <span
                      className={`text-sm font-medium mb-1 ${
                        isSelected
                          ? 'text-primary-700'
                          : isToday(day)
                          ? 'text-blue-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayAppts.length > 0 && (
                      <div className="w-full space-y-0.5">
                        {dayAppts.slice(0, 2).map((appt) => (
                          <div
                            key={appt.leadId}
                            className="text-[10px] px-1 py-0.5 rounded truncate font-medium"
                            style={{
                              backgroundColor: `${appt.service.color}20`,
                              color: appt.service.color,
                            }}
                          >
                            {formatTime(appt.appointmentAt)} {appt.customerName.split(' ').slice(-1)[0]}
                          </div>
                        ))}
                        {dayAppts.length > 2 && (
                          <div className="text-[10px] text-slate-400 text-center">
                            +{dayAppts.length - 2} khác
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" />
            Hôm nay
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary-100 border border-primary-300 inline-block" />
            Đang chọn
          </span>
        </div>
      </div>

      {/* Appointments for selected day */}
      <div className="card p-4 md:sticky md:top-0 md:max-h-[calc(100vh-280px)] md:overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon size={18} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-slate-800">
            Lịch hẹn ngày {selectedDay.toString().padStart(2, '0')}/{(currentMonth + 1).toString().padStart(2, '0')}
          </h3>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Không có lịch hẹn nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.leadId}
                className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: appt.service.color }}
                  />
                  <span className="text-xs font-medium text-slate-600">{appt.service.name}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800">{appt.customerName}</h4>
                <p className="text-xs text-slate-500">{appt.customerPhone}</p>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock size={12} className="text-emerald-500" />
                    <span className="font-medium">{formatTime(appt.appointmentAt)}</span>
                  </div>
                  {appt.appointmentBranch && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin size={12} className="text-orange-500" />
                      <span>{appt.appointmentBranch.name}</span>
                    </div>
                  )}
                </div>

                {appt.noteTele && (
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5 line-clamp-2">
                    {appt.noteTele}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
