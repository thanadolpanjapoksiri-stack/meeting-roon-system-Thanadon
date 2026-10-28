# 🏢 Smart Meeting Room Booking System

ระบบบริหารจัดการและจองห้องประชุมอัจฉริยะระดับองค์กร (Modern Enterprise Dashboard) พร้อมระบบป้องกันการจองซ้อนแบบหลายชั้น (Multi-tier Double-Booking Prevention), ปฏิทินแบบ Interactive, ระบบอนุมัติตามสิทธิ์, ระบบแจ้งเตือนเรียลไทม์ และรายงานสถิติเชิงลึก

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. แดชบอร์ดสรุปภาพรวม (Real-time Dashboard)
- แสดงจำนวนห้องประชุมทั้งหมด และห้องว่างในขณะนั้นแบบคำนวณสด
- สรุปยอดการจองประจำวัน และรายการที่รอการอนุมัติ
- กราฟแนวโน้มการใช้งาน 7 วันล่าสุด (Recharts Area Chart)
- กราฟสัดส่วนสถานะการจอง (Approved, Pending, Cancelled, Rejected)
- ลำดับห้องประชุมยอดนิยม (Most Popular Rooms) และรายการจองที่กำลังจะมาถึง

### 2. ปฏิทินการจองอัจฉริยะ (Booking Calendar)
- มุมมองปฏิทิน 3 รูปแบบ: **รายเดือน (Month)**, **รายสัปดาห์ (Week)** และ **รายวัน (Day)**
- แยกสีตามสถานะการจองชัดเจน (อนุมัติแล้ว = เขียว, รออนุมัติ = เหลืองส้ม, ยกเลิก = แดง)
- กรองตารางเวลาตามห้องประชุม และตามสถานะ
- คลิกเลือกช่วงเวลาว่างบนปฏิทินเพื่อเริ่มจองห้องได้ทันที

### 3. ระบบจองห้องและป้องกันการจองซ้อน (Conflict Prevention)
- **Multi-layer Double Booking Prevention**:
  1. **Client-side Realtime Checker**: ตรวจสอบทันทีที่ผู้ใช้เลือกห้องและเวลา แจ้งเตือนข้อความขัดแย้งล่วงหน้า
  2. **Application State Validation**: ตรวจสอบทับซ้อนช่วงเวลา `[start_time, end_time)` และความจุของห้อง
  3. **Database GiST Exclusion Constraint**: กำหนด `EXCLUDE USING gist (room_id WITH =, tstzrange(start_time, end_time, '[)') WITH &&)` ป้องกัน Race Condition อย่างสมบูรณ์ในระดับ PostgreSQL
- เลือกอุปกรณ์และบริการเสริม (จอ 4K, โปรเจกเตอร์, ไมค์ลอย, Video Conference, ชุดรับรอง)

### 4. การจัดการห้องประชุม (Room Management)
- เพิ่ม แก้ไข และปิดปรับปรุงห้องประชุม
- บันทึกความจุ, อาคาร, ชั้น, หมายเลขห้อง, รูปภาพ, รายการอุปกรณ์ และสิ่งอำนวยความสะดวก
- ควบคุมสิทธิ์เฉพาะผู้ดูแลระบบ (Admin)

### 5. การจัดการรายการจองและอนุมัติ (Booking Approvals)
- ตารางรายการจองทั้งหมด พร้อมช่องค้นหาและตัวกรองสถานะ
- ระบบอนุมัติ (Approve) หรือปฏิเสธ (Reject) พร้อมบันทึกเหตุผลกำกับ (สำหรับ Approver และ Admin)
- ระบบขอยกเลิกการจอง (Cancel) พร้อมบันทึกเหตุผล (สำหรับเจ้าของรายการหรือ Admin)
- ส่งออกข้อมูลเป็นไฟล์ CSV (`UTF-8 BOM` รองรับภาษาไทยใน Microsoft Excel)

### 6. ศูนย์การแจ้งเตือน (Notification Center)
- แจ้งเตือนทันทีเมื่อส่งคำขอจอง, ได้รับการอนุมัติ, ถูกปฏิเสธ หรือมีการยกเลิก
- กระดิ่งแจ้งเตือนพร้อม Badge นับจำนวนที่ยังไม่ได้อ่าน
- รองรับ WebSocket Realtime ผ่าน Supabase Realtime

