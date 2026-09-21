// Autoriza (ou lista) e-mails que podem acessar /briefing.
//   node scripts/authorize-user.mjs                      → lista os usuários
//   node scripts/authorize-user.mjs email@x.com "Nome"   → autoriza (sem senha; ela cria no 1º acesso)
//   node scripts/authorize-user.mjs --remove email@x.com → desativa o acesso
// Lê SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ou VICTOR_DATABASE_SERVICE_ROLE_KEY) e
// BRIEFING_PROJECT_SLUG do ambiente ou de .env.local.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {}
}

const { SUPABASE_URL, BRIEFING_PROJECT_SLUG = "loe-clinic" } = process.env;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VICTOR_DATABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: project, error: projectError } = await supabase.from("projects").select("id").eq("slug", BRIEFING_PROJECT_SLUG).single();
if (projectError || !project) {
  console.error(`Projeto "${BRIEFING_PROJECT_SLUG}" não encontrado. Rode a migration site_users no Victor Database.`);
  process.exit(1);
}

const [first, second] = process.argv.slice(2);

if (first === "--remove" && second) {
  const { error } = await supabase.from("site_users").update({ active: false }).eq("project_id", project.id).eq("email", second.toLowerCase());
  if (error) throw error;
  console.log(`Acesso de ${second.toLowerCase()} desativado.`);
} else if (first) {
  const email = first.toLowerCase();
  const { error } = await supabase.from("site_users")
    .upsert({ project_id: project.id, email, name: second ?? null, active: true }, { onConflict: "project_id,email" });
  if (error) throw error;
  console.log(`${email} autorizado. A pessoa cria a senha no primeiro acesso em /briefing/entrar.`);
} else {
  const { data, error } = await supabase.from("site_users").select("email, name, active, password_hash, last_login_at").eq("project_id", project.id).order("created_at");
  if (error) throw error;
  if (!data.length) console.log("Nenhum usuário autorizado ainda.");
  for (const user of data) {
    const state = !user.active ? "desativado" : user.password_hash ? "ativo" : "aguardando senha";
    console.log(`${user.email}\t${user.name ?? "-"}\t${state}\t${user.last_login_at ?? ""}`);
  }
}
