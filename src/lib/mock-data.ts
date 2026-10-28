import { Department, Profile, Room, Booking, Notification } from "@/types";

export const initialDepartments: Department[] = [
  {
    id: "d1111111-1111-1111-1111-111111111111",
    name: "ฝ่ายพัฒนาเทคโนโลยีและสารสนเทศ (IT)",
    code: "IT",
    created_at: "2026-01-01T08:00:00+07:00",
  },
  {
    id: "d2222222-2222-2222-2222-222222222222",
    name: "ฝ่ายทรัพยากรบุคคล (HR)",
    code: "HR",
    created_at: "2026-01-01T08:00:00+07:00",
  },
  {
    id: "d3333333-3333-3333-3333-333333333333",
    name: "ฝ่ายการตลาดและประชาสัมพันธ์ (Marketing)",
    code: "MKT",
    created_at: "2026-01-01T08:00:00+07:00",
  },
  {
    id: "d4444444-4444-4444-4444-444444444444",
    name: "ฝ่ายการเงินและบัญชี (Finance)",
    code: "FIN",
    created_at: "2026-01-01T08:00:00+07:00",
  },
  {
    id: "d5555555-5555-5555-5555-555555555555",
    name: "ฝ่ายบริหารจัดการและปฏิบัติการ (Operations)",
    code: "OPS",
    created_at: "2026-01-01T08:00:00+07:00",
  },
];

export const initialProfiles: Profile[] = [
  {
    id: "u1111111-1111-1111-1111-111111111111",
    email: "somchai.admin@smartroom.in.th",
    full_name: "ดร. สมชาย มั่นคงวิวัฒน์ (Admin)",
    role: "admin",
    department_id: "d1111111-1111-1111-1111-111111111111",
    department: initialDepartments[0],
    phone: "081-234-5678",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    created_at: "2026-01-10T09:00:00+07:00",
  },
  {
    id: "u2222222-2222-2222-2222-222222222222",
    email: "wiparat.approver@smartroom.in.th",
    full_name: "คุณวิภาวรรณ ศรีสุนทร (Approver)",
    role: "approver",
    department_id: "d5555555-5555-5555-5555-555555555555",
    department: initialDepartments[4],
    phone: "089-876-5432",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
    created_at: "2026-01-12T09:00:00+07:00",
  },
  {
    id: "u3333333-3333-3333-3333-333333333333",
    email: "thanakorn.user@smartroom.in.th",
    full_name: "คุณธนากร เกียรติสกุล (User)",
    role: "user",
    department_id: "d3333333-3333-3333-3333-333333333333",
    department: initialDepartments[2],
    phone: "086-555-9012",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
    created_at: "2026-02-01T10:00:00+07:00",
  },
  {
    id: "u4444444-4444-4444-4444-444444444444",
    email: "nattida.dev@smartroom.in.th",
    full_name: "คุณณัฐธิดา ปัญญาโสภณ (User/IT)",
    role: "user",
    department_id: "d1111111-1111-1111-1111-111111111111",
    department: initialDepartments[0],
    phone: "082-998-1122",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80",
    created_at: "2026-02-15T11:00:00+07:00",
  },
];

