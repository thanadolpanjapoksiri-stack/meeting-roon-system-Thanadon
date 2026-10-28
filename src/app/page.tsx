"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck2,
  Clock,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { formatThaiDate, formatTimeRange, getStatusBadgeClass, getStatusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { rooms, bookings, currentUser } = useEnterprise();

  // Dynamic calculations from database
  const totalRooms = rooms.length;
  
  // Available rooms right now
  const now = new Date();
  const currentlyBookedRoomIds = useMemo(() => {
    const currentTime = now.getTime();
    return bookings
      .filter((b) => {
        if (b.status !== "approved") return false;
        const start = new Date(b.start_time).getTime();
        const end = new Date(b.end_time).getTime();
        return currentTime >= start && currentTime < end;
      })
      .map((b) => b.room_id);
  }, [bookings, now]);

  const availableRoomsNow = rooms.filter(
    (r) => r.status === "available" && !currentlyBookedRoomIds.includes(r.id)
  ).length;

  // Today's bookings
  const todayBookings = useMemo(() => {
    const todayStr = now.toISOString().slice(0, 10);
    return bookings.filter((b) => b.start_time.slice(0, 10) === todayStr);
  }, [bookings, now]);

  // Pending approvals
  const pendingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "pending");
  }, [bookings]);

  // Upcoming bookings
  const upcomingBookings = useMemo(() => {
    const currentTime = now.getTime();
    return bookings
      .filter((b) => {
        const start = new Date(b.start_time).getTime();
        return start >= currentTime && b.status !== "cancelled" && b.status !== "rejected";
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5);
  }, [bookings, now]);

  // Weekly Trend Chart Data (Last 7 Days)
  const weeklyTrendData = useMemo(() => {
    const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    const dataMap: { [key: string]: { day: string; count: number; hours: number } } = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayLabel = days[d.getDay()];
      dataMap[dateKey] = { day: `${dayLabel} (${d.getDate()})`, count: 0, hours: 0 };
    }

    bookings.forEach((b) => {
      const dateKey = b.start_time.slice(0, 10);
      if (dataMap[dateKey]) {
        dataMap[dateKey].count += 1;
        const durationHours =
          (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
        dataMap[dateKey].hours += Math.round(durationHours * 10) / 10;
      }
    });

    return Object.values(dataMap);
  }, [bookings, now]);

  // Room Popularity Ranking
  const popularRooms = useMemo(() => {
    const map: { [roomId: string]: { room: typeof rooms[0]; count: number; totalHours: number } } = {};
    rooms.forEach((r) => {
      map[r.id] = { room: r, count: 0, totalHours: 0 };
    });

    bookings.forEach((b) => {
      if (map[b.room_id] && (b.status === "approved" || b.status === "pending")) {
        map[b.room_id].count += 1;
        const durationHours =
          (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
        map[b.room_id].totalHours += Math.round(durationHours * 10) / 10;
      }
    });

    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [rooms, bookings]);

  // Status Pie Chart
  const statusPieData = useMemo(() => {
    const counts = { approved: 0, pending: 0, cancelled: 0, rejected: 0 };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status] += 1;
      }
    });

    return [
      { name: "อนุมัติแล้ว", value: counts.approved, color: "#10b981" },
      { name: "รออนุมัติ", value: counts.pending, color: "#f59e0b" },
      { name: "ยกเลิกแล้ว", value: counts.cancelled, color: "#f43f5e" },
      { name: "ไม่อนุมัติ", value: counts.rejected, color: "#94a3b8" },
    ].filter((item) => item.value > 0);
  }, [bookings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-brand-900 text-white p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ยินดีต้อนรับสู่ระบบบริหารห้องประชุม</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              สวัสดี, {currentUser.full_name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              วันนี้มีห้องประชุมพร้อมใช้งาน {availableRoomsNow} จาก {totalRooms} ห้อง มีการจองวันนี้ทั้งหมด {todayBookings.length} รายการ และมีรายการรออนุมัติ {pendingBookings.length} รายการ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create-booking"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>จองห้องประชุมใหม่</span>
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-navy-800/80 hover:bg-navy-700/80 text-slate-200 border border-navy-700/80 font-medium text-sm transition-all"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>ดูปฏิทิน</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Rooms */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ห้องประชุมทั้งหมด
            </span>
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalRooms}</span>
            <span className="text-xs text-slate-500">ห้อง</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>พร้อมใช้งานปกติ</span>
          </div>
        </div>

        {/* Available Rooms Right Now */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ห้องว่างในขณะนี้
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{availableRoomsNow}</span>
            <span className="text-xs text-slate-500">/ {totalRooms} ห้อง</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {totalRooms - availableRoomsNow > 0
              ? `มี ${totalRooms - availableRoomsNow} ห้องกำลังมีการประชุม`
              : "ทุกห้องว่างพร้อมสำหรับการใช้งาน"}
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              การจองวันนี้
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{todayBookings.length}</span>
            <span className="text-xs text-slate-500">รายการ</span>
          </div>
          <div className="mt-2 text-xs text-sky-600 font-medium">
            {todayBookings.filter((b) => b.status === "approved").length} รายการได้รับอนุมัติแล้ว
          </div>
        </div>

        {/* Pending Approvals */}
        <Link
          href="/bookings?status=pending"
          className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-card transition-all group hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              รออนุมัติ
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{pendingBookings.length}</span>
            <span className="text-xs text-slate-500">คำขอ</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
            <span>คลิกเพื่อตรวจสอบ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Main Analytics & Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Utilization Trends Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  แนวโน้มการใช้งานห้องประชุม 7 วันล่าสุด
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  จำนวนครั้งและชั่วโมงการจองสะสมในแต่ละวัน
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                ข้อมูลจริงจากระบบ
              </span>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "12px",
                      border: "none",
                    }}
                    formatter={(value: any, name: any) => [
                      String(name) === "count" ? `${value} ครั้ง` : `${value} ชม.`,
                      String(name) === "count" ? "จำนวนการจอง" : "ระยะเวลา",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="count"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ชั่วโมงการใช้งานรวมสัปดาห์นี้: {weeklyTrendData.reduce((acc, d) => acc + d.hours, 0)} ชั่วโมง</span>
            <Link href="/reports" className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1">
              ดูรายงานละเอียด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Booking Status Distribution Pie Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-brand-600" />
              สัดส่วนสถานะการจองทั้งหมด
            </h3>
            <p className="text-xs text-slate-500">แบ่งตามสถานะปัจจุบันในฐานข้อมูล</p>

            <div className="h-52 w-full mt-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}:</span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Most Popular Rooms & Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Rooms */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600" />
              ห้องประชุมยอดนิยม (Most Popular Rooms)
            </h3>
            <Link href="/rooms" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-3.5">
            {popularRooms.map(({ room, count, totalHours }, idx) => (
              <div
                key={room.id}
                className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                  #{idx + 1}
                </div>
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                    {room.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {room.building} {room.floor} • ความจุ {room.capacity} ที่นั่ง
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-xs sm:text-sm text-brand-600">{count} การจอง</div>
                  <div className="text-[10px] text-slate-400">{totalHours} ชม. สะสม</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-brand-600" />
              รายการจองที่กำลังจะมาถึง
            </h3>
            <Link href="/bookings" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              ดูทั้งหมด
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              ไม่มีรายการจองที่กำลังจะมาถึงในเร็วๆ นี้
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {b.title}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {getStatusLabel(b.status)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="font-medium text-brand-700">{b.room?.name}</span>
                      <span>•</span>
                      <span>{b.attendees_count} ผู้เข้าร่วม</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatThaiDate(b.start_time)}</span>
                      <span>|</span>
                      <span>{formatTimeRange(b.start_time, b.end_time)}</span>
                      <span>|</span>
                      <span>โดย {b.user?.full_name}</span>
                    </div>
                  </div>

                  <Link
                    href={`/bookings?id=${b.id}`}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                    title="ดูรายละเอียด"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