### 7. รายงานและสถิติเชิงลึก (Reports & Analytics)
- กราฟแท่งเปรียบเทียบชั่วโมงการใช้งานของแต่ละห้อง
- กราฟสัดส่วนการจองแยกตามแผนก
- เลือกช่วงเวลาวิเคราะห์ได้ (7 วันล่าสุด, 30 วันล่าสุด, ทั้งหมด)
- รองรับการพิมพ์รายงาน (Print View ที่จัดหน้าให้สะอาดตาโดยอัตโนมัติ)
- ส่งออกรายงานการใช้งานห้องประชุมเป็นไฟล์ CSV

### 8. ระบบสิทธิ์และการสลับบทบาท (Role-based Personas)
- **Admin**: จัดการห้องประชุมทั้งหมด, ดูแลผู้ใช้, อนุมัติ/ยกเลิกการจองทุกรายการ, ดูรายงานสถิติ
- **Approver**: ตรวจสอบรายละเอียดและกดอนุมัติหรือปฏิเสธคำขอจอง
- **User**: ตรวจสอบห้องว่าง, สร้างคำขอจอง, ดูรายการของตนเอง และยกเลิกตามเงื่อนไข
- มี **Role Switcher** บริเวณ Sidebar ให้ทดสอบสลับสิทธิ์ได้ทันทีโดยไม่ต้องล็อกเอาต์

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling & Design System**: Tailwind CSS, Noto Sans Thai, Inter
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Database & Auth**: PostgreSQL / Supabase
- **Toast Notifications**: Sonner
- **Exporting**: SheetJS / UTF-8 CSV Generator

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. เข้าสู่โฟลเดอร์โปรเจกต์
```bash
cd "C:\Users\TL\.gemini\antigravity\scratch\smart-meeting-room"
```

> **คำแนะนำสำหรับผู้ใช้งาน:** แนะนำให้ตั้งค่าโฟลเดอร์นี้เป็น Active Workspace ในโปรแกรม Antigravity IDE เพื่อความสะดวกในการแก้ไขและพัฒนาต่อเนื่อง

### 2. ติดตั้ง Dependencies (หากยังไม่ได้ติดตั้ง)
```bash
npm install
```

### 3. การรันในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

### 4. การรัน Automated Unit Tests
```bash
npm test
```
จะทดสอบอัลกอริทึม Double-Booking Overlap Detection, การตรวจสอบสิทธิ์ตามบทบาท (RBAC) และการตรวจสอบความจุของห้อง

### 5. การ Build และรันในโหมด Production
```bash
npm run build
npm start
```

---

## 🗄 การเชื่อมต่อกับฐานข้อมูล Supabase จริง (Production Database Setup)

แอปพลิเคชันถูกออกแบบให้พร้อมใช้งานทันที (Zero-config out of the box) โดยมี Local State & Mock Adapter สำรองข้อมูลในกรณีที่ยังไม่ได้ใส่ API Key เมื่อต้องการเชื่อมต่อไปยัง Supabase จริง ให้ปฏิบัติตามขั้นตอนดังนี้:

### ขั้นตอนที่ 1: สร้างโปรเจกต์บน Supabase
1. เข้าไปที่ [https://supabase.com](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor**
3. คัดลอกเนื้อหาทั้งหมดในไฟล์ `supabase/schema.sql` ไปวางแล้วกด **Run** เพื่อสร้างตารางทั้งหมด, RLS Policies, ฟังก์ชันป้องกันการจองซ้อน และ Triggers
4. คัดลอกเนื้อหาในไฟล์ `supabase/seed.sql` ไปวางแล้วกด **Run** เพื่อใส่ข้อมูลเริ่มต้น (ห้องประชุม, แผนก, อุปกรณ์)

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables
เปิดไฟล์ `.env.local` แล้วใส่ค่า URL และ Key จากหน้า **Project Settings -> API** ใน Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_TIMEZONE=Asia/Bangkok
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛡️ การป้องกันการจองซ้อนในระดับ Database (GiST Exclusion)

ในไฟล์ `supabase/schema.sql` มีการประกาศ Exclusion Constraint:
```sql
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_no_overlap_gist
EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (status IN ('pending', 'approved'));
```
เงื่อนไขนี้การันตีว่า:
- แม้จะมีคำขอจองห้องเดียวกันส่งเข้ามาในเสี้ยววินาทีเดียวกัน (Concurrent Requests) PostgreSQL จะปฏิเสธคำขอที่สองในระดับ Database ทันที
- รายการที่ `status = 'cancelled'` หรือ `'rejected'` จะไม่ถูกนำมาขัดขวางการจองใหม่
