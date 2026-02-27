'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { z } from 'zod'

// ─── Rate Limiter (in-memory, per IP) ────────────────────────────────────────
// Max 5 attempts per IP per 60 seconds
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000 // 60 sekúnd

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, retryAfterSeconds: 0 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, retryAfterSeconds: 0 }
}

// ─── Cooldown per email (min. 2s between attempts) ────────────────────────────
const cooldownStore = new Map<string, number>() // email -> last attempt timestamp
const LOGIN_COOLDOWN_MS = 2_000 // 2 sekundy

function checkCooldown(email: string): { allowed: boolean; waitMs: number } {
  const now = Date.now()
  const lastAttempt = cooldownStore.get(email)

  if (lastAttempt && now - lastAttempt < LOGIN_COOLDOWN_MS) {
    const waitMs = LOGIN_COOLDOWN_MS - (now - lastAttempt)
    return { allowed: false, waitMs }
  }

  cooldownStore.set(email, now)
  return { allowed: true, waitMs: 0 }
}

// ─── Input validation (Zod) ───────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Neplatný formát emailu').max(255),
  password: z.string().min(6, 'Heslo musí mať aspoň 6 znakov').max(128),
})

// ─── Helper: get real IP ──────────────────────────────────────────────────────
async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  )
}

// ─── Helper: write audit log ──────────────────────────────────────────────────
async function writeAuditLog(
  action: 'login_success' | 'login_failed' | 'login_rate_limited' | 'login_cooldown',
  details: { email?: string; ip: string; userAgent?: string; userId?: string }
) {
  try {
    const supabase = await createClient()
    await supabase.from('audit_logs').insert({
      action,
      entity_type: 'auth',
      user_id: details.userId || null,
      details: {
        email: details.email,
        ip: details.ip,
        user_agent: details.userAgent,
      },
    })
  } catch {
    // Never block login due to audit log failure
    console.error('[audit] Failed to write audit log')
  }
}

// ─── Login Action ─────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const supabase = await createClient()
  const ip = await getClientIp()
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined

  // 1. Rate limit check
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    await writeAuditLog('login_rate_limited', { ip, userAgent })
    redirect(
      `/login?message=Príliš veľa pokusov. Počkajte ${rateLimit.retryAfterSeconds} sekúnd.`
    )
  }

  // 2. Validate input
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    redirect('/login?message=Neplatné prihlasovacie údaje')
  }

  const { email, password } = parsed.data

  // 3. Cooldown check (per email, min 2s between attempts)
  const cooldown = checkCooldown(email)
  if (!cooldown.allowed) {
    await writeAuditLog('login_cooldown', { email, ip, userAgent })
    redirect('/login?message=Počkajte prosím pred ďalším pokusom o prihlásenie.')
  }

  // 4. Attempt login
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    await writeAuditLog('login_failed', { email, ip, userAgent })
    redirect('/login?message=Nesprávny E-mail alebo heslo')
  }

  // 5. Success
  await writeAuditLog('login_success', { email, ip, userAgent, userId: data.user.id })

  revalidatePath('/', 'layout')
  redirect('/app/dashboard')
}

// ─── Signup Action ────────────────────────────────────────────────────────────
export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Získame dáta z formulára
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string || 'sales'

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Používame full_name podľa profilov
        role: role,
      }
    }
  }

  // 1. Vytvorenie auth user
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('[signup] Error creating user:', error)
    redirect('/login?message=Chyba pri registrácii. ' + error.message)
  }

  // 2. Vytvorenie záznamu v profiles tabuľke
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('[signup] Error creating profile:', profileError)
      // V prípade bežného users toto môže zlyhať na RLS,
      // Ideálne by bolo použiť service_role klienta,
      // ale aspoň sme sa o to pokúsili. Používateľ sa aj tak môže prihlásiť
      // a AuthContext sa pokúsi profil "opraviť" (self-healing).
    }
  }

  revalidatePath('/', 'layout')
  redirect('/app/dashboard')
}
