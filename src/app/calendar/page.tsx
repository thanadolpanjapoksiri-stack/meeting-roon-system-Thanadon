"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Clock,
  Building,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import {
  formatThaiDate,
  formatTimeRange,
  getStatusBadgeClass,
  getStatusLabel,
  cn,
} from "@/lib/utils";
import { Booking, BookingStatus } from "@/types";

type CalendarView = "month" | "week" | "day";

export default function CalendarPage() {
  const { rooms, bookings } = useEnterprise();

  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("month");

  // Filters
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Quick View / Slot Details Modal
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Navigate functions
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (view === "month") next.setMonth(next.getMonth() - 1);
    else if (view === "week") next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (view === "month") next.setMonth(next.getMonth() + 1);
    else if (view === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedRoomId !== "all" && b.room_id !== selectedRoomId) return false;
      if (selectedStatus !== "all" && b.status !== selectedStatus) return false;
      return true;
    });
  }, [bookings, selectedRoomId, selectedStatus]);

  // Month View Days Matrix
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const matrix: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      matrix.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().slice(0, 10),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      matrix.push({
        date: d,
        isCurrentMonth: true,
        dateStr: d.toISOString().slice(0, 10),
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const remaining = 35 - matrix.length;
    if (remaining > 0) {
      for (let day = 1; day <= remaining; day++) {
        const d = new Date(year, month + 1, day);
        matrix.push({
          date: d,
          isCurrentMonth: false,
          dateStr: d.toISOString().slice(0, 10),
        });
      }
    }

    return matrix;
  }, [currentDate]);

  // Week View Days Matrix
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday

    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(d.setDate(diff + i));
      days.push({
        date: nextDate,
        dateStr: nextDate.toISOString().slice(0, 10),
      });
    }
    return days;
  }, [currentDate]);

  // Hours array for Day & Week view (08:00 to 19:00)
  const timeHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  return (
    <div className="space-y-6">
      {/* Page Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-brand-600" />
            ปฏิทินการจองห้องประชุม (Booking Calendar)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจสอบตารางการใช้งานห้องประชุมแบบเรียลไทม์ และคลิกเลือกช่วงเวลาเพื่อจองห้องได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/create-booking"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างการจองใหม่</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar & View Switcher */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation & Current Month/Date Label */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            วันนี้ (Today)
          </button>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-l-lg transition-colors"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-r-lg transition-colors"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-base font-bold text-slate-800 ml-1">
            {formatThaiDate(currentDate.toISOString())}
          </span>
        </div>

        {/* View Switcher (Month / Week / Day) */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Room Filter */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">ทุกห้องประชุม (All Rooms)</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">ทุกสถานะ (All Status)</option>
              <option value="approved">อนุมัติแล้ว (Approved)</option>
              <option value="pending">รออนุมัติ (Pending)</option>
              <option value="cancelled">ยกเลิกแล้ว (Cancelled)</option>
            </select>
          </div>

          {/* View Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1 rounded-lg capitalize transition-all",
                  view === v
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {v === "month" ? "เดือน" : v === "week" ? "สัปดาห์" : "วัน"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap px-1">
        <span className="font-semibold text-slate-500">สัญลักษณ์สถานะ:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>อนุมัติแล้ว</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>รออนุมัติ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>ยกเลิก/ไม่อนุมัติ</span>
        </div>
      </div>

      {/* CALENDAR VIEWS */}

      {/* 1. MONTH VIEW */}
      {view === "month" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-3">
            <div>อาทิตย์</div>
            <div>จันทร์</div>
            <div>อังคาร</div>
            <div>พุธ</div>
            <div>พฤหัสบดี</div>
            <div>ศุกร์</div>
            <div>เสาร์</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {monthDays.map(({ date, isCurrentMonth, dateStr }, index) => {
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;
              const dayBookings = filteredBookings.filter(
                (b) => b.start_time.slice(0, 10) === dateStr
              );

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[115px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 group",
                    !isCurrentMonth && "bg-slate-50/40 text-slate-400",
                    isToday && "bg-blue-50/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full",
                        isToday
                          ? "bg-brand-600 text-white shadow-sm"
                          : isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-400"
                      )}
                    >
                      {date.getDate()}
                    </span>

                    <Link
                      href={`/create-booking?date=${dateStr}`}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 rounded hover:bg-white transition-opacity"
                      title="จองวันนี้"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Day Bookings List */}
                  <div className="mt-1.5 space-y-1 flex-1 overflow-y-auto max-h-24">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setActiveBooking(b)}
                        className={cn(
                          "px-2 py-1 rounded text-[11px] font-medium truncate cursor-pointer transition-transform hover:scale-[1.02]",
                          b.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border-l-2 border-emerald-600"
                            : b.status === "pending"
                            ? "bg-amber-100 text-amber-800 border-l-2 border-amber-600"
                            : "bg-rose-100 text-rose-800 border-l-2 border-rose-600 opacity-60"
                        )}
                        title={`${b.title} (${b.room?.name})`}
                      >
                        <span className="font-semibold mr-1">
                          {b.start_time.slice(11, 16)}
                        </span>
                        {b.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {view === "week" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
              <div className="text-slate-400">เวลา</div>
              {weekDays.map(({ date, dateStr }) => {
                const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                return (
                  <div
                    key={dateStr}
                    className={cn(isToday && "text-brand-600 font-extrabold")}
                  >
                    <div>{["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."][date.getDay()]}</div>
                    <div className="text-sm">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="divide-y divide-slate-100">
              {timeHours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[55px] text-xs">
                  <div className="p-2 border-r border-slate-100 text-slate-400 font-mono text-center">
                    {hour.toString().padStart(2, "0")}:00
                  </div>

                  {weekDays.map(({ dateStr }) => {
                    const slotBookings = filteredBookings.filter((b) => {
                      if (b.start_time.slice(0, 10) !== dateStr) return false;
                      const bStartHour = new Date(b.start_time).getHours();
                      return bStartHour === hour;
                    });

                    return (
                      <div
                        key={dateStr}
                        className="p-1 border-r border-slate-100 hover:bg-slate-50 transition-colors relative group"
                      >
                        {slotBookings.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => setActiveBooking(b)}
                            className={cn(
                              "p-1.5 rounded-lg text-[10px] font-medium cursor-pointer shadow-sm mb-1 leading-tight",
                              b.status === "approved"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : b.status === "pending"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            )}
                          >
                            <div className="font-bold truncate">{b.title}</div>
                            <div className="text-slate-600 truncate">{b.room?.name}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {view === "day" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">
              ตารางเวลาประจำวันที่ {formatThaiDate(currentDate.toISOString())}
            </span>
            <span className="text-xs text-slate-500">
              {filteredBookings.filter(
                (b) => b.start_time.slice(0, 10) === currentDate.toISOString().slice(0, 10)
              ).length}{" "}
              รายการ
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {timeHours.map((hour) => {
              const hourStr = `${hour.toString().padStart(2, "0")}:00`;
              const targetDateStr = currentDate.toISOString().slice(0, 10);
              const matchingBookings = filteredBookings.filter((b) => {
                if (b.start_time.slice(0, 10) !== targetDateStr) return false;
                const bHour = new Date(b.start_time).getHours();
                return bHour === hour;
              });

              return (
                <div key={hour} className="flex min-h-[65px] hover:bg-slate-50/60 transition-colors">
                  <div className="w-24 p-3 border-r border-slate-100 font-mono text-xs text-slate-500 text-center flex-shrink-0">
                    {hourStr}
                  </div>

                  <div className="flex-1 p-2 flex items-center gap-2 flex-wrap">
                    {matchingBookings.length === 0 ? (
                      <Link
                        href={`/create-booking?date=${targetDateStr}&time=${hourStr}`}
                        className="text-xs text-slate-400 hover:text-brand-600 italic px-2 py-1 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> ว่าง (คลิกเพื่อจองช่วงเวลานี้)
                      </Link>
                    ) : (
                      matchingBookings.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => setActiveBooking(b)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-medium cursor-pointer shadow-sm border transition-transform hover:scale-[1.01] flex items-center gap-3",
                            b.status === "approved"
                              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                              : b.status === "pending"
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          )}
                        >
                          <div>
                            <div className="font-bold">{b.title}</div>
                            <div className="text-[11px] opacity-80">
                              {b.room?.name} • {formatTimeRange(b.start_time, b.end_time)}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {getStatusLabel(b.status)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK DETAILS MODAL */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-elevated border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                    activeBooking.status
                  )}`}
                >
                  {getStatusLabel(activeBooking.status)}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {activeBooking.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {activeBooking.room?.name}
                  </span>
                  <div className="text-xs text-slate-500">
                    {activeBooking.room?.building} {activeBooking.room?.floor}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {formatThaiDate(activeBooking.start_time)}
                  </span>
                  <div className="text-xs text-slate-500">
                    {formatTimeRange(activeBooking.start_time, activeBooking.end_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {activeBooking.user?.full_name}
                  </span>
                  <div className="text-xs text-slate-500">
                    ผู้เข้าร่วม: {activeBooking.attendees_count} คน
                  </div>
                </div>
              </div>

              {activeBooking.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                  <span className="font-semibold block mb-1">รายละเอียดการประชุม:</span>
                  <p className="text-xs leading-relaxed">{activeBooking.description}</p>
                </div>
              )}

              {activeBooking.rejection_reason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-semibold block mb-1">เหตุผลที่ไม่อนุมัติ:</span>
                  <p className="text-xs leading-relaxed">{activeBooking.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/bookings?id=${activeBooking.id}`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                ดูข้อมูลการจองในระบบจัดการ →
              </Link>
              <button
                onClick={() => setActiveBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
