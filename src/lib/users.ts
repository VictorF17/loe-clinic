import "server-only";
import { createHash, randomBytes } from "node:crypto";
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
export const ACTIVATION_HOURS = 48;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
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

/**
 * Gera um token de ativação de uso único para um usuário convidado (sem senha)
 * e guarda só o hash. Devolve o token bruto para compor o link.
 */
export async function createActivationToken(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ACTIVATION_HOURS * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin().from("site_users")
    .update({ activation_token_hash: hashToken(token), activation_expires_at: expiresAt })
    .eq("id", userId).is("password_hash", null);
  if (error) throw new Error("Não foi possível gerar o link de ativação.");
  return token;
}

/** Usuário convidado dono de um token válido e não expirado, ou null. */
export async function findUserByActivationToken(token: string) {
  if (!token) return null;
  const { data } = await supabaseAdmin().from("site_users").select(`${columns}, activation_expires_at`)
    .eq("project_id", await getProjectId()).eq("activation_token_hash", hashToken(token))
    .eq("active", true).is("password_hash", null).maybeSingle();
  const user = data as (SiteUser & { activation_expires_at: string | null }) | null;
  if (!user?.activation_expires_at || new Date(user.activation_expires_at) < new Date()) return null;
  return user;
}

/** Define a senha no primeiro acesso e invalida o token. */
export async function activateUser(userId: string, passwordHash: string) {
  const { error } = await supabaseAdmin().from("site_users")
    .update({ password_hash: passwordHash, activation_token_hash: null, activation_expires_at: null, last_login_at: new Date().toISOString() })
    .eq("id", userId).is("password_hash", null);
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
