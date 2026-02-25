-- ============================================================
-- ArtStone CRM – Supabase Setup Script
-- Spusti v Supabase SQL Editor
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Custom types (enums) ────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE app_role      AS ENUM ('admin', 'manager', 'sales', 'accountant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status   AS ENUM ('new', 'contacted', 'offer', 'won', 'lost', 'waiting');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_source   AS ENUM ('facebook_lead_ads', 'facebook_ads', 'google_ads', 'website_form', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quote_status  AS ENUM ('draft', 'sent', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'status_change');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_category AS ENUM ('pricelist', 'manual', 'internal', 'marketing', 'legal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABUĽKY
-- ============================================================

-- ── Regions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.regions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Profiles (extends auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL DEFAULT '',
  email            TEXT NOT NULL DEFAULT '',
  role             app_role DEFAULT 'sales',
  phone            TEXT,
  avatar_url       TEXT,
  region_id        UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  theme_preference TEXT NOT NULL DEFAULT 'system',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Leads ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name          TEXT NOT NULL,
  company_name          TEXT,
  email                 TEXT,
  phone                 TEXT,
  address               TEXT,
  postal_code           TEXT,
  region_id             UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  status                lead_status NOT NULL DEFAULT 'new',
  source_type           lead_source NOT NULL DEFAULT 'manual',
  source_campaign       TEXT,
  source_adset          TEXT,
  source_ad             TEXT,
  utm_source            TEXT,
  utm_medium            TEXT,
  utm_campaign          TEXT,
  external_lead_id      TEXT,
  assigned_user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  duplicate_of_lead_id  UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  converted_to_client_id UUID,
  notes                 TEXT,
  created_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Clients ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name     TEXT NOT NULL,
  company_name     TEXT,
  email            TEXT,
  phone            TEXT,
  address          TEXT,
  postal_code      TEXT,
  region_id        UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  status           client_status NOT NULL DEFAULT 'prospect',
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lead_origin_id   UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  total_value      NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spätná väzba: lead -> client
ALTER TABLE public.crm_leads
  ADD CONSTRAINT fk_lead_converted_client
  FOREIGN KEY (converted_to_client_id) REFERENCES public.clients(id) ON DELETE SET NULL
  NOT VALID;

-- ── Activities ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('lead', 'client')),
  entity_id     UUID NOT NULL,
  activity_type activity_type NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Inventory Categories ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Inventory Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  sku            TEXT NOT NULL UNIQUE,
  category_id    UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  qty_available  INTEGER NOT NULL DEFAULT 0,
  qty_reserved   INTEGER NOT NULL DEFAULT 0,
  min_stock      INTEGER NOT NULL DEFAULT 0,
  purchase_price NUMERIC(12,2),
  sale_price     NUMERIC(12,2),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Quotes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  client_id    UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  status       quote_status NOT NULL DEFAULT 'draft',
  valid_until  DATE,
  subtotal     NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping     NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate     NUMERIC(5,2) NOT NULL DEFAULT 20,
  tax_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total        NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes        TEXT,
  pdf_url      TEXT,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Quote Items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quote_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id          UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  description       TEXT NOT NULL,
  quantity          NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Invoices ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id      UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quote_id       UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  status         invoice_status NOT NULL DEFAULT 'draft',
  issue_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE,
  subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate       NUMERIC(5,2) NOT NULL DEFAULT 20,
  tax_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  pdf_url        TEXT,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Invoice Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  description       TEXT NOT NULL,
  quantity          NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Inventory Reservations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  client_id         UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quote_id          UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'fulfilled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Documents ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  category         document_category NOT NULL DEFAULT 'internal',
  file_url         TEXT NOT NULL,
  file_type        TEXT,
  file_size        TEXT,
  allowed_roles    app_role[] NOT NULL DEFAULT ARRAY['admin']::app_role[],
  allowed_user_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT,
  type       TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read    BOOLEAN NOT NULL DEFAULT false,
  link_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Audit Logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details     JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Lead Import Logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_import_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type      lead_source NOT NULL,
  result           TEXT NOT NULL CHECK (result IN ('created', 'duplicate', 'failed')),
  message          TEXT,
  external_lead_id TEXT,
  mapped_email     TEXT,
  mapped_phone     TEXT,
  lead_id          UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  imported_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXY
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned ON public.crm_leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_region ON public.crm_leads(region_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created ON public.crm_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned ON public.clients(assigned_user_id);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON public.quotes(client_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);

CREATE INDEX IF NOT EXISTS idx_activities_entity ON public.activities(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE PO REGISTRÁCII
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'sales')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- AUTO-ČÍSLOVANIE: quotes a invoices
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_year TEXT := to_char(now(), 'YYYY');
  v_seq  INTEGER;
BEGIN
  SELECT COUNT(*) + 1
  INTO v_seq
  FROM public.quotes
  WHERE to_char(created_at, 'YYYY') = v_year;

  NEW.quote_number := 'CP-' || v_year || '-' || lpad(v_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_quote_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
  EXECUTE FUNCTION public.generate_quote_number();

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_year TEXT := to_char(now(), 'YYYY');
  v_seq  INTEGER;
BEGIN
  SELECT COUNT(*) + 1
  INTO v_seq
  FROM public.invoices
  WHERE to_char(created_at, 'YYYY') = v_year;

  NEW.invoice_number := 'FA-' || v_year || '-' || lpad(v_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_invoice_number();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_import_logs ENABLE ROW LEVEL SECURITY;

-- Helper funkcia: zisti rolu prihláseného usera
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS app_role LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles: každý vidí seba, admini vidia všetkých
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.my_role() IN ('admin', 'manager'));

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.my_role() = 'admin');

-- Regions: čítajú všetci prihlásenní, píšu admini
CREATE POLICY "regions_select" ON public.regions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "regions_all"    ON public.regions FOR ALL USING (public.my_role() = 'admin');

-- Leads: všetci vidia, sales vidia len svoje
CREATE POLICY "leads_select" ON public.crm_leads FOR SELECT
  USING (
    public.my_role() IN ('admin', 'manager') OR
    assigned_user_id = auth.uid() OR
    created_by = auth.uid()
  );
CREATE POLICY "leads_insert" ON public.crm_leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "leads_update" ON public.crm_leads FOR UPDATE
  USING (
    public.my_role() IN ('admin', 'manager') OR
    assigned_user_id = auth.uid() OR
    created_by = auth.uid()
  );
CREATE POLICY "leads_delete" ON public.crm_leads FOR DELETE
  USING (public.my_role() IN ('admin', 'manager'));

-- Clients: podobne ako leads
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (public.my_role() IN ('admin', 'manager'));

-- Quotes + Items
CREATE POLICY "quotes_all"      ON public.quotes      FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "quote_items_all" ON public.quote_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Invoices + Items
CREATE POLICY "invoices_all"      ON public.invoices      FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "invoice_items_all" ON public.invoice_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Inventory
CREATE POLICY "inv_cat_select" ON public.inventory_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "inv_cat_all"    ON public.inventory_categories FOR ALL USING (public.my_role() IN ('admin', 'manager'));
CREATE POLICY "inv_items_select" ON public.inventory_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "inv_items_all"    ON public.inventory_items FOR ALL USING (public.my_role() IN ('admin', 'manager'));
CREATE POLICY "inv_res_all"      ON public.inventory_reservations FOR ALL USING (auth.uid() IS NOT NULL);

-- Activities
CREATE POLICY "activities_select" ON public.activities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "activities_insert" ON public.activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Documents
CREATE POLICY "documents_select" ON public.documents FOR SELECT
  USING (
    public.my_role() = ANY(allowed_roles) OR
    auth.uid() = ANY(allowed_user_ids) OR
    public.my_role() = 'admin'
  );
CREATE POLICY "documents_all" ON public.documents FOR ALL USING (public.my_role() IN ('admin', 'manager'));

-- Notifications: vidí len vlastné
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- Audit logs
CREATE POLICY "audit_insert"     ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_select_own" ON public.audit_logs FOR SELECT USING (user_id = auth.uid() OR public.my_role() = 'admin');

-- Lead import logs: len admini
CREATE POLICY "lead_import_all" ON public.lead_import_logs FOR ALL USING (public.my_role() = 'admin');

-- ============================================================
-- STORAGE (Documents)
-- Vytvor bucket "documents" v Supabase Dashboard → Storage
-- potom spusti toto:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
-- ON CONFLICT (id) DO NOTHING;
