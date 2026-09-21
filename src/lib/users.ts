import "server-only";
import { redirect } from "next/navigation";

import { getSession } from "./session";
import { getProjectId, supabaseAdmin } from "./supabase-admin";

export type SiteUser = {
  id: string;
  project_id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  active: boolean;
};

const columns = "id, project_id, email, name, password_hash, active";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Usuário autorizado (pré-cadastrado) deste projeto, ou null. */
export async function findAuthorizedUser(email: string) {
  const { data } = await supabaseAdmin().from("site_users").select(columns)
    .eq("project_id", await getProjectId()).eq("email", normalizeEmail(email)).eq("active", true).maybeSingle();
  return (data as SiteUser | null) ?? null;
}

export async function findUserById(id: string) {
  const { data } = await supabaseAdmin().from("site_users").select(columns)
    .eq("id", id).eq("project_id", await getProjectId()).eq("active", true).maybeSingle();
  return (data as SiteUser | null) ?? null;
}

export async function setPassword(userId: string, passwordHash: string) {
  const { error } = await supabaseAdmin().from("site_users")
    .update({ password_hash: passwordHash, last_login_at: new Date().toISOString() }).eq("id", userId).is("password_hash", null);
  if (error) throw new Error("Não foi possível salvar a senha.");
}

export async function touchLogin(userId: string) {
  await supabaseAdmin().from("site_users").update({ last_login_at: new Date().toISOString() }).eq("id", userId);
}

/** Usuário da sessão atual; redireciona para o login se não houver. */
export async function requireUser() {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;
  if (!user) redirect("/briefing/entrar");
  return user;
}
