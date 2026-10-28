"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  Building,
  User,
  Calendar,
  X,
  Plus,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import {
  formatThaiDate,
  formatTimeRange,
  getStatusBadgeClass,
  getStatusLabel,
  exportToCSV,
  cn,
} from "@/lib/utils";
import { Booking, BookingStatus } from "@/types";
import { toast } from "sonner";

function BookingsManagementInner() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "all";
  const targetBookingId = searchParams.get("id");

  const {
    bookings,
    currentUser,
    updateBookingStatus,
    cancelBooking,
  } = useEnterprise();

  // Search & Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("all");

  // Dialog State: View Details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    targetBookingId ? bookings.find((b) => b.id === targetBookingId) || null : null
  );

  // Dialog State: Action Modal (Approve, Reject, Cancel)
  const [actionType, setActionType] = useState<"approve" | "reject" | "cancel" | null>(null);
  const [targetActionBooking, setTargetActionBooking] = useState<Booking | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status
      if (statusFilter !== "all" && b.status !== statusFilter) return false;

      // Room
      if (selectedRoomFilter !== "all" && b.room_id !== selectedRoomFilter) return false;

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = b.title.toLowerCase().includes(q);
        const roomMatch = b.room?.name.toLowerCase().includes(q);
        const userMatch = b.user?.full_name.toLowerCase().includes(q);
        if (!titleMatch && !roomMatch && !userMatch) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, selectedRoomFilter, search]);

  // Open Action Modal
  const openAction = (type: "approve" | "reject" | "cancel", booking: Booking) => {
    setActionType(type);
    setTargetActionBooking(booking);
    setActionReason("");
  };

  // Submit Action
  const handleConfirmAction = async () => {
    if (!targetActionBooking || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === "approve") {
        const res = await updateBookingStatus(targetActionBooking.id, "approved");
        if (res.success) {
          toast.success("อนุมัติรายการจองเรียบร้อยแล้ว");
          setActionType(null);
        } else {
          toast.error(res.error || "เกิดข้อผิดพลาด");
        }
      } else if (actionType === "reject") {
        if (!actionReason.trim()) {
          toast.error("กรุณาระบุเหตุผลที่ไม่อนุมัติ");
          setIsProcessing(false);
          return;
        }
        const res = await updateBookingStatus(targetActionBooking.id, "rejected", actionReason);
        if (res.success) {
          toast.success("ปฏิเสธรายการจองเรียบร้อยแล้ว");
          setActionType(null);
        } else {
          toast.error(res.error || "เกิดข้อผิดพลาด");
        }
      } else if (actionType === "cancel") {
        if (!actionReason.trim()) {
          toast.error("กรุณาระบุเหตุผลในการยกเลิก");
          setIsProcessing(false);
          return;
        }
        const res = await cancelBooking(targetActionBooking.id, actionReason);
        if (res.success) {
          toast.success("ยกเลิกรายการจองสำเร็จ");
          setActionType(null);
        } else {
          toast.error(res.error || "เกิดข้อผิดพลาด");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    const rows = filteredBookings.map((b) => ({
      รหัสการจอง: b.id,
      ชื่อการประชุม: b.title,
      ห้องประชุม: b.room?.name || "",
      ผู้ขอจอง: b.user?.full_name || "",
      วันที่: b.start_time.slice(0, 10),
      เวลาเริ่มต้น: b.start_time.slice(11, 16),
      เวลาสิ้นสุด: b.end_time.slice(11, 16),
      จำนวนคน: b.attendees_count,
      สถานะ: getStatusLabel(b.status),
      เหตุผล: b.rejection_reason || b.cancellation_reason || "",
    }));
    exportToCSV("meeting_bookings_export", rows);
    toast.success("ส่งออกข้อมูลเป็น CSV สำเร็จ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-brand-600" />
            รายการจองห้องประชุม (Booking Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ค้นหา ตรวจสอบ อนุมัติ ปฏิเสธ หรือยกเลิกรายการจองตามสิทธิ์การใช้งาน
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-subtle transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก CSV</span>
          </button>
          <Link
            href="/create-booking"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างการจองใหม่</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อการประชุม, ห้อง หรือผู้จอง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(["all", "pending", "approved", "rejected", "cancelled"] as (BookingStatus | "all")[]).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                  statusFilter === st
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {st === "all" ? "ทั้งหมด" : getStatusLabel(st)}
                {st !== "all" && (
                  <span className="ml-1.5 opacity-80 text-[10px]">
                    ({bookings.filter((b) => b.status === st).length})
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ชื่อการประชุม</th>
                <th className="py-3.5 px-4">ห้องประชุม</th>
                <th className="py-3.5 px-4">วันและเวลา</th>
                <th className="py-3.5 px-4">ผู้ขอจอง</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่พบรายการจองที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const canApproveOrReject =
                    b.status === "pending" && (currentUser.role === "admin" || currentUser.role === "approver");
                  const canCancel =
                    (b.status === "pending" || b.status === "approved") &&
                    (currentUser.role === "admin" || currentUser.id === b.user_id);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title */}
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[220px]">
                        <div className="truncate">{b.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          รหัส: {b.id.slice(0, 12)}
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="font-medium text-slate-800 truncate">
                          {b.room?.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {b.room?.building} • {b.attendees_count} คน
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {formatThaiDate(b.start_time)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatTimeRange(b.start_time, b.end_time)}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {b.user?.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {b.user?.department?.name || b.user?.email}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                            b.status
                          )}`}
                        >
                          {getStatusLabel(b.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canApproveOrReject && (
                            <>
                              <button
                                onClick={() => openAction("approve", b)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                                title="อนุมัติ"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openAction("reject", b)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                                title="ปฏิเสธ"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {canCancel && (
                            <button
                              onClick={() => openAction("cancel", b)}
                              className="px-2 py-1 text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                              title="ขอยกเลิกการจอง"
                            >
                              ยกเลิก
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-elevated border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                    selectedBooking.status
                  )}`}
                >
                  {getStatusLabel(selectedBooking.status)}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedBooking.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
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
                    {selectedBooking.room?.name}
                  </span>
                  <div className="text-xs text-slate-500">
                    {selectedBooking.room?.building} {selectedBooking.room?.floor}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {formatThaiDate(selectedBooking.start_time)}
                  </span>
                  <div className="text-xs text-slate-500">
                    {formatTimeRange(selectedBooking.start_time, selectedBooking.end_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {selectedBooking.user?.full_name}
                  </span>
                  <div className="text-xs text-slate-500">
                    {selectedBooking.user?.department?.name || selectedBooking.user?.email} • ผู้เข้าร่วม {selectedBooking.attendees_count} คน
                  </div>
                </div>
              </div>

              {selectedBooking.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                  <span className="font-semibold block mb-1">รายละเอียด:</span>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedBooking.description}
                  </p>
                </div>
              )}

              {selectedBooking.equipment_requests && selectedBooking.equipment_requests.length > 0 && (
                <div>
                  <span className="font-semibold block mb-1.5 text-slate-700">อุปกรณ์เสริมที่ขอ:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBooking.equipment_requests.map((eq) => (
                      <span
                        key={eq.id}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200"
                      >
                        {eq.equipment_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.rejection_reason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-semibold block mb-1">เหตุผลที่ไม่อนุมัติ:</span>
                  <p className="text-xs">{selectedBooking.rejection_reason}</p>
                </div>
              )}

              {selectedBooking.cancellation_reason && (
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700">
                  <span className="font-semibold block mb-1">เหตุผลที่ยกเลิก:</span>
                  <p className="text-xs">{selectedBooking.cancellation_reason}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION REASON DIALOG (Approve / Reject / Cancel) */}
      {actionType && targetActionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-elevated border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {actionType === "approve"
                ? "ยืนยันการอนุมัติการจอง"
                : actionType === "reject"
                ? "ปฏิเสธคำขอจองห้องประชุม"
                : "ยืนยันการยกเลิกการจอง"}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              รายการ: <strong className="text-slate-800">{targetActionBooking.title}</strong>{" "}
              ({targetActionBooking.room?.name})
            </p>

            {(actionType === "reject" || actionType === "cancel") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  เหตุผล (Reason) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    actionType === "reject"
                      ? "ระบุเหตุผล เช่น ห้องต้องเตรียมงานสำคัญ หรือ ติดภารกิจฝ่ายบริหาร"
                      : "ระบุเหตุผลในการยกเลิก เช่น เลื่อนการประชุมกับลูกค้า"
                  }
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={cn(
                  "px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all",
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {isProcessing ? "กำลังบันทึก..." : "ยืนยันดำเนินการ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลดรายการจอง...</div>}>
      <BookingsManagementInner />
    </Suspense>
  );
}
