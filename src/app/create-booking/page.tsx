"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusCircle,
  Building,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Tv,
  Mic,
  Video,
  Presentation,
  Coffee,
  Wifi,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { formatThaiDate, formatTimeRange, cn } from "@/lib/utils";
import { toast } from "sonner";

function CreateBookingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rooms, checkRoomConflict, createBooking, currentUser } = useEnterprise();

  // Pre-fill from query params if available
  const defaultDate = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const defaultTime = searchParams.get("time") || "10:00";
  const defaultRoomId = searchParams.get("roomId") || (rooms[0]?.id || "");

  // Form State
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookingDate, setBookingDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultTime);
  const [endTime, setEndTime] = useState("12:00");
  const [attendeesCount, setAttendeesCount] = useState<number>(4);
  const [notes, setNotes] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available equipment options
  const equipmentOptions = [
    { id: "projector", name: "โปรเจกเตอร์เลเซอร์ & จอฉาย", icon: Presentation },
    { id: "tv", name: "จอแสดงผล Smart TV 4K / จอสัมผัส", icon: Tv },
    { id: "wireless_mic", name: "ไมโครโฟนไร้สาย (Wireless Mic)", icon: Mic },
    { id: "video_conf", name: "ระบบ Video Conference (Webex/Teams/Meet)", icon: Video },
    { id: "refreshment", name: "ชุดเครื่องดื่มและของว่างรับรอง", icon: Coffee },
    { id: "high_speed_wifi", name: "เครือข่าย Wi-Fi สำหรับผู้มาเยือน (Guest Wi-Fi)", icon: Wifi },
  ];

  // Selected Room Object
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === roomId) || rooms[0];
  }, [rooms, roomId]);

  // Construct Full ISO Timestamps
  const startIsoString = useMemo(() => {
    return `${bookingDate}T${startTime}:00+07:00`;
  }, [bookingDate, startTime]);

  const endIsoString = useMemo(() => {
    return `${bookingDate}T${endTime}:00+07:00`;
  }, [bookingDate, endTime]);

  // Dynamic Double-Booking / Conflict Check
  const conflictResult = useMemo(() => {
    if (!roomId || !bookingDate || !startTime || !endTime) {
      return { hasConflict: false };
    }
    return checkRoomConflict(roomId, startIsoString, endIsoString);
  }, [roomId, startIsoString, endIsoString, checkRoomConflict, bookingDate, startTime, endTime]);

  // Toggle Equipment
  const toggleEquipment = (name: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อการประชุม");
      return;
    }

    if (!roomId) {
      toast.error("กรุณาเลือกห้องประชุม");
      return;
    }

    if (conflictResult.hasConflict) {
      toast.error(conflictResult.reason || "ช่วงเวลานี้มีการจองซ้อนกัน กรุณาเลือกช่วงเวลาอื่น");
      return;
    }

    if (selectedRoom && attendeesCount > selectedRoom.capacity) {
      toast.error(
        `จำนวนผู้เข้าร่วม (${attendeesCount} คน) เกินความจุของห้อง (${selectedRoom.capacity} คน)`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const fullDescription = notes.trim()
        ? `${description}\n\n[หมายเหตุเพิ่มเติม]: ${notes}`
        : description;

      const res = await createBooking({
        room_id: roomId,
        title: title.trim(),
        description: fullDescription,
        start_time: startIsoString,
        end_time: endIsoString,
        attendees_count: attendeesCount,
        equipment_requests: selectedEquipment.map((eq) => ({
          equipment_name: eq,
          quantity: 1,
        })),
      });

      if (!res.success) {
        toast.error(res.error || "เกิดข้อผิดพลาดในการบันทึกการจอง");
      } else {
        toast.success("ส่งคำขอจองห้องประชุมเรียบร้อยแล้ว!", {
          description: `หัวข้อ "${title}" กำลังรอการอนุมัติจากผู้ดูแล`,
        });
        router.push("/bookings");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          ย้อนกลับ
        </button>

        <span className="text-xs font-semibold text-slate-400">
          ผู้ทำรายการ: <strong className="text-slate-700">{currentUser.full_name}</strong> ({currentUser.role})
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle p-6 sm:p-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>แบบฟอร์มจองห้องประชุมอัจฉริยะ</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            สร้างคำขอจองห้องประชุม (Create Booking)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ระบบจะตรวจสอบความพร้อมของห้องและความขัดแย้งของตารางเวลาแบบเรียลไทม์
          </p>
        </div>

        {/* Realtime Conflict / Availability Banner */}
        <div
          className={cn(
            "p-4 rounded-2xl border mb-8 flex items-start gap-3 transition-all",
            conflictResult.hasConflict
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          )}
        >
          {conflictResult.hasConflict ? (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm">
            <div className="font-bold">
              {conflictResult.hasConflict
                ? "ตรวจพบเวลาจองทับซ้อน (Booking Conflict)"
                : "ห้องว่างพร้อมใช้งาน (Slot Available)"}
            </div>
            <div className="mt-0.5 opacity-90 leading-relaxed">
              {conflictResult.hasConflict
                ? conflictResult.reason
                : `ห้อง "${selectedRoom?.name}" ว่างพร้อมใช้งานในวันที่ ${formatThaiDate(startIsoString)} เวลา ${formatTimeRange(startIsoString, endIsoString)}`}
            </div>
          </div>
        </div>

        {/* The Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Meeting Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ชื่อการประชุม (Meeting Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ประชุมทบทวนแผนกลยุทธ์ Q4, Sprint Planning หรือ ปฐมนิเทศพนักงานใหม่"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
            />
          </div>

          {/* 2. Room Selection & Capacity Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                เลือกห้องประชุม (Meeting Room) <span className="text-rose-500">*</span>
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id} disabled={room.status !== "available"}>
                    {room.name} ({room.building} {room.floor} • ความจุ {room.capacity} คน)
                    {room.status === "maintenance" ? " - ปิดปรับปรุง" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Room mini card info */}
            {selectedRoom && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <img
                  src={selectedRoom.image_url}
                  alt={selectedRoom.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0 text-xs">
                  <div className="font-bold text-slate-800 truncate">{selectedRoom.name}</div>
                  <div className="text-slate-500">
                    {selectedRoom.building} {selectedRoom.floor} (ห้อง {selectedRoom.room_number})
                  </div>
                  <div className="text-brand-600 font-semibold mt-1">
                    รองรับได้สูงสุด {selectedRoom.capacity} ที่นั่ง
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                วันที่ประชุม (Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                เวลาเริ่มต้น (Start) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                เวลาสิ้นสุด (End) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* 4. Attendees Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              จำนวนผู้เข้าร่วม (Attendees Count) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={selectedRoom?.capacity || 100}
                required
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(Number(e.target.value))}
                className="w-36 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 font-semibold"
              />
              <span className="text-xs text-slate-500">
                (ความจุห้อง: สูงสุด {selectedRoom?.capacity || 0} คน)
              </span>
            </div>
          </div>

          {/* 5. Equipment Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              อุปกรณ์และบริการเสริมที่ต้องการ (Equipment & Amenities)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {equipmentOptions.map((eq) => {
                const isChecked = selectedEquipment.includes(eq.name);
                return (
                  <label
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.name)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none",
                      isChecked
                        ? "bg-brand-50 border-brand-300 text-brand-900 shadow-sm"
                        : "bg-slate-50 border-slate-200/90 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent div
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <eq.icon className={cn("w-4 h-4", isChecked ? "text-brand-600" : "text-slate-400")} />
                    <span>{eq.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Description & Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              รายละเอียดและวัตถุประสงค์ (Purpose & Description)
            </label>
            <textarea
              rows={3}
              placeholder="ระบุวาระการประชุม วัตถุประสงค์ หรือหัวข้อสำคัญ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
            />
          </div>

          {/* 7. Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              หมายเหตุเพิ่มเติม (Notes)
            </label>
            <input
              type="text"
              placeholder="เช่น ขอโต๊ะจัดเรียงแบบ U-Shape หรือ เตรียมที่จอดรถให้ผู้บริหารภายนอก 2 คัน"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting || conflictResult.hasConflict}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-brand-600/20 hover:scale-[1.01] active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? "กำลังส่งคำขอ..." : "ยืนยันการจองห้องประชุม"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลดแบบฟอร์ม...</div>}>
      <CreateBookingInner />
    </Suspense>
  );
}
