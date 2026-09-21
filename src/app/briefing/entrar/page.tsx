import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { AuthCard } from "./auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar | Briefing Loê Clinic", robots: { index: false, follow: false } };

export default async function LoginPage() {
  // Só redireciona se o usuário do cookie ainda existir; um cookie de usuário
  // removido deve cair no login (senão vira loop com o redirect de /briefing).
  const session = await getSession();
  if (session && (await findUserById(session.userId))) redirect("/briefing");

  return (
    <AuthCard eyebrow="Área do briefing" title="Vamos desenhar o seu site." description="Entre com o e-mail autorizado para contar como o site da Loê deve ser.">
      <LoginForm />
    </AuthCard>
  );
}
