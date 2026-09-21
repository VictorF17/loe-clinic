// Autoriza (ou lista) e-mails que podem acessar /briefing.
//   node scripts/authorize-user.mjs                      → lista os usuários
//   node scripts/authorize-user.mjs email@x.com "Nome"   → autoriza e imprime o link de ativação
//   node scripts/authorize-user.mjs --link email@x.com   → gera um novo link de ativação (48 h)
//   node scripts/authorize-user.mjs --reset email@x.com  → apaga a senha atual e gera link para criar outra
//   node scripts/authorize-user.mjs --remove email@x.com → desativa o acesso
// Lê SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ou VICTOR_DATABASE_SERVICE_ROLE_KEY),
// BRIEFING_PROJECT_SLUG e SITE_URL do ambiente ou de .env.local.
//
// Enquanto o envio de e-mail não estiver ligado (EMAIL_PROVIDER=noop), o link
// impresso aqui é o jeito de entregar o primeiro acesso à pessoa (ex.: WhatsApp).
import { createHash, randomBytes } from "node:crypto";
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

const { SUPABASE_URL, BRIEFING_PROJECT_SLUG = "loe-clinic", SITE_URL = "https://loe-clinic.vercel.app" } = process.env;
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

const ACTIVATION_HOURS = 48;

async function activationLink(email) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + ACTIVATION_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from("site_users")
    .update({ activation_token_hash: tokenHash, activation_expires_at: expiresAt })
    .eq("project_id", project.id).eq("email", email).eq("active", true).is("password_hash", null).select("id");
  if (error) throw error;
  if (!data.length) return null;
  return `${SITE_URL}/briefing/ativar?token=${token}`;
}

const [first, second] = process.argv.slice(2);

if (first === "--remove" && second) {
  const { error } = await supabase.from("site_users").update({ active: false }).eq("project_id", project.id).eq("email", second.toLowerCase());
  if (error) throw error;
  console.log(`Acesso de ${second.toLowerCase()} desativado.`);
} else if (first === "--reset" && second) {
  const email = second.toLowerCase();
  const { data, error } = await supabase.from("site_users").update({ password_hash: null })
    .eq("project_id", project.id).eq("email", email).eq("active", true).select("id");
  if (error) throw error;
  if (!data.length) { console.log("E-mail não encontrado ou desativado."); process.exit(1); }
  const link = await activationLink(email);
  console.log(`Senha de ${email} apagada. Link para criar a nova (válido por ${ACTIVATION_HOURS} h):\n${link}`);
} else if (first === "--link" && second) {
  const link = await activationLink(second.toLowerCase());
  console.log(link ? `Link de ativação (válido por ${ACTIVATION_HOURS} h):\n${link}` : "Esse e-mail não está aguardando primeiro acesso (não existe, está desativado ou já tem senha).");
} else if (first) {
  const email = first.toLowerCase();
  const { error } = await supabase.from("site_users")
    .upsert({ project_id: project.id, email, name: second ?? null, active: true }, { onConflict: "project_id,email" });
  if (error) throw error;
  const link = await activationLink(email);
  console.log(`${email} autorizado.`);
  console.log(link ? `Link de ativação para enviar à pessoa (válido por ${ACTIVATION_HOURS} h):\n${link}` : "Já tinha senha definida — pode entrar normalmente em /briefing/entrar.");
} else {
  const { data, error } = await supabase.from("site_users").select("email, name, active, password_hash, activation_expires_at, last_login_at").eq("project_id", project.id).order("created_at");
  if (error) throw error;
  if (!data.length) console.log("Nenhum usuário autorizado ainda.");
  for (const user of data) {
    const state = !user.active ? "desativado" : user.password_hash ? "ativo" : "aguardando primeiro acesso";
    console.log(`${user.email}\t${user.name ?? "-"}\t${state}\t${user.last_login_at ?? ""}`);
  }
}
