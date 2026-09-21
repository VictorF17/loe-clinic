import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";

// Cliente com service role: só roda no servidor. O banco central (Victor Database)
// não tem policies de browser — toda autorização acontece aqui, no app.
let client: SupabaseClient | undefined;

export function supabaseAdmin() {
  client ??= createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

let projectId: string | undefined;

export async function getProjectId() {
  if (projectId) return projectId;
  const { data, error } = await supabaseAdmin().from("projects").select("id").eq("slug", env.projectSlug).single();
  if (error || !data) throw new Error(`Projeto "${env.projectSlug}" não encontrado no banco central.`);
  projectId = data.id as string;
  return projectId;
}
