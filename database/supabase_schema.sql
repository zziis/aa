-- ============================================================================
-- ⚡ ZELZAL NEON PLATFORM - SUPABASE FULL DATABASE SCHEMA
-- مخطط قاعدة البيانات الكامل لمنصة زلزال نيون التكنولوجية
-- ============================================================================

-- 1. تمكين امتداد UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول المستخدمين (USERS TABLE)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    custom_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    points BIGINT DEFAULT 750,
    energy INT DEFAULT 100,
    butterfly_last_claim TIMESTAMPTZ,
    butterfly_spin_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_users_custom_id ON public.users(custom_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 3. جدول الرومات الصوتية (ROOMS TABLE)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    bio TEXT,
    owner_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    owner_name TEXT,
    owner_custom_id TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    passcode TEXT DEFAULT '',
    members_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول مشرفي الرومات
CREATE TABLE IF NOT EXISTS public.room_moderators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- جدول حظر المستخدمين من الرومات
CREATE TABLE IF NOT EXISTS public.room_bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- 4. جدول العدادات المشتراة (PURCHASED COUNTERS)
CREATE TABLE IF NOT EXISTS public.user_counters (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    catalog_id TEXT NOT NULL,
    name TEXT NOT NULL,
    daily_yield INT NOT NULL DEFAULT 35,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    last_collected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_counters_user ON public.user_counters(user_id);

-- 5. جدول سجل المعاملات والنقاط (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    delta BIGINT NOT NULL,
    reason TEXT NOT NULL,
    total_after BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول تذاكر الدعم الفني (SUPPORT TICKETS)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_custom_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT DEFAULT 'عام',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'قيد المراجعة',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول ردود التذاكر
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. تفعيل سياسات الأمان (ROW LEVEL SECURITY)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة والكتابة للعملاء الموثقين أو العامين
CREATE POLICY "Public Users Select" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Users Insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Users Update" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public Rooms Select" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Public Rooms Insert" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Rooms Update" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Public Counters Select" ON public.user_counters FOR SELECT USING (true);
CREATE POLICY "Public Counters Insert" ON public.user_counters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Counters Update" ON public.user_counters FOR UPDATE USING (true);

CREATE POLICY "Public Transactions Select" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public Transactions Insert" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Tickets Select" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Public Tickets Insert" ON public.support_tickets FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Replies Select" ON public.ticket_replies FOR SELECT USING (true);
CREATE POLICY "Public Replies Insert" ON public.ticket_replies FOR INSERT WITH CHECK (true);

-- ============================================================================
-- تم بناء المخطط بنجاح وجاهز للاستيراد في Supabase SQL Editor
-- ============================================================================
