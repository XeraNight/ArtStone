-- ==============================================================================
-- ArtStone Security Hardening Migration
-- Applies Strict RLS & OWASP Security Best Practices
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'sales');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'meeting_scheduled', 'offer_sent', 'won', 'lost');
CREATE TYPE offer_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'sales'::user_role NOT NULL,
    region_id UUID,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Audit Logs (Crucial for Enterprise Security)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    status lead_status DEFAULT 'new'::lead_status NOT NULL,
    source TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    region_id UUID,
    estimated_value DECIMAL(12,2),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_id TEXT, -- IČO
    vat_id TEXT, -- DIČ/IČ DPH
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'Slovensko',
    region_id UUID,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    status offer_status DEFAULT 'draft'::offer_status NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    valid_until DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    status invoice_status DEFAULT 'draft'::invoice_status NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Stock Items Table
CREATE TABLE IF NOT EXISTS public.stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL(10,2) DEFAULT 0 NOT NULL,
    unit TEXT DEFAULT 'ks' NOT NULL,
    unit_price DECIMAL(10,2),
    min_quantity DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    entity_type TEXT, -- e.g., 'client', 'offer', 'invoice'
    entity_id UUID,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES (RBAC Implementation)
-- ==============================================================================

-- Helper Function to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;


-- PROFILES POLICIES
-- Everyone can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT USING (public.get_my_role() = 'admin');

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.get_my_role() = 'admin');


-- AUDIT LOGS POLICIES
-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
    FOR SELECT USING (public.get_my_role() = 'admin');

-- System can insert logs (via trigger or trusted backend), users cannot mutate logs directly.
CREATE POLICY "No manual insert to audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (false);
CREATE POLICY "No updates to audit logs" ON public.audit_logs
    FOR UPDATE USING (false);
CREATE POLICY "No deletes to audit logs" ON public.audit_logs
    FOR DELETE USING (false);


-- LEADS POLICIES
-- Admins/Managers can read all
CREATE POLICY "Admins/Managers can read all leads" ON public.leads
    FOR SELECT USING (public.get_my_role() IN ('admin', 'manager'));
-- Sales can read leads assigned to them or created by them
CREATE POLICY "Sales can read assigned leads" ON public.leads
    FOR SELECT USING (public.get_my_role() = 'sales' AND (assigned_to = auth.uid() OR created_by = auth.uid()));

-- All authenticated users can insert leads (they are assigned to them automatically by backend)
CREATE POLICY "Authenticated can insert leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins/Managers can update all
CREATE POLICY "Admins/Managers can update all leads" ON public.leads
    FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));
-- Sales can only update their own
CREATE POLICY "Sales can update own leads" ON public.leads
    FOR UPDATE USING (public.get_my_role() = 'sales' AND assigned_to = auth.uid());


-- CLIENTS POLICIES
-- Admins/Managers read all
CREATE POLICY "Admins/Managers can read all clients" ON public.clients
    FOR SELECT USING (public.get_my_role() IN ('admin', 'manager'));
-- Sales read assigned clients
CREATE POLICY "Sales can read assigned clients" ON public.clients
    FOR SELECT USING (public.get_my_role() = 'sales' AND (assigned_to = auth.uid() OR created_by = auth.uid()));

CREATE POLICY "Authenticated can insert clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins/Managers can update all clients" ON public.clients
    FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Sales can update own clients" ON public.clients
    FOR UPDATE USING (public.get_my_role() = 'sales' AND assigned_to = auth.uid());


-- OFFERS POLICIES
-- Logic matches clients
CREATE POLICY "Admins/Managers can read all offers" ON public.offers
    FOR SELECT USING (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Sales can read own offers" ON public.offers
    FOR SELECT USING (public.get_my_role() = 'sales' AND created_by = auth.uid());

CREATE POLICY "Authenticated can insert offers" ON public.offers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins/Managers can update all offers" ON public.offers
    FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Sales can update own offers" ON public.offers
    FOR UPDATE USING (public.get_my_role() = 'sales' AND created_by = auth.uid());

-- INVOICES POLICIES
-- Only Admin/Manager can deal with invoices usually
CREATE POLICY "Admins/Managers can read all invoices" ON public.invoices
    FOR SELECT USING (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Admins/Managers can insert invoices" ON public.invoices
    FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Admins/Managers can update invoices" ON public.invoices
    FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));

-- STOCK ITEMS POLICIES
-- Everyone can read stock
CREATE POLICY "Everyone can read stock" ON public.stock_items
    FOR SELECT USING (auth.uid() IS NOT NULL);
-- Only Admins/Managers can mutate stock
CREATE POLICY "Admins/Managers can insert stock" ON public.stock_items
    FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Admins/Managers can update stock" ON public.stock_items
    FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Admins/Managers can delete stock" ON public.stock_items
    FOR DELETE USING (public.get_my_role() IN ('admin', 'manager'));

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON public.clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_offers_client_id ON public.offers(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
