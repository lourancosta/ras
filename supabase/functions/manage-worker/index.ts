// Supabase Edge Function: manage-worker
// Admin-only account management for Settings > Workers:
//   { action: 'create', full_name, email, password, role }
//   { action: 'update', id, full_name?, email?, role?, is_active?, password? }
//
// Why a server function: email and password live in Supabase Auth (auth.users), and
// changing them needs the secret key, which bypasses RLS and must never be in the
// browser. This code runs on Supabase's servers, where the key is an environment variable.
//
// Deploy: Supabase dashboard > Edge Functions > Deploy a new function > Via Editor,
// name it "manage-worker", paste this file, Deploy. (Or: supabase functions deploy manage-worker)
// The caller's token is checked below (auth.getUser), so the gateway's "Verify JWT"
// option can be turned off if it rejects valid tokens.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

// The browser calls this from another origin (localhost / Vercel), so it needs CORS headers.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Same rules as the form in the app (checked again here: never trust the browser).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX_LENGTH = 120 // same as the profiles.full_name check constraint
const PASSWORD_MIN_LENGTH = 8
const ROLES = ['framer', 'admin']
// Supabase Auth "ban": the login is refused until the ban ends. ~100 years = until lifted.
const BAN_FOREVER = '876000h'

type Body = Record<string, unknown>

// Each check returns an error message, or null if the value is fine.
function checkName(value: string) {
  return value && value.length <= NAME_MAX_LENGTH
    ? null
    : `Enter the worker's name (up to ${NAME_MAX_LENGTH} characters).`
}
function checkEmail(value: string) {
  return EMAIL_PATTERN.test(value) ? null : 'Enter a valid email address.'
}
function checkPassword(value: string) {
  return value.length >= PASSWORD_MIN_LENGTH
    ? null
    : `The password needs at least ${PASSWORD_MIN_LENGTH} characters.`
}
function checkRole(value: string) {
  return ROLES.includes(value) ? null : 'Choose a valid role.'
}

Deno.serve(async (req) => {
  // Browser "preflight" request before the real POST.
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  // Secret-key client: bypasses RLS, so the admin check below is the security.
  // SUPABASE_SERVICE_ROLE_KEY is provided automatically. If the project has disabled
  // legacy keys, add the secret key as a function secret named SB_SECRET_KEY instead.
  const secretKey = Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!secretKey) {
    console.error('No secret key: set SB_SECRET_KEY in the function secrets.')
    return json({ error: 'The server is not configured.' }, 500)
  }
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 1. Who is calling? The browser sends the signed-in user's token.
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return json({ error: 'Not signed in.' }, 401)
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return json({ error: 'Not signed in.' }, 401)
  const callerId = userData.user.id

  // 2. Only active admins.
  const { data: caller } = await admin.from('profiles').select('role, is_active').eq('id', callerId).single()
  if (caller?.role !== 'admin' || !caller.is_active) {
    return json({ error: 'Only admins can manage workers.' }, 403)
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  if (body.action === 'create') return createWorker(admin, body)
  if (body.action === 'update') return updateWorker(admin, callerId, body)
  return json({ error: 'Unknown action.' }, 400)
})

// ---------- create ----------
async function createWorker(admin: SupabaseClient, body: Body) {
  const fullName = String(body.full_name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const role = String(body.role ?? 'framer')

  const problem = checkName(fullName) ?? checkEmail(email) ?? checkPassword(password) ?? checkRole(role)
  if (problem) return json({ error: problem }, 400)

  // email_confirm: the admin vouches for the address, so no confirmation email is sent.
  // The on_auth_user_created trigger (0002/0004) creates the profile (name, email,
  // role 'framer', active).
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (createError) return authErrorResponse(createError)

  // The trigger always starts as framer (a user could fake metadata). The role chosen
  // by the admin is set here, after we've checked the caller is an admin.
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', created.user.id)
    .select('*')
    .single()
  if (profileError) {
    console.error('Setting role on new profile failed:', profileError)
    return json({ error: 'The account was created, but its role could not be set. Edit it to fix.' }, 500)
  }

  return json({ worker: profile }, 201)
}

// ---------- update ----------
// Only the fields present in the body change. Auth (email, password, ban) first, then
// the profile, so a duplicate email stops everything before the profile changes.
async function updateWorker(admin: SupabaseClient, callerId: string, body: Body) {
  const id = String(body.id ?? '')
  const { data: existing } = await admin.from('profiles').select('*').eq('id', id).maybeSingle()
  if (!existing) return json({ error: 'Worker not found.' }, 404)

  const profileChanges: Record<string, unknown> = {}
  const authChanges: Record<string, unknown> = {}

  if (body.full_name !== undefined) {
    const fullName = String(body.full_name).trim()
    const problem = checkName(fullName)
    if (problem) return json({ error: problem }, 400)
    profileChanges.full_name = fullName
    authChanges.user_metadata = { full_name: fullName } // keep Auth's copy in sync
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase()
    const problem = checkEmail(email)
    if (problem) return json({ error: problem }, 400)
    profileChanges.email = email
    authChanges.email = email
    authChanges.email_confirm = true // no confirmation email, same as on create
  }

  if (body.password !== undefined) {
    const password = String(body.password)
    const problem = checkPassword(password)
    if (problem) return json({ error: problem }, 400)
    authChanges.password = password
  }

  if (body.role !== undefined) {
    const role = String(body.role)
    const problem = checkRole(role)
    if (problem) return json({ error: problem }, 400)
    // Changing your own role could leave no admin to manage accounts.
    if (id === callerId && role !== existing.role) {
      return json({ error: "You can't change your own role." }, 400)
    }
    profileChanges.role = role
  }

  if (body.is_active !== undefined) {
    const isActive = body.is_active === true
    if (id === callerId && !isActive) return json({ error: "You can't deactivate your own account." }, 400)
    profileChanges.is_active = isActive
    // Inactive = can't sign in at all (ban), on top of RLS blocking new forms.
    authChanges.ban_duration = isActive ? 'none' : BAN_FOREVER
  }

  if (Object.keys(authChanges).length > 0) {
    const { error: authError } = await admin.auth.admin.updateUserById(id, authChanges)
    if (authError) return authErrorResponse(authError)
  }

  let worker = existing
  if (Object.keys(profileChanges).length > 0) {
    const { data, error } = await admin.from('profiles').update(profileChanges).eq('id', id).select('*').single()
    if (error) {
      console.error('Updating profile failed:', error)
      return json({ error: 'Could not save the changes.' }, 500)
    }
    worker = data
  }

  return json({ worker }, 200)
}

// Auth errors the admin can act on; anything else is logged and kept generic.
function authErrorResponse(error: { code?: string; message: string }) {
  if (error.code === 'email_exists') return json({ error: 'A user with this email already exists.' }, 409)
  if (error.code === 'weak_password') return json({ error: 'That password is too weak. Try a longer one.' }, 400)
  console.error('Auth admin call failed:', error)
  return json({ error: 'Could not save the account.' }, 500)
}