export const initialRooms: Room[] = [
  {
    id: "r1111111-1111-1111-1111-111111111111",
    name: "Grand Boardroom (ห้องกรรณิการ์)",
    building: "อาคาร A (Main Tower)",
    floor: "ชั้น 10",
    room_number: "A-1001",
    capacity: 24,
    description: "ห้องประชุมใหญ่ระดับพรีเมียม เหมาะสำหรับการประชุมคณะกรรมการ ประชุมผู้ถือหุ้น และงานแถลงข่าว พร้อมระบบภาพและเสียงแบบ 4K Ultra HD",
    image_url: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    status: "available",
    amenities: ["จอ 4K 85 นิ้ว", "ระบบ Video Conference (Cisco Webex)", "ไมโครโฟนรอบทิศทาง 8 จุด", "กระดานไวท์บอร์ดกระจก", "เครื่องชงกาแฟแคปซูล", "Wi-Fi 6 ความเร็วสูง"],
    created_at: "2026-01-01T08:00:00+07:00",
    equipment: [
      { id: "eq1", room_id: "r1111111-1111-1111-1111-111111111111", name: "จอ Smart TV 85\"", quantity: 1, condition: "good" },
      { id: "eq2", room_id: "r1111111-1111-1111-1111-111111111111", name: "ชุดไมค์ประชุมตั้งโต๊ะ", quantity: 12, condition: "good" },
      { id: "eq3", room_id: "r1111111-1111-1111-1111-111111111111", name: "กล้อง PTZ 4K AI Auto-framing", quantity: 1, condition: "good" },
    ],
  },
  {
    id: "r2222222-2222-2222-2222-222222222222",
    name: "Creative Studio (ห้องราชพฤกษ์)",
    building: "อาคาร A (Main Tower)",
    floor: "ชั้น 8",
    room_number: "A-804",
    capacity: 12,
    description: "ห้องประชุมบรรยากาศสร้างสรรค์ ออกแบบสำหรับการทำ Design Sprint, Brainstorming และวางแผนกลยุทธ์ มีผนังเขียนไอเดียได้รอบห้อง",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    status: "available",
    amenities: ["Interactive Touchscreen 75 นิ้ว", "Whiteboard Wall 360°", "โต๊ะปรับระดับได้", "Wireless Presentation Box", "Post-it & Design Kits"],
    created_at: "2026-01-01T08:00:00+07:00",
    equipment: [
      { id: "eq4", room_id: "r2222222-2222-2222-2222-222222222222", name: "Interactive Touchscreen 75\"", quantity: 1, condition: "good" },
      { id: "eq5", room_id: "r2222222-2222-2222-2222-222222222222", name: "ไวท์บอร์ดบานเลื่อน 3 ตอน", quantity: 1, condition: "good" },
    ],
  },
  {
    id: "r3333333-3333-3333-3333-333333333333",
    name: "Executive Suite (ห้องมณฑา)",
    building: "อาคาร B (Executive Wing)",
    floor: "ชั้น 12",
    room_number: "B-1201",
    capacity: 8,
    description: "ห้องประชุมผู้บริหารตกแต่งหรูหรา กระจกตัดแสง ป้องกันเสียงรบกวน 100% เหมาะสำหรับการประชุมลับและการเจรจาธุรกิจสำคัญ",
    image_url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
    status: "available",
    amenities: ["จอ OLED 65 นิ้ว", "Smart Privacy Glass (กระจกปรับทึบแสง)", "ไมค์ไร้สาย Shure", "ลำโพง Bang & Olufsen", "ตู้เย็นมินิบาร์"],
    created_at: "2026-01-01T08:00:00+07:00",
    equipment: [
      { id: "eq6", room_id: "r3333333-3333-3333-3333-333333333333", name: "จอ OLED 65\"", quantity: 1, condition: "good" },
      { id: "eq7", room_id: "r3333333-3333-3333-3333-333333333333", name: "ไมโครโฟน Shure Wireless", quantity: 2, condition: "good" },
    ],
  },
  {
    id: "r4444444-4444-4444-4444-444444444444",
    name: "Training & Workshop Hall (ห้องนครินทร์)",
    building: "อาคาร B (Executive Wing)",
    floor: "ชั้น 4",
    room_number: "B-405",
    capacity: 45,
    description: "ห้องประชุมและจัดอบรมขนาดใหญ่ มีเวทียกพื้น โปรเจกเตอร์คู่ และระบบเสียงรอบทิศทาง จัดเก้าอี้ได้ทั้งแบบ Classroom และ Theater",
    image_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    status: "available",
    amenities: ["โปรเจกเตอร์เลเซอร์คู่ 8,000 Lumens", "จอฉายขนาด 150 นิ้ว x 2", "ไมค์ลอยไร้สาย 4 ตัว", "แท่นบรรยายอัจฉริยะ", "ระบบ Live Streaming"],
    created_at: "2026-01-01T08:00:00+07:00",
    equipment: [
      { id: "eq8", room_id: "r4444444-4444-4444-4444-444444444444", name: "เครื่องฉายเลเซอร์โปรเจกเตอร์", quantity: 2, condition: "good" },
      { id: "eq9", room_id: "r4444444-4444-4444-4444-444444444444", name: "ไมโครโฟนไร้สาย UHF", quantity: 4, condition: "good" },
    ],
  },
  {
    id: "r5555555-5555-5555-5555-555555555555",
    name: "Huddle Room Alpha (ห้องประชุมย่อย 1)",
    building: "อาคาร A (Main Tower)",
    floor: "ชั้น 7",
    room_number: "A-702",
    capacity: 4,
    description: "ห้องประชุมย่อยส่วนตัว เหมาะสำหรับทีมคุยงานแบบกระชับ (Standup Meeting), 1-on-1 หรือสัมภาษณ์งาน",
    image_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    status: "available",
    amenities: ["จอ LED 50 นิ้ว", "Logitech MeetUp All-in-One Bar", "ไวท์บอร์ดแม่เหล็ก", "ปลั๊กไฟและ USB-C Charging Station"],
    created_at: "2026-01-01T08:00:00+07:00",
    equipment: [
      { id: "eq10", room_id: "r5555555-5555-5555-5555-555555555555", name: "Logitech MeetUp Video Bar", quantity: 1, condition: "good" },
    ],
  },
  {
    id: "r6666666-6666-6666-6666-666666666666",
    name: "Focus Room Beta (ห้องประชุมย่อย 2)",
    building: "อาคาร A (Main Tower)",
    floor: "ชั้น 7",
    room_number: "A-703",
    capacity: 6,
    description: "ห้องประชุมขนาดกะทัดรัด พร้อมหน้าต่างวิวสวน ปัจจุบันปิดปรับปรุงระบบเครื่องเสียงและติดตั้งเซ็นเซอร์ตรวจจับการใช้งาน",
    image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    status: "maintenance",
    amenities: ["จอ LED 55 นิ้ว", "Poly Studio Bar", "ไวท์บอร์ดกระจก", "เครื่องฟอกอากาศ PM2.5"],
    created_at: "2026-01-01T08:00:00+07:00",
    equipment: [
      { id: "eq11", room_id: "r6666666-6666-6666-6666-666666666666", name: "ระบบเสียงห้องประชุม", quantity: 1, condition: "needs_repair" },
    ],
  },
];

