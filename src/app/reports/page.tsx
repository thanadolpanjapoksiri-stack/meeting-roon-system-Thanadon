"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
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
  Legend,
} from "recharts";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { formatThaiDate, exportToCSV, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const { rooms, bookings, departments } = useEnterprise();

  // Date Range Filter
  const [rangeFilter, setRangeFilter] = useState<"7days" | "30days" | "all">("30days");

  // Filtered Bookings based on range
  const filteredBookings = useMemo(() => {
    if (rangeFilter === "all") return bookings;

    const days = rangeFilter === "7days" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();

    return bookings.filter((b) => b.start_time >= cutoffStr);
  }, [bookings, rangeFilter]);

  // Metric 1: Room Utilization Breakdown
  const roomStats = useMemo(() => {
    const stats: { [roomId: string]: { name: string; count: number; hours: number; capacity: number } } = {};
    rooms.forEach((r) => {
      stats[r.id] = { name: r.name.split("(")[0].trim(), count: 0, hours: 0, capacity: r.capacity };
    });

    filteredBookings.forEach((b) => {
      if (stats[b.room_id] && (b.status === "approved" || b.status === "pending")) {
        stats[b.room_id].count += 1;
        const dur = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
        stats[b.room_id].hours += Math.round(dur * 10) / 10;
      }
    });

    return Object.values(stats);
  }, [rooms, filteredBookings]);

  // Metric 2: Department Utilization
  const departmentStats = useMemo(() => {
    const map: { [deptName: string]: number } = {};
    departments.forEach((d) => {
      map[d.code] = 0;
    });
    map["OTHER"] = 0;

    filteredBookings.forEach((b) => {
      const code = b.user?.department?.code || "OTHER";
      if (map[code] !== undefined) {
        map[code] += 1;
      } else {
        map[code] = 1;
      }
    });

    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  }, [departments, filteredBookings]);

  // Metric 3: Cancellation & Rejection Analysis
  const cancellationStats = useMemo(() => {
    const cancelled = filteredBookings.filter((b) => b.status === "cancelled");
    const rejected = filteredBookings.filter((b) => b.status === "rejected");
    const approved = filteredBookings.filter((b) => b.status === "approved");

    return [
      { name: "อนุมัติสำเร็จ", value: approved.length, color: "#10b981" },
      { name: "ยกเลิกโดยผู้จอง", value: cancelled.length, color: "#f43f5e" },
      { name: "ไม่อนุมัติโดยฝ่ายดูแล", value: rejected.length, color: "#f59e0b" },
    ].filter((item) => item.value > 0);
  }, [filteredBookings]);

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = roomStats.map((r) => ({
      ชื่อห้องประชุม: r.name,
      ความจุที่นั่ง: r.capacity,
      จำนวนครั้งที่ถูกจอง: r.count,
      ชั่วโมงการใช้งานสะสม: r.hours,
    }));
    exportToCSV("room_utilization_report", rows);
    toast.success("ดาวน์โหลดรายงานสถิติเป็น CSV เรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-8">
      {/* Header (No print buttons hidden in print mode) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            รายงานและสถิติการใช้งาน (Reports & Analytics)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สรุปข้อมูลเชิงลึก อัตราการใช้งานห้องประชุม และสัดส่วนการจองแยกตามแผนก
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          {/* Time range pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setRangeFilter("7days")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all",
                rangeFilter === "7days" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600"
              )}
            >
              7 วันล่าสุด
            </button>
            <button
              onClick={() => setRangeFilter("30days")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all",
                rangeFilter === "30days" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600"
              )}
            >
              30 วันล่าสุด
            </button>
            <button
              onClick={() => setRangeFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all",
                rangeFilter === "all" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600"
              )}
            >
              ทั้งหมด
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-subtle transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-subtle transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            จำนวนการจองในช่วงเวลานี้
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{filteredBookings.length}</span>
            <span className="text-xs text-slate-500">ครั้ง</span>
          </div>
          <div className="mt-2 text-xs text-brand-600 font-medium">
            อัตราอนุมัติสำเร็จ:{" "}
            {filteredBookings.length > 0
              ? Math.round(
                  (filteredBookings.filter((b) => b.status === "approved").length /
                    filteredBookings.length) *
                    100
                )
              : 0}
            %
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ชั่วโมงการประชุมสะสมรวม
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {roomStats.reduce((sum, r) => sum + r.hours, 0)}
            </span>
            <span className="text-xs text-slate-500">ชั่วโมง</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            เฉลี่ย {(roomStats.reduce((sum, r) => sum + r.hours, 0) / (rooms.length || 1)).toFixed(1)} ชม. ต่อห้อง
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ห้องที่มีการใช้งานสูงสุด
          </div>
          <div className="mt-3">
            <span className="text-base font-extrabold text-brand-600 line-clamp-1">
              {[...roomStats].sort((a, b) => b.count - a.count)[0]?.name || "-"}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            ใช้งานสะสม {[...roomStats].sort((a, b) => b.count - a.count)[0]?.hours || 0} ชั่วโมง
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle print-break-inside-avoid">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-600" />
            จำนวนการใช้งานสะสมจำแนกตามห้องประชุม
          </h3>
          <p className="text-xs text-slate-500 mb-4">แสดงจำนวนครั้งที่ถูกจองในแต่ละห้อง</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "10px", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="จำนวนการจอง (ครั้ง)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Usage Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle print-break-inside-avoid">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" />
            สัดส่วนการจองแยกตามแผนก (Department)
          </h3>
          <p className="text-xs text-slate-500 mb-4">การใช้งานห้องประชุมของแต่ละฝ่าย</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "10px", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} name="จำนวนการจอง (ครั้ง)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Utilization Details Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden print-break-inside-avoid">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800">
            ตารางสรุปอัตราการใช้งานห้องประชุม (Room Utilization Summary)
          </span>
          <span className="text-xs text-slate-500">ข้อมูล ณ วันที่ {formatThaiDate(new Date().toISOString())}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">ห้องประชุม</th>
                <th className="py-3 px-4 text-center">ความจุ (คน)</th>
                <th className="py-3 px-4 text-center">จำนวนการจอง</th>
                <th className="py-3 px-4 text-center">ชั่วโมงใช้งาน</th>
                <th className="py-3 px-4 text-right">อัตราการใช้งานเฉลี่ย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roomStats.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-800">{r.name}</td>
                  <td className="py-3 px-4 text-center">{r.capacity} ที่นั่ง</td>
                  <td className="py-3 px-4 text-center font-bold text-brand-600">{r.count} ครั้ง</td>
                  <td className="py-3 px-4 text-center">{r.hours} ชม.</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                      {(r.hours * 3.5).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
