import type { Metadata } from "next";
import Link from "next/link";

import { findUserByActivationToken } from "@/lib/users";
import { AuthCard } from "../entrar/auth-card";
import { secondaryButtonClass } from "../entrar/styles";
import { ActivateForm } from "./activate-form";

export const metadata: Metadata = { title: "Criar senha | Briefing Loê Clinic", robots: { index: false, follow: false } };

export default async function ActivatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const user = await findUserByActivationToken(token);

  if (!user) {
    return (
      <AuthCard eyebrow="Primeiro acesso" title="Este link não é mais válido." description="Links de ativação são de uso único e expiram em 48 horas. Peça um novo para continuar.">
        <Link href="/briefing/primeiro-acesso" className={secondaryButtonClass}>Pedir um novo link</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="Primeiro acesso" title="Crie a sua senha." description={`Acesso para ${user.email}. Escolha a senha que você usará para voltar ao briefing.`}>
      <ActivateForm token={token} />
    </AuthCard>
  );
}
