// scripts/seed.mjs
// Seeds demo data: 1 admin, 6 framers, 5 sites, ~2 weeks of submissions
// and generated sample photos.
//
//   npm run seed          -> create users/sites; add submissions if none exist
//   npm run seed:reset    -> delete all submissions + photos, then re-create them
//
// Uses the Supabase SECRET key (bypasses RLS). Never put it in the frontend.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.seed" });

const { SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_PASSWORD = "RasDemo2026!" } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.seed");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const RESET = process.argv.includes("--reset");
const BUCKET = "submission-photos";
const TIME_ZONE = "America/Vancouver";
const DAYS_BACK = 14;

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const SITES = [
  { name: "Maple Grove Townhomes", address: "Lot 12, 168 St, Surrey, BC" },
  { name: "Cedar Heights Residences", address: "Block B, 64 Ave, Langley, BC" },
  { name: "Harbourview Lofts", address: "Phase 2, Marine Dr, North Vancouver, BC" },
  { name: "Fraser Landing Homes", address: "Lots 4-9, River Rd, Delta, BC" },
  { name: "Willow Creek Duplexes", address: "Lot 3, 200 St, Langley, BC", is_active: false },
];

const ADMIN = { email: "admin@example.com", full_name: "Dana Whitfield" };

// skipsToday: leaves some people without a form today, so the
// "who has not submitted today" summary has something to show.
const FRAMERS = [
  { email: "jake.morrison@example.com", full_name: "Jake Morrison", site: "Maple Grove Townhomes" },
  { email: "priya.sandhu@example.com", full_name: "Priya Sandhu", site: "Maple Grove Townhomes" },
  { email: "tom.becker@example.com", full_name: "Tom Becker", site: "Cedar Heights Residences" },
  { email: "luis.ortega@example.com", full_name: "Luis Ortega", site: "Cedar Heights Residences", skipsToday: true },
  { email: "mei.chen@example.com", full_name: "Mei Chen", site: "Harbourview Lofts" },
  { email: "ryan.oconnor@example.com", full_name: "Ryan O'Connor", site: "Fraser Landing Homes", skipsToday: true },
];

const CHECKS = [
  "ppe_hard_hat",
  "ppe_vest",
  "ppe_boots",
  "ppe_eye_protection",
  "fall_protection",
  "ladders_inspected",
  "tools_cords_ok",
  "hazards_identified",
];

const ISSUES = {
  ppe_hard_hat: { note: "Hard hat cracked, replacement requested.", photo: "Damaged hard hat" },
  ppe_vest: { note: "Hi-vis vest missing, borrowed one from the trailer.", photo: "PPE check" },
  ppe_boots: { note: "Boot sole worn through, supervisor notified.", photo: "PPE check" },
  ppe_eye_protection: { note: "No safety glasses on arrival, supervisor notified.", photo: "PPE check" },
  fall_protection: { note: "Guardrail missing on east side of 2nd floor. Area taped off and reported.", photo: "Hazard: open edge" },
  ladders_inspected: { note: "Extension ladder has a cracked rung. Tagged out of service.", photo: "Hazard: damaged ladder" },
  tools_cords_ok: { note: "Damaged extension cord found and removed from site.", photo: "Hazard: damaged cord" },
  hazards_identified: { note: "Hazard walk-through not done before start, completed at 9am.", photo: "Site conditions" },
};

const OK_NOTES = [
  "All clear.",
  "Wet morning, decking slippery. Took extra care.",
  "Material delivery at 10am, drop zone marked off.",
  "Windy afternoon, sheathing secured.",
  "",
  "",
];

const OK_PHOTO_LABELS = ["Site conditions", "PPE check", "Scaffold inspection", "Work area, start of shift"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Small deterministic random generator, so every run produces the same data.
let state = 42;
function rand() {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}
const chance = (p) => rand() < p;
const pick = (list) => list[Math.floor(rand() * list.length)];

// YYYY-MM-DD in Vancouver time, `offsetDays` days ago.
function localDate(offsetDays = 0) {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return d.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

function isSunday(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay() === 0;
}

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
}

function check(error, context) {
  if (error) {
    console.error(`Error while ${context}:`, error.message ?? error);
    process.exit(1);
  }
}

// Generates a simple placeholder JPEG with a label, site and date.
async function makePhoto({ label, siteName, date }) {
  const hue = Math.floor(rand() * 360);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="hsl(${hue}, 25%, 35%)"/>
      <rect x="40" y="40" width="720" height="520" fill="none" stroke="#ffffff"
            stroke-opacity="0.4" stroke-width="4" stroke-dasharray="16 12"/>
      <text x="400" y="270" font-family="Arial, sans-serif" font-size="44" font-weight="700"
            fill="#ffffff" text-anchor="middle">${escapeXml(label)}</text>
      <text x="400" y="330" font-family="Arial, sans-serif" font-size="28"
            fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${escapeXml(siteName)}</text>
      <text x="400" y="375" font-family="Arial, sans-serif" font-size="24"
            fill="#ffffff" fill-opacity="0.7" text-anchor="middle">${date} - sample photo</text>
    </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

async function getOrCreateUser({ email, full_name }, existingUsers) {
  const found = existingUsers.find((u) => u.email === email);
  if (found) return found.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name }, // the profile trigger reads this
  });
  check(error, `creating user ${email}`);
  return data.user.id;
}

