import "server-only";

// Aceita nomes alternativos para quem guarda a credencial como variável do
// Windows com prefixo do projeto (ex.: VICTOR_DATABASE_SERVICE_ROLE_KEY).
function required(name: string, ...aliases: string[]) {
  const value = [name, ...aliases].map((key) => process.env[key]).find(Boolean);
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export const env = {
  get supabaseUrl() { return required("SUPABASE_URL"); },
  get supabaseServiceRoleKey() { return required("SUPABASE_SERVICE_ROLE_KEY", "VICTOR_DATABASE_SERVICE_ROLE_KEY"); },
  get sessionSecret() { return required("SESSION_SECRET"); },
  get projectSlug() { return process.env.BRIEFING_PROJECT_SLUG ?? "loe-clinic"; },
};
