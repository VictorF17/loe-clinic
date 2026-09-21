"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";

import { login, type LoginState } from "./actions";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "./styles";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">E-mail
        <input name="email" type="email" autoComplete="email" required defaultValue={state.email ?? ""} className={inputClass} placeholder="voce@exemplo.com" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">Senha
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} placeholder="sua senha" />
      </label>
      {state.error && <p role="alert" className="text-sm text-[#a23e2d]">{state.error}</p>}
      <button type="submit" disabled={pending} className={`mt-2 ${primaryButtonClass}`}>
        {pending ? "Entrando…" : <>Entrar <ArrowRight className="size-4" /></>}
      </button>
      <div className="mt-1 border-t border-[#7b5542]/15 pt-4">
        <p className="mb-3 text-xs leading-relaxed text-[#a8907f]">Recebeu acesso e ainda não tem senha? Comece por aqui.</p>
        <Link href="/briefing/primeiro-acesso" className={secondaryButtonClass}><KeyRound className="size-4" /> Primeiro acesso</Link>
      </div>
    </form>
  );
}