async function seedUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  check(error, "listing users");

  const adminId = await getOrCreateUser(ADMIN, data.users);
  const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", adminId);
  check(roleError, "promoting admin");

  const framers = [];
  for (const framer of FRAMERS) {
    framers.push({ ...framer, id: await getOrCreateUser(framer, data.users) });
  }

  console.log(`Users ready: 1 admin, ${framers.length} framers`);
  return { adminId, framers };
}

async function seedSites() {
  const { data, error } = await supabase
    .from("sites")
    .upsert(
      SITES.map((s) => ({ is_active: true, ...s })),
      { onConflict: "name" },
    )
    .select("id, name, is_active");
  check(error, "upserting sites");

  console.log(`Sites ready: ${data.length}`);
  return data;
}

async function resetSubmissions() {
  const { data: photos, error } = await supabase.from("submission_photos").select("storage_path");
  check(error, "reading photos");

  for (let i = 0; i < photos.length; i += 100) {
    const paths = photos.slice(i, i + 100).map((p) => p.storage_path);
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
    check(removeError, "removing photo files");
  }

  // Photo rows are removed by ON DELETE CASCADE.
  const { error: deleteError } = await supabase.from("submissions").delete().not("id", "is", null);
  check(deleteError, "deleting submissions");

  console.log(`Reset: removed ${photos.length} photos and all submissions`);
}

function buildSubmissions({ adminId, framers, sites }) {
  const siteIdByName = Object.fromEntries(sites.map((s) => [s.name, s.id]));
  const activeSiteNames = sites.filter((s) => s.is_active).map((s) => s.name);
  const rows = [];

  for (let offset = DAYS_BACK - 1; offset >= 0; offset--) {
    const date = localDate(offset);
    const isToday = offset === 0;

    if (!isToday && isSunday(date)) continue; // crews work Mon-Sat

    for (const framer of framers) {
      if (isToday && framer.skipsToday) continue;
      if (!isToday && !chance(0.85)) continue; // some missed days

      const siteName = chance(0.15) ? pick(activeSiteNames) : framer.site;
      const answers = Object.fromEntries(CHECKS.map((c) => [c, !chance(0.06)]));
      const failed = CHECKS.filter((c) => !answers[c]);
      const notes = failed.length ? failed.map((c) => ISSUES[c].note).join(" ") : pick(OK_NOTES);

      // Older forms have been reviewed by the admin; recent ones are pending.
      const reviewed = offset >= 2;
      const startOfShift = Date.parse(`${date}T14:00:00Z`) + rand() * 90 * 60_000; // ~7-8:30am Pacific

      rows.push({
        meta: { siteName, failed, date },
        row: {
          user_id: framer.id,
          site_id: siteIdByName[siteName],
          work_date: date,
          ...answers,
          notes: notes || null,
          status: reviewed ? (failed.length ? "flagged" : "reviewed") : "submitted",
          reviewed_by: reviewed ? adminId : null,
          reviewed_at: reviewed ? new Date(startOfShift + 86_400_000).toISOString() : null,
          created_at: new Date(Math.min(startOfShift, Date.now())).toISOString(),
        },
      });
    }
  }

  return rows;
}

async function seedSubmissions(context) {
  const { count, error: countError } = await supabase.from("submissions").select("id", { count: "exact", head: true });
  check(countError, "counting submissions");

  if (count > 0 && !RESET) {
    console.log(`Submissions already exist (${count}). Run "npm run seed:reset" to re-create them.`);
    return;
  }
  if (RESET) await resetSubmissions();

  const items = buildSubmissions(context);
  const { data: inserted, error } = await supabase
    .from("submissions")
    .insert(items.map((i) => i.row))
    .select("id, user_id, work_date");
  check(error, "inserting submissions");

  console.log(`Submissions created: ${inserted.length}`);

  // Match inserted rows back to their metadata (one form per user per day).
  const metaByKey = new Map(items.map((i) => [`${i.row.user_id}|${i.row.work_date}`, i.meta]));
  const photoRows = [];

  for (const sub of inserted) {
    const meta = metaByKey.get(`${sub.user_id}|${sub.work_date}`);
    const labels = meta.failed.length
      ? [ISSUES[meta.failed[0]].photo] // forms with an issue always get a photo
      : chance(0.4)
        ? Array.from({ length: chance(0.5) ? 2 : 1 }, () => pick(OK_PHOTO_LABELS))
        : [];

    for (const label of labels) {
      const buffer = await makePhoto({ label, siteName: meta.siteName, date: meta.date });
      const path = `${sub.user_id}/${sub.id}/${randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: "image/jpeg" });
      check(uploadError, `uploading ${path}`);

      photoRows.push({
        submission_id: sub.id,
        storage_path: path,
        mime_type: "image/jpeg",
        size_bytes: buffer.length,
      });
      process.stdout.write(`\rPhotos uploaded: ${photoRows.length}`);
    }
  }

  if (photoRows.length) {
    const { error: photoError } = await supabase.from("submission_photos").insert(photoRows);
    check(photoError, "inserting photo rows");
  }
  console.log(`\nPhotos created: ${photoRows.length}`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const { adminId, framers } = await seedUsers();
const sites = await seedSites();
await seedSubmissions({ adminId, framers, sites });

console.log("\nTest credentials (password for all):", SEED_PASSWORD);
console.log(`  Admin:  ${ADMIN.email}`);
for (const f of FRAMERS) console.log(`  Framer: ${f.email}`);
