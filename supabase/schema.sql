-- ====================================================================
-- SMART MEETING ROOM BOOKING SYSTEM - DATABASE SCHEMA
-- PostgreSQL / Supabase
-- Timezone: Asia/Bangkok
-- Features: RLS Policies, Conflict Prevention (btree_gist), Audit Logs
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Set Time Zone
SET timezone = 'Asia/Bangkok';

-- 2. Drop existing triggers & tables if recreating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS trigger_audit_bookings ON public.bookings;
DROP FUNCTION IF EXISTS public.log_booking_audit();

-- 3. Create Tables

-- 3.1 DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now())
);

-- 3.2 PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'approver', 'user')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now())
);

-- 3.3 ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(20) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
    amenities TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now())
);

-- 3.4 ROOM EQUIPMENT
CREATE TABLE IF NOT EXISTS public.room_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    condition VARCHAR(50) NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'needs_repair'))
);

-- 3.5 BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    attendees_count INT NOT NULL DEFAULT 1 CHECK (attendees_count > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    rejection_reason TEXT,
    cancellation_reason TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now()),
    CONSTRAINT check_booking_time_order CHECK (end_time > start_time)
);

-- Double-Booking Prevention using PostgreSQL EXCLUDE GIST Constraint
-- Only prevents overlap for bookings that are active ('pending' or 'approved')
-- Cancelled and rejected bookings do not block new reservations!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap_gist'
    ) THEN
        ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_no_overlap_gist
        EXCLUDE USING gist (
            room_id WITH =,
            tstzrange(start_time, end_time, '[)') WITH &&
        )
        WHERE (status IN ('pending', 'approved'));
    END IF;
END $$;

-- 3.6 BOOKING EQUIPMENT (Special requested equipment for this specific booking)
CREATE TABLE IF NOT EXISTS public.booking_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    equipment_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- 3.7 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'reminder')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now())
);

-- 3.8 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Bangkok'::text, now())
);

-- ====================================================================
-- 4. Indexes for Performance & Instant Querying
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_room_status_time ON public.bookings (room_id, status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms (status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs (table_name, record_id, created_at DESC);

-- ====================================================================
-- 5. Trigger Functions
-- ====================================================================

-- 5.1 Automatically Update `updated_at` Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('Asia/Bangkok'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.2 Auto Create Profile on auth.users Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT := 'user';
BEGIN
    -- First registered user can optionally become admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles) THEN
        default_role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', default_role),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.3 Audit Log Trigger on Bookings
CREATE OR REPLACE FUNCTION public.log_booking_audit()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, changed_by, new_values)
        VALUES ('bookings', NEW.id, 'INSERT', current_user_id, row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, changed_by, old_values, new_values)
        VALUES ('bookings', NEW.id, 'UPDATE', current_user_id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, changed_by, old_values)
        VALUES ('bookings', OLD.id, 'DELETE', current_user_id, row_to_json(OLD)::jsonb);
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_audit_bookings
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.log_booking_audit();

-- ====================================================================
-- 6. Row Level Security (RLS)
-- ====================================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6.1 Departments Policies
CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

-- 6.2 Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

-- 6.3 Rooms & Room Equipment Policies
CREATE POLICY "Rooms viewable by everyone" ON public.rooms
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can insert/update/delete rooms" ON public.rooms
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Room equipment viewable by everyone" ON public.room_equipment
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can manage room equipment" ON public.room_equipment
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

-- 6.4 Bookings Policies
CREATE POLICY "All authenticated users can view bookings" ON public.bookings
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own pending/approved bookings" ON public.bookings
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id 
        OR public.current_user_role() IN ('admin', 'approver')
    );

CREATE POLICY "Admins and Approvers can approve/reject bookings" ON public.bookings
    FOR UPDATE TO authenticated
    USING (public.current_user_role() IN ('admin', 'approver'));

-- 6.5 Booking Equipment Policies
CREATE POLICY "Booking equipment viewable by all" ON public.booking_equipment
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can insert booking equipment" ON public.booking_equipment
    FOR INSERT TO authenticated WITH CHECK (true);

-- 6.6 Notifications Policies
CREATE POLICY "Users can view only their own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System/Admins can create notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- 6.7 Audit Logs Policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.current_user_role() = 'admin');

-- ====================================================================
-- 7. Realtime Publications
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
