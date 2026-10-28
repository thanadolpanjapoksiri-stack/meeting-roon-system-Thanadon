-- ====================================================================
-- SMART MEETING ROOM BOOKING SYSTEM - SEED DATA
-- ====================================================================

-- 1. Departments
INSERT INTO public.departments (id, name, code) VALUES
('d1111111-1111-1111-1111-111111111111', 'ฝ่ายพัฒนาเทคโนโลยีและสารสนเทศ (IT)', 'IT'),
('d2222222-2222-2222-2222-222222222222', 'ฝ่ายทรัพยากรบุคคล (HR)', 'HR'),
('d3333333-3333-3333-3333-333333333333', 'ฝ่ายการตลาดและประชาสัมพันธ์ (Marketing)', 'MKT'),
('d4444444-4444-4444-4444-444444444444', 'ฝ่ายการเงินและบัญชี (Finance)', 'FIN'),
('d5555555-5555-5555-5555-555555555555', 'ฝ่ายบริหารจัดการและปฏิบัติการ (Operations)', 'OPS')
ON CONFLICT (id) DO NOTHING;

-- 2. Meeting Rooms
INSERT INTO public.rooms (id, name, building, floor, room_number, capacity, description, image_url, status, amenities) VALUES
(
    'r1111111-1111-1111-1111-111111111111',
    'Grand Boardroom (ห้องประชุมใหญ่ กรรณิการ์)',
    'อาคาร A (Main Tower)',
    'ชั้น 10',
    'A-1001',
    24,
    'ห้องประชุมใหญ่ระดับพรีเมียม เหมาะสำหรับการประชุมคณะกรรมการ ประชุมผู้ถือหุ้น และงานแถลงข่าว พร้อมระบบภาพและเสียงแบบ 4K Ultra HD',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    'available',
    ARRAY['จอ 4K 85 นิ้ว', 'ระบบ Video Conference (Cisco Webex)', 'ไมโครโฟนรอบทิศทาง 8 จุด', 'กระดานไวท์บอร์ดกระจก', 'เครื่องชงกาแฟแคปซูล', 'Wi-Fi 6 ความเร็วสูง']
),
(
    'r2222222-2222-2222-2222-222222222222',
    'Creative Studio (ห้องประชุมระดมความคิด ราชพฤกษ์)',
    'อาคาร A (Main Tower)',
    'ชั้น 8',
    'A-804',
    12,
    'ห้องประชุมบรรยากาศสร้างสรรค์ ออกแบบสำหรับการทำ Design Sprint, Brainstorming และวางแผนกลยุทธ์ทีม มีผนังเขียนไอเดียได้รอบห้อง',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'available',
    ARRAY['Interactive Touchscreen 75 นิ้ว', 'Whiteboard Wall 360°', 'โต๊ะปรับระดับได้', 'Wireless Presentation Box', 'Post-it & Design Kits']
),
(
    'r3333333-3333-3333-3333-333333333333',
    'Executive Suite (ห้องประชุมผู้บริหาร มณฑา)',
    'อาคาร B (Executive Wing)',
    'ชั้น 12',
    'B-1201',
    8,
    'ห้องประชุมผู้บริหารตกแต่งหรูหรา กระจกตัดแสง ป้องกันเสียงรบกวน 100% เหมาะสำหรับการประชุมลับและการเจรจาธุรกิจสำคัญ',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80',
    'available',
    ARRAY['จอ OLED 65 นิ้ว', 'Smart Privacy Glass (กระจกปรับทึบแสง)', 'ไมค์ไร้สาย Shure', 'ลำโพง Bang & Olufsen', 'ตู้เย็นมินิบาร์']
),
(
    'r4444444-4444-4444-4444-444444444444',
    'Training & Workshop Hall (ห้องสัมมนา นครินทร์)',
    'อาคาร B (Executive Wing)',
    'ชั้น 4',
    'B-405',
    45,
    'ห้องประชุมและจัดอบรมขนาดใหญ่ มีเวทียกพื้น โปรเจกเตอร์คู่ และระบบเสียงรอบทิศทาง จัดเก้าอี้ได้ทั้งแบบ Classroom และ Theater',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    'available',
    ARRAY['โปรเจกเตอร์เลเซอร์คู่ 8,000 Lumens', 'จอฉายขนาด 150 นิ้ว x 2', 'ไมค์ลอยไร้สาย 4 ตัว', 'แท่นบรรยายอัจฉริยะ', 'ระบบ Live Streaming']
),
(
    'r5555555-5555-5555-5555-555555555555',
    'Huddle Room Alpha (ห้องประชุมย่อย 1)',
    'อาคาร A (Main Tower)',
    'ชั้น 7',
    'A-702',
    4,
    'ห้องประชุมย่อยส่วนตัว เหมาะสำหรับทีมคุยงานแบบกระชับ (Standup Meeting), 1-on-1 หรือสัมภาษณ์งาน',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
    'available',
    ARRAY['จอ LED 50 นิ้ว', 'Logitech MeetUp All-in-One Bar', 'ไวท์บอร์ดแม่เหล็ก', 'ปลั๊กไฟและ USB-C Charging Station']
),
(
    'r6666666-6666-6666-6666-666666666666',
    'Focus Room Beta (ห้องประชุมย่อย 2)',
    'อาคาร A (Main Tower)',
    'ชั้น 7',
    'A-703',
    6,
    'ห้องประชุมขนาดกะทัดรัด พร้อมหน้าต่างวิวสวน เหมาะสำหรับประชุมทางไกลและการทำงานร่วมกันเป็นกลุ่มย่อย',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    'maintenance',
    ARRAY['จอ LED 55 นิ้ว', 'Poly Studio Bar', 'ไวท์บอร์ดกระจก', 'เครื่องฟอกอากาศ PM2.5']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Room Equipment
INSERT INTO public.room_equipment (room_id, name, quantity, condition) VALUES
('r1111111-1111-1111-1111-111111111111', 'จอ Smart TV 85"', 1, 'good'),
('r1111111-1111-1111-1111-111111111111', 'ชุดไมค์ประชุมตั้งโต๊ะ', 12, 'good'),
('r1111111-1111-1111-1111-111111111111', 'กล้อง PTZ 4K AI Auto-framing', 1, 'good'),
('r2222222-2222-2222-2222-222222222222', 'Interactive Touchscreen 75"', 1, 'good'),
('r2222222-2222-2222-2222-222222222222', 'ไวท์บอร์ดบานเลื่อน 3 ตอน', 1, 'good'),
('r4444444-4444-4444-4444-444444444444', 'เครื่องฉายเลเซอร์โปรเจกเตอร์', 2, 'good'),
('r4444444-4444-4444-4444-444444444444', 'ไมโครโฟนไร้สาย UHF', 4, 'good'),
('r6666666-6666-6666-6666-666666666666', 'ระบบเสียงห้องประชุม', 1, 'needs_repair');
