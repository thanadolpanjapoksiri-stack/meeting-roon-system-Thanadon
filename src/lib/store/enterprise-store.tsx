"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Booking,
  Room,
  Profile,
  Department,
  Notification,
  AuditLog,
  BookingStatus,
  UserRole,
  RoomStatus,
} from "@/types";
import {
  initialBookings,
  initialRooms,
  initialProfiles,
  initialDepartments,
  initialNotifications,
} from "@/lib/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface CreateBookingParams {
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees_count: number;
  equipment_requests?: { equipment_name: string; quantity: number }[];
}

interface OverlapCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  reason?: string;
}

interface EnterpriseContextType {
  // Current session & role
  currentUser: Profile;
  switchRole: (role: UserRole) => void;
  isRealtimeConnected: boolean;

  // Data collections
  rooms: Room[];
  bookings: Booking[];
  departments: Department[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  unreadNotificationsCount: number;

  // Operations
  checkRoomConflict: (
    roomId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ) => OverlapCheckResult;
  createBooking: (params: CreateBookingParams) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelBooking: (bookingId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  createRoom: (roomData: Omit<Room, "id" | "created_at">) => Promise<{ success: boolean; room?: Room; error?: string }>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<{ success: boolean; error?: string }>;
  deleteRoom: (roomId: string) => Promise<{ success: boolean; error?: string }>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  reloadAll: () => Promise<void>;
}

const STORAGE_KEYS = {
  ROOMS: "smart_room_rooms_v1",
  BOOKINGS: "smart_room_bookings_v1",
  NOTIFICATIONS: "smart_room_notifs_v1",
  CURRENT_USER_ID: "smart_room_current_user_id_v1",
  AUDIT_LOGS: "smart_room_audit_logs_v1",
};

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]); // Default to Admin
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [departments] = useState<Department[]>(initialDepartments);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);

      if (storedRooms) setRooms(JSON.parse(storedRooms));
      if (storedBookings) setBookings(JSON.parse(storedBookings));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      if (storedLogs) setAuditLogs(JSON.parse(storedLogs));

      if (storedUserId) {
        const foundUser = initialProfiles.find((u) => u.id === storedUserId);
        if (foundUser) setCurrentUser(foundUser);
      }
    } catch (e) {
      console.warn("Storage hydration note:", e);
    } finally {
      setIsInitialized(true);
    }

    // Attempt Supabase Realtime channel if configured
    if (isSupabaseConfigured && supabase) {
      setIsRealtimeConnected(true);
      const channel = supabase
        .channel("smart_room_realtime_channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings" },
          (payload) => {
            console.log("Realtime Booking Update:", payload);
            // Refresh bookings if needed
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } else {
      // Simulate healthy connected state
      setIsRealtimeConnected(true);
    }
  }, []);

  // Persist local store
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    } catch (e) {
      console.error("Local persistence error:", e);
    }
  }, [rooms, bookings, notifications, auditLogs, currentUser, isInitialized]);

  // Enriched bookings with relation joins
  const enrichedBookings = useMemo(() => {
    return bookings.map((b) => {
      const room = rooms.find((r) => r.id === b.room_id);
      const user = initialProfiles.find((p) => p.id === b.user_id) || {
        id: b.user_id,
        email: "user@organization.local",
        full_name: "พนักงานผู้ใช้งาน",
        role: "user" as UserRole,
        created_at: new Date().toISOString(),
      };
      const approver = b.approved_by
        ? initialProfiles.find((p) => p.id === b.approved_by)
        : null;

      return {
        ...b,
        room,
        user,
        approver,
      };
    });
  }, [bookings, rooms]);

  // Switch role helper
  const switchRole = (role: UserRole) => {
    const targetUser = initialProfiles.find((p) => p.role === role) || initialProfiles[0];
    setCurrentUser(targetUser);
  };

  // Overlap & Double-Booking Check
  const checkRoomConflict = (
    roomId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): OverlapCheckResult => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) {
      return { hasConflict: true, reason: "ไม่พบข้อมูลห้องประชุมที่เลือก" };
    }

    if (targetRoom.status === "maintenance") {
      return { hasConflict: true, reason: "ห้องประชุมนี้อยู่ระหว่างปิดปรับปรุง ไม่สามารถจองได้" };
    }

    if (targetRoom.status === "inactive") {
      return { hasConflict: true, reason: "ห้องประชุมนี้ปิดการใช้งานแล้ว" };
    }

    const proposedStart = new Date(startTime).getTime();
    const proposedEnd = new Date(endTime).getTime();

    if (isNaN(proposedStart) || isNaN(proposedEnd)) {
      return { hasConflict: true, reason: "รูปแบบวันเวลาไม่ถูกต้อง" };
    }

    if (proposedEnd <= proposedStart) {
      return { hasConflict: true, reason: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น" };
    }

    // Check against active bookings for same room
    const conflicting = enrichedBookings.find((b) => {
      if (b.id === excludeBookingId) return false;
      if (b.room_id !== roomId) return false;
      if (b.status === "cancelled" || b.status === "rejected") return false;

      const existingStart = new Date(b.start_time).getTime();
      const existingEnd = new Date(b.end_time).getTime();

      // Interval overlap check: [StartA, EndA) && [StartB, EndB)
      return proposedStart < existingEnd && proposedEnd > existingStart;
    });

    if (conflicting) {
      const conflictMsg = `ห้องนี้ถูกจองแล้วในช่วงเวลาดังกล่าว (${conflicting.title} โดย ${conflicting.user?.full_name})`;
      return {
        hasConflict: true,
        conflictingBooking: conflicting,
        reason: conflictMsg,
      };
    }

    return { hasConflict: false };
  };

  // Create Booking
  const createBooking = async (
    params: CreateBookingParams
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    // 1. Conflict Validation
    const conflictResult = checkRoomConflict(params.room_id, params.start_time, params.end_time);
    if (conflictResult.hasConflict) {
      return { success: false, error: conflictResult.reason };
    }

    const room = rooms.find((r) => r.id === params.room_id);
    if (room && params.attendees_count > room.capacity) {
      return {
        success: false,
        error: `จำนวนผู้เข้าร่วม (${params.attendees_count} คน) เกินความจุสูงสุดของห้อง (${room.capacity} คน)`,
      };
    }

    const newBookingId = "b_" + Date.now().toString(36);
    const newBooking: Booking = {
      id: newBookingId,
      room_id: params.room_id,
      user_id: currentUser.id,
      title: params.title.trim(),
      description: params.description?.trim() || "",
      start_time: params.start_time,
      end_time: params.end_time,
      attendees_count: params.attendees_count,
      status: "pending", // Waiting for approver/admin
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      equipment_requests: params.equipment_requests?.map((eq, i) => ({
        id: `be_${newBookingId}_${i}`,
        booking_id: newBookingId,
        equipment_name: eq.equipment_name,
        quantity: eq.quantity,
      })),
    };

    // Update bookings state
    setBookings((prev) => [newBooking, ...prev]);

    // Create notifications for approvers & admins
    const approverNotif: Notification = {
      id: "n_" + Date.now().toString(36),
      user_id: "u2222222-2222-2222-2222-222222222222", // Approver
      title: "มีคำขอจองห้องประชุมใหม่",
      message: `คุณ ${currentUser.full_name} ได้ส่งคำขอจองห้อง ${room?.name} หัวข้อ "${newBooking.title}"`,
      type: "info",
      is_read: false,
      link_url: "/bookings",
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [approverNotif, ...prev]);

    // Audit log
    const audit: AuditLog = {
      id: "log_" + Date.now().toString(36),
      table_name: "bookings",
      record_id: newBookingId,
      action: "INSERT",
      changed_by: currentUser.id,
      new_values: { ...newBooking },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true, booking: newBooking };
  };

  // Update Booking Status (Approve / Reject)
  const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role === "user") {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการอนุมัติหรือปฏิเสธรายการจอง (ต้องใช้สิทธิ์ Approver หรือ Admin)" };
    }

    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return { success: false, error: "ไม่พบรายการจองนี้ในระบบ" };
    }

    const targetBooking = bookings[bookingIndex];

    const updatedBooking: Booking = {
      ...targetBooking,
      status,
      rejection_reason: status === "rejected" ? reason || "ไม่อนุมัติโดยผู้ดูแล" : targetBooking.rejection_reason,
      approved_by: status === "approved" ? currentUser.id : targetBooking.approved_by,
      approved_at: status === "approved" ? new Date().toISOString() : targetBooking.approved_at,
      updated_at: new Date().toISOString(),
    };

    setBookings((prev) => {
      const copy = [...prev];
      copy[bookingIndex] = updatedBooking;
      return copy;
    });

    // Notify requester
    const notifTitle =
      status === "approved"
        ? "การจองของคุณได้รับการอนุมัติแล้ว 🎉"
        : "การจองของคุณไม่ผ่านการอนุมัติ";
    const notifType = status === "approved" ? "success" : "warning";

    const userNotif: Notification = {
      id: "n_" + Date.now().toString(36),
      user_id: targetBooking.user_id,
      title: notifTitle,
      message: `รายการ "${targetBooking.title}" ได้รับการพิจารณาเป็น "${status === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}" ${reason ? `(เหตุผล: ${reason})` : ""}`,
      type: notifType,
      is_read: false,
      link_url: "/bookings",
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [userNotif, ...prev]);

    // Audit log
    const audit: AuditLog = {
      id: "log_" + Date.now().toString(36),
      table_name: "bookings",
      record_id: bookingId,
      action: "UPDATE",
      changed_by: currentUser.id,
      old_values: { status: targetBooking.status },
      new_values: { status, reason },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true };
  };

  // Cancel Booking
  const cancelBooking = async (
    bookingId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return { success: false, error: "ไม่พบรายการจองนี้ในระบบ" };
    }

    const target = bookings[bookingIndex];

    // Permission check: only booking owner or admin can cancel
    if (target.user_id !== currentUser.id && currentUser.role !== "admin") {
      return { success: false, error: "คุณสามารถยกเลิกได้เฉพาะรายการจองของตนเองเท่านั้น" };
    }

    const updatedBooking: Booking = {
      ...target,
      status: "cancelled",
      cancellation_reason: reason.trim() || "ยกเลิกโดยผู้จอง",
      updated_at: new Date().toISOString(),
    };

    setBookings((prev) => {
      const copy = [...prev];
      copy[bookingIndex] = updatedBooking;
      return copy;
    });

    // Audit log
    const audit: AuditLog = {
      id: "log_" + Date.now().toString(36),
      table_name: "bookings",
      record_id: bookingId,
      action: "UPDATE",
      changed_by: currentUser.id,
      old_values: { status: target.status },
      new_values: { status: "cancelled", cancellation_reason: reason },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true };
  };

  // Create Room
  const createRoom = async (
    roomData: Omit<Room, "id" | "created_at">
  ): Promise<{ success: boolean; room?: Room; error?: string }> => {
    if (currentUser.role !== "admin") {
      return { success: false, error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเพิ่มห้องประชุมได้" };
    }

    const newRoom: Room = {
      ...roomData,
      id: "r_" + Date.now().toString(36),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRooms((prev) => [newRoom, ...prev]);

    return { success: true, room: newRoom };
  };

  // Update Room
  const updateRoom = async (
    roomId: string,
    updates: Partial<Room>
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== "admin") {
      return { success: false, error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขข้อมูลห้องประชุมได้" };
    }

    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r))
    );

    return { success: true };
  };

  // Delete Room
  const deleteRoom = async (roomId: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== "admin") {
      return { success: false, error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบห้องประชุมได้" };
    }

    // Check if room has active bookings
    const active = bookings.some(
      (b) => b.room_id === roomId && (b.status === "approved" || b.status === "pending")
    );
    if (active) {
      return {
        success: false,
        error: "ไม่สามารถลบห้องประชุมนี้ได้เนื่องจากยังมีรายการจองที่รออนุมัติหรืออนุมัติแล้วค้างอยู่ กรุณายกเลิกการจองก่อน",
      };
    }

    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    return { success: true };
  };

  // Notifications helpers
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const reloadAll = async () => {
    setRooms(initialRooms);
    setBookings(initialBookings);
    setNotifications(initialNotifications);
  };

  return (
    <EnterpriseContext.Provider
      value={{
        currentUser,
        switchRole,
        isRealtimeConnected,
        rooms,
        bookings: enrichedBookings,
        departments,
        notifications,
        auditLogs,
        unreadNotificationsCount,
        checkRoomConflict,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        createRoom,
        updateRoom,
        deleteRoom,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        reloadAll,
      }}
    >
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);
  if (!context) {
    throw new Error("useEnterprise must be used within an EnterpriseProvider");
  }
  return context;
}
