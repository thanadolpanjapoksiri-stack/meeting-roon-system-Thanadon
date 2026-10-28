export type UserRole = "admin" | "approver" | "user";

export type RoomStatus = "available" | "maintenance" | "inactive";

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export type NotificationType = "info" | "success" | "warning" | "reminder";

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  department?: Department | null;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RoomEquipment {
  id: string;
  room_id: string;
  name: string;
  quantity: number;
  condition: "good" | "fair" | "needs_repair";
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  room_number: string;
  capacity: number;
  description: string;
  image_url: string;
  status: RoomStatus;
  amenities: string[];
  equipment?: RoomEquipment[];
  created_at: string;
  updated_at?: string;
}

export interface BookingEquipment {
  id: string;
  booking_id: string;
  equipment_name: string;
  quantity: number;
}

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string; // ISO 8601 string
  end_time: string;   // ISO 8601 string
  attendees_count: number;
  status: BookingStatus;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at?: string;
  // Joined relation fields
  room?: Room;
  user?: Profile;
  approver?: Profile | null;
  equipment_requests?: BookingEquipment[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  changed_by?: string | null;
  user?: Profile | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRoomsNow: number;
  todayBookingsCount: number;
  pendingApprovalsCount: number;
  mostPopularRooms: {
    room: Room;
    bookingCount: number;
    hoursBooked: number;
  }[];
  upcomingBookings: Booking[];
  weeklyTrends: {
    dayName: string;
    date: string;
    bookings: number;
    hours: number;
  }[];
  monthlyUtilization: {
    month: string;
    totalBookings: number;
    completed: number;
    cancelled: number;
  }[];
}
