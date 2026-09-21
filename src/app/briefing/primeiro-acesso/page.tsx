import type { Metadata } from "next";

import { AuthCard } from "../entrar/auth-card";
import { FirstAccessForm } from "./first-access-form";

export const metadata: Metadata = { title: "Primeiro acesso | Briefing Loê Clinic", robots: { index: false, follow: false } };

export default function FirstAccessPage() {
  return (
    <AuthCard eyebrow="Primeiro acesso" title="Vamos criar a sua senha." description="Informe o e-mail que recebeu autorização. Enviaremos um link para você definir a senha.">
      <FirstAccessForm />
    </AuthCard>
  );
}
