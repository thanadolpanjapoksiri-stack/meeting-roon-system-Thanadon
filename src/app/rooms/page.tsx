"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Wrench,
  AlertOctagon,
  X,
  Sparkles,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { getStatusBadgeClass, getStatusLabel, cn } from "@/lib/utils";
import { Room, RoomStatus } from "@/types";
import { toast } from "sonner";

export default function RoomsPage() {
  const { rooms, currentUser, createRoom, updateRoom, deleteRoom } = useEnterprise();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("อาคาร A (Main Tower)");
  const [floor, setFloor] = useState("ชั้น 8");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState<number>(10);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<RoomStatus>("available");
  const [amenitiesInput, setAmenitiesInput] = useState("");

  const openCreateModal = () => {
    setEditingRoom(null);
    setName("");
    setBuilding("อาคาร A (Main Tower)");
    setFloor("ชั้น 8");
    setRoomNumber("A-801");
    setCapacity(12);
    setDescription("");
    setImageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80");
    setStatus("available");
    setAmenitiesInput("จอ 4K, ไวท์บอร์ด, Video Conference, Wi-Fi 6");
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setBuilding(room.building);
    setFloor(room.floor);
    setRoomNumber(room.room_number);
    setCapacity(room.capacity);
    setDescription(room.description);
    setImageUrl(room.image_url);
    setStatus(room.status);
    setAmenitiesInput(room.amenities.join(", "));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("กรุณาระบุชื่อห้องประชุม");
      return;
    }

    const amenitiesArray = amenitiesInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (editingRoom) {
      // Update
      const res = await updateRoom(editingRoom.id, {
        name: name.trim(),
        building,
        floor,
        room_number: roomNumber,
        capacity,
        description,
        image_url: imageUrl,
        status,
        amenities: amenitiesArray,
      });

      if (res.success) {
        toast.success("อัปเดตข้อมูลห้องประชุมเรียบร้อยแล้ว");
        setIsModalOpen(false);
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาด");
      }
    } else {
      // Create
      const res = await createRoom({
        name: name.trim(),
        building,
        floor,
        room_number: roomNumber,
        capacity,
        description,
        image_url: imageUrl,
        status,
        amenities: amenitiesArray,
      });

      if (res.success) {
        toast.success("เพิ่มห้องประชุมใหม่สำเร็จแล้ว");
        setIsModalOpen(false);
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาด");
      }
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบห้องประชุมนี้?")) return;

    const res = await deleteRoom(roomId);
    if (res.success) {
      toast.success("ลบห้องประชุมสำเร็จ");
    } else {
      toast.error(res.error);
    }
  };

  const handleToggleStatus = async (room: Room) => {
    const nextStatus: RoomStatus =
      room.status === "available" ? "maintenance" : "available";
    const res = await updateRoom(room.id, { status: nextStatus });
    if (res.success) {
      toast.success(
        `เปลี่ยนสถานะเป็น "${nextStatus === "available" ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}" เรียบร้อยแล้ว`
      );
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand-600" />
            จัดการห้องประชุม (Room Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            เพิ่ม แก้ไข และกำหนดสถานะความพร้อมของห้องประชุมทั้งหมด {rooms.length} ห้อง
          </p>
        </div>

        {currentUser.role === "admin" && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มห้องประชุมใหม่</span>
          </button>
        )}
      </div>

      {/* Role notice for non-admin */}
      {currentUser.role !== "admin" && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>
            คุณกำลังดูหน้านี้ด้วยสิทธิ์ <strong>{currentUser.role}</strong> (เฉพาะ Admin เท่านั้นที่สามารถเพิ่ม ลบ หรือแก้ไขห้องประชุมได้)
          </span>
          <span className="text-[11px] font-semibold text-amber-700">View Only</span>
        </div>
      )}

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle hover:shadow-card transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Room Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md border",
                      getStatusBadgeClass(room.status)
                    )}
                  >
                    {getStatusLabel(room.status)}
                  </span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                  {room.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {room.building} {room.floor} (ห้อง {room.room_number})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-slate-700">
                      ความจุสูงสุด: {room.capacity} คน
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {room.amenities.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                href={`/calendar?roomId=${room.id}`}
                className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ดูปฏิทินห้องนี้</span>
              </Link>

              {currentUser.role === "admin" && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(room)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200"
                    title={room.status === "available" ? "ปิดปรับปรุง" : "เปิดใช้งาน"}
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(room)}
                    className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-200"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                    title="ลบห้องนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT ROOM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-elevated border border-slate-200 max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoom ? "แก้ไขข้อมูลห้องประชุม" : "เพิ่มห้องประชุมใหม่"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ชื่อห้องประชุม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ห้องประชุมใหญ่ กรรณิการ์"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    อาคาร
                  </label>
                  <input
                    type="text"
                    required
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ชั้น
                  </label>
                  <input
                    type="text"
                    required
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    หมายเลขห้อง
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ความจุผู้เข้าร่วม (คน)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  สถานะห้องประชุม
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RoomStatus)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="available">พร้อมใช้งาน (Available)</option>
                  <option value="maintenance">ปิดปรับปรุง (Maintenance)</option>
                  <option value="inactive">ปิดการใช้งาน (Inactive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL รูปภาพห้อง
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  อุปกรณ์และสิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="จอ 4K, กระดานไวท์บอร์ด, เครื่องเสียง"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  รายละเอียดห้อง
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
