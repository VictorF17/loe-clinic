import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { BriefingShell } from "../shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar | Briefing Loê Clinic", robots: { index: false, follow: false } };

export default async function LoginPage() {
  // Só redireciona se o usuário do cookie ainda existir; um cookie de usuário
  // removido deve cair no login (senão vira loop com o redirect de /briefing).
  const session = await getSession();
  if (session && (await findUserById(session.userId))) redirect("/briefing");

  return (
    <BriefingShell>
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">Área do briefing</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#513427] sm:text-5xl">Vamos desenhar o seu site.</h1>
        <p className="mt-4 text-[#76594b]">Entre com o e-mail autorizado para contar como o site da Loê deve ser.</p>
        <div className="mt-8 rounded-[2rem] border border-[#7b5542]/15 bg-[#fffdfa] p-6 shadow-[0_20px_50px_rgba(93,60,42,0.08)] sm:p-8"><LoginForm /></div>
      </div>
    </BriefingShell>
  );
}