// Helper to generate dynamic dates relative to today
const now = new Date();
const formatDate = (offsetDays: number, hours: number, minutes: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const initialBookings: Booking[] = [
  {
    id: "b101",
    room_id: "r1111111-1111-1111-1111-111111111111",
    user_id: "u3333333-3333-3333-3333-333333333333",
    title: "ประชุมสรุปแผนการตลาดและเปิดตัวผลิตภัณฑ์ Q4",
    description: "นำเสนอรายงานยอดขายรายไตรมาสและกลยุทธ์การตลาดดิจิทัลประจำปี",
    start_time: formatDate(0, 13, 0), // Today 13:00
    end_time: formatDate(0, 15, 30),   // Today 15:30
    attendees_count: 18,
    status: "approved",
    approved_by: "u2222222-2222-2222-2222-222222222222",
    approved_at: formatDate(-1, 16, 0),
    created_at: formatDate(-2, 10, 0),
    equipment_requests: [
      { id: "be1", booking_id: "b101", equipment_name: "ไมโครโฟนไร้สายเสริม", quantity: 2 },
      { id: "be2", booking_id: "b101", equipment_name: "ชุดเครื่องดื่มรับรอง", quantity: 18 },
    ],
  },
  {
    id: "b102",
    room_id: "r2222222-2222-2222-2222-222222222222",
    user_id: "u4444444-4444-4444-4444-444444444444",
    title: "Sprint Planning & System Architecture Review",
    description: "วางแผนงาน Sprint 42 และทบทวนสถาปัตยกรรมคลาวด์ร่วมกับทีม DevOps",
    start_time: formatDate(0, 10, 0), // Today 10:00
    end_time: formatDate(0, 12, 0),   // Today 12:00
    attendees_count: 10,
    status: "approved",
    approved_by: "u2222222-2222-2222-2222-222222222222",
    approved_at: formatDate(-1, 11, 30),
    created_at: formatDate(-2, 14, 0),
    equipment_requests: [
      { id: "be3", booking_id: "b102", equipment_name: "ไวท์บอร์ดมาร์กเกอร์และ Post-it", quantity: 1 },
    ],
  },
  {
    id: "b103",
    room_id: "r3333333-3333-3333-3333-333333333333",
    user_id: "u1111111-1111-1111-1111-111111111111",
    title: "ประชุมลับ: การเจรจาร่วมทุนและพันธมิตรธุรกิจ",
    description: "การหารือร่วมกับตัวแทนกองทุนและที่ปรึกษากฎหมายภายนอก",
    start_time: formatDate(1, 14, 0), // Tomorrow 14:00
    end_time: formatDate(1, 16, 0),   // Tomorrow 16:00
    attendees_count: 6,
    status: "pending",
    created_at: formatDate(0, 9, 30),
  },
  {
    id: "b104",
    room_id: "r4444444-4444-4444-4444-444444444444",
    user_id: "u3333333-3333-3333-3333-333333333333",
    title: "Workshop: การประยุกต์ใช้ AI ในการทำงานประจำวัน",
    description: "อบรมพนักงานทุกแผนกเพื่อยกระดับทักษะ AI Tools",
    start_time: formatDate(2, 9, 0), // In 2 days 09:00
    end_time: formatDate(2, 16, 0),  // In 2 days 16:00
    attendees_count: 35,
    status: "pending",
    created_at: formatDate(0, 8, 15),
    equipment_requests: [
      { id: "be4", booking_id: "b104", equipment_name: "ระบบบันทึกวิดีโอและ Live Stream", quantity: 1 },
      { id: "be5", booking_id: "b104", equipment_name: "ไมค์ลอยไร้สาย 4 ตัว", quantity: 1 },
    ],
  },
  {
    id: "b105",
    room_id: "r5555555-5555-5555-5555-555555555555",
    user_id: "u4444444-4444-4444-4444-444444444444",
    title: "1-on-1 Performance Coaching",
    description: "การพูดคุยติดตามผลการปฏิบัติงานรายบุคคล",
    start_time: formatDate(0, 16, 0), // Today 16:00
    end_time: formatDate(0, 17, 0),   // Today 17:00
    attendees_count: 2,
    status: "approved",
    approved_by: "u2222222-2222-2222-2222-222222222222",
    approved_at: formatDate(-1, 15, 0),
    created_at: formatDate(-1, 10, 0),
  },
  {
    id: "b106",
    room_id: "r2222222-2222-2222-2222-222222222222",
    user_id: "u3333333-3333-3333-3333-333333333333",
    title: "Customer Journey Mapping Session",
    description: "วิเคราะห์พฤติกรรมลูกค้าสำหรับบริการใหม่",
    start_time: formatDate(-1, 13, 0), // Yesterday
    end_time: formatDate(-1, 15, 0),
    attendees_count: 8,
    status: "approved",
    approved_by: "u2222222-2222-2222-2222-222222222222",
    approved_at: formatDate(-2, 11, 0),
    created_at: formatDate(-3, 10, 0),
  },
  {
    id: "b107",
    room_id: "r1111111-1111-1111-1111-111111111111",
    user_id: "u4444444-4444-4444-4444-444444444444",
    title: "สัมมนาผู้ใช้งานระบบภายใน",
    description: "เนื่องจากวิทยากรติดภารกิจด่วน จึงขอยกเลิกรายการ",
    start_time: formatDate(-2, 10, 0),
    end_time: formatDate(-2, 12, 0),
    attendees_count: 20,
    status: "cancelled",
    cancellation_reason: "วิทยากรภายนอกติดภารกิจด่วน เลื่อนไปจัดเดือนหน้า",
    created_at: formatDate(-4, 0, 0),
  },
];

export const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    user_id: "u3333333-3333-3333-3333-333333333333",
    title: "การจองของคุณได้รับการอนุมัติแล้ว",
    message: "การประชุม 'สรุปแผนการตลาดและเปิดตัวผลิตภัณฑ์ Q4' ที่ห้อง Grand Boardroom ได้รับการอนุมัติแล้ว",
    type: "success",
    is_read: false,
    link_url: "/bookings",
    created_at: formatDate(-1, 16, 0),
  },
  {
    id: "notif-2",
    user_id: "u1111111-1111-1111-1111-111111111111",
    title: "มีรายการจองใหม่รอการตรวจสอบ",
    message: "การจอง 'Workshop: การประยุกต์ใช้ AI ในการทำงานประจำวัน' ต้องการการอนุมัติจากคุณ",
    type: "info",
    is_read: false,
    link_url: "/bookings",
    created_at: formatDate(0, 8, 20),
  },
  {
    id: "notif-3",
    user_id: "u3333333-3333-3333-3333-333333333333",
    title: "แจ้งเตือนการใช้งานห้องประชุม",
    message: "การประชุมของคุณจะเริ่มในอีก 1 ชั่วโมง ที่ห้อง Grand Boardroom กรุณาเตรียมพร้อม",
    type: "reminder",
    is_read: true,
    link_url: "/calendar",
    created_at: formatDate(0, 12, 0),
  },
];
